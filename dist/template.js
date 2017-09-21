///<reference path="../node_modules/@types/node/index.d.ts"/>
/**
 * Passbook are created from templates
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var URL = require("url-parse");
var fs_1 = require("fs");
var promisify = require("es6-promisify");
var colorString = require("color-string");
var images_1 = require("./lib/images");
var pass_1 = require("./pass");
var constants_1 = require("./constants");
var entries = require("object.entries");
var includes = require("array-includes");
var path_1 = require("path");
var readFileAsync = promisify(fs_1.readFile);
var statAsync = promisify(fs_1.stat);
// Create a new template.
//
// style  - Pass style (coupon, eventTicket, etc)
// fields - Pass fields (passTypeIdentifier, teamIdentifier, etc)
var Template = /** @class */ (function () {
    function Template(style, fields) {
        if (fields === void 0) { fields = {}; }
        var _this = this;
        this.style = style;
        this.fields = fields;
        if (!includes(constants_1.PASS_STYLES, style)) {
            throw new Error("Unsupported pass style " + style);
        }
        this.style = style;
        this.fields = {};
        // we will set all fields via class setters, as in the future we will implement strict validators
        // values validation: https://developer.apple.com/library/content/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/TopLevel.html
        entries(fields).forEach(function (_a) {
            var field = _a[0], value = _a[1];
            if (typeof _this[field] === 'function')
                _this[field](value);
        });
        if (style in fields) {
            Object.assign(this.fields, (_a = {}, _a[style] = fields[style], _a));
        }
        this.keysPath = 'keys';
        this.password = null;
        this.apn = null;
        this.images = new images_1.PassImages();
        Object.preventExtensions(this);
        var _a;
    }
    /**
     * Loads Template, images and key from a given path
     *
     * @static
     * @param {string} folderPath
     * @param {string} keyPassword - optional key password
     * @returns {Template}
     * @throws - if given folder doesn't contain pass.json or it is's in invalid format
     * @memberof Template
     */
    Template.load = function (folderPath, keyPassword) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var stats, passJson, _a, _b, type, template, typeIdentifier, keyName, keyStat, _1;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, statAsync(folderPath)];
                    case 1:
                        stats = _c.sent();
                        if (!stats.isDirectory()) {
                            throw new Error('No template folder found');
                        }
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, readFileAsync(path_1.join(folderPath, 'pass.json'))];
                    case 2:
                        passJson = _b.apply(_a, [_c.sent()]);
                        if (!constants_1.PASS_STYLES.some(function (t) {
                            if (t in passJson) {
                                type = t;
                                return true;
                            }
                            return false;
                        })) {
                            throw new Error('Unknown pass style!');
                        }
                        template = new Template(type, passJson);
                        // load images from the same folder
                        return [4 /*yield*/, template.images.loadFromDirectory(folderPath)
                            // checking if there is a key - must be named ${passTypeIdentifier}.pem
                        ];
                    case 3:
                        // load images from the same folder
                        _c.sent();
                        typeIdentifier = passJson.passTypeIdentifier;
                        keyName = typeIdentifier.replace(/^pass\./, '') + ".pem";
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, statAsync(path_1.join(folderPath, keyName))];
                    case 5:
                        keyStat = _c.sent();
                        if (keyStat.isFile())
                            template.keys(folderPath, keyPassword);
                        return [3 /*break*/, 7];
                    case 6:
                        _1 = _c.sent();
                        return [3 /*break*/, 7];
                    case 7: 
                    // done
                    return [2 /*return*/, template];
                }
            });
        });
    };
    /**
     * Validates if given string is a correct color value for Pass fields
     *
     * @static
     * @param {string} value - a CSS color value, like 'red', '#fff', etc
     * @throws - if value is invalid this function will throw
     * @returns {string} - value converted to "rgb(222, 33, 22)" string
     * @memberof Template
     */
    Template.convertToRgb = function (value) {
        var rgb = colorString.get.rgb(value);
        if (rgb === null)
            throw new Error("Invalid color value " + value);
        // convert to rgb(), stripping alpha channel
        return colorString.to.rgb(rgb.slice(0, 3));
    };
    // pushUpdates (pushToken) {
    //   if (!this.apn) {
    //     // creating APN Provider
    //     const identifier = this.passTypeIdentifier().replace(/^pass./, '')
    //     const key = path.resolve(this.keysPath, `${identifier}.pem`)
    //
    //     this.apn = new apn.Provider({
    //       production: true,
    //       cert: key /* Certificate file path - we have both in the same file */,
    //       key /* Key file path */,
    //       passphrase: this.password
    //     })
    //   }
    //   // sending notification
    //   const note = new apn.Notification()
    //   note.payload = {} // payload must be empty
    //   return this.apn.send(note, pushToken)
    // }
    Template.prototype.passTypeIdentifier = function (v) {
        if (arguments.length === 1) {
            this.fields.passTypeIdentifier = v;
            return this;
        }
        return this.fields.passTypeIdentifier;
    };
    Template.prototype.teamIdentifier = function (v) {
        if (arguments.length === 1) {
            this.fields.teamIdentifier = v;
            return this;
        }
        return this.fields.teamIdentifier;
    };
    Template.prototype.description = function (v) {
        if (arguments.length === 1) {
            this.fields.description = v;
            return this;
        }
        return this.fields.description;
    };
    Template.prototype.backgroundColor = function (v) {
        if (arguments.length === 1) {
            this.fields.backgroundColor = Template.convertToRgb(v);
            return this;
        }
        return this.fields.backgroundColor;
    };
    Template.prototype.foregroundColor = function (v) {
        if (arguments.length === 1) {
            this.fields.foregroundColor = Template.convertToRgb(v);
            return this;
        }
        return this.fields.foregroundColor;
    };
    Template.prototype.labelColor = function (v) {
        if (arguments.length === 1) {
            this.fields.labelColor = Template.convertToRgb(v);
            return this;
        }
        return this.fields.labelColor;
    };
    Template.prototype.logoText = function (v) {
        if (arguments.length === 1) {
            this.fields.logoText = v;
            return this;
        }
        return this.fields.logoText;
    };
    Template.prototype.organizationName = function (v) {
        if (arguments.length === 1) {
            this.fields.organizationName = v;
            return this;
        }
        return this.fields.organizationName;
    };
    Template.prototype.groupingIdentifier = function (v) {
        if (arguments.length === 1) {
            this.fields.groupingIdentifier = v;
            return this;
        }
        return this.fields.groupingIdentifier;
    };
    /**
     * sets or gets suppressStripShine
     *
     * @param {boolean?} v
     * @returns {Template | boolean}
     * @memberof Template
     */
    Template.prototype.suppressStripShine = function (v) {
        if (arguments.length === 1) {
            if (typeof v !== 'boolean') {
                throw new Error('suppressStripShine value must be a boolean!');
            }
            this.fields.suppressStripShine = v;
            return this;
        }
        return this.fields.suppressStripShine;
    };
    /**
     * gets or sets webServiceURL
     *
     * @param {URL | string} v
     * @returns {Template | string}
     * @memberof Template
     */
    Template.prototype.webServiceURL = function (v) {
        if (arguments.length === 1) {
            // validating URL, it will throw on bad value
            var url = v instanceof URL ? v : new URL(v);
            if (url.protocol !== 'https:') {
                throw new Error("webServiceURL must be on HTTPS!");
            }
            this.fields.webServiceURL = url.toString();
            return this;
        }
        return this.fields.webServiceURL;
    };
    /**
     * Sets path to directory containing keys and password for accessing keys.
     *
     * @param {string} path - Path to directory containing key files (default is 'keys')
     * @param {string} password - Password to use with keys
     * @memberof Template
     */
    Template.prototype.keys = function (path, password) {
        if (path)
            this.keysPath = path;
        if (password)
            this.password = password;
    };
    /**
     * Create a new pass from a template.
     *
     * @param {Object} fields
     * @returns {Pass}
     * @memberof Template
     */
    Template.prototype.createPass = function (fields) {
        if (fields === void 0) { fields = {}; }
        // Combine template and pass fields
        return new pass_1.Pass(this, Object.assign({}, this.fields, fields), this.images);
    };
    return Template;
}());
exports.Template = Template;
