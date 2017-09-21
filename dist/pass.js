// Generate a pass file.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var events_1 = require("events");
var Path = require("path");
var stream_1 = require("stream");
var entries = require("object.entries");
var values = require("object.values");
var zip_1 = require("./lib/zip");
var images_1 = require("./lib/images");
var SHAWriteStream_1 = require("./lib/SHAWriteStream");
var w3cdate_1 = require("./lib/w3cdate");
var pipe_into_stream_1 = require("./lib/pipe-into-stream");
var fields_1 = require("./lib/fields");
var signManifest_forge_1 = require("./lib/signManifest-forge");
var includes = require("array-includes");
var constants = require("./constants");
var REQUIRED_IMAGES = entries(constants.IMAGES)
    .filter(function (_a) {
    var required = _a[1].required;
    return required;
})
    .map(function (_a) {
    var imageType = _a[0];
    return imageType;
});
// Create a new pass.
//
// template  - The template
// fields    - Pass fields (description, serialNumber, logoText)
var Pass = /** @class */ (function (_super) {
    tslib_1.__extends(Pass, _super);
    function Pass(template, fields, images) {
        if (fields === void 0) { fields = {}; }
        var _this = _super.call(this) || this;
        _this.template = template;
        _this.fields = fields;
        _this.images = images;
        _this.fields = Object.assign({}, fields);
        // Structure is basically reference to all the fields under a given style
        // key, e.g. if style is coupon then structure.primaryFields maps to
        // fields.coupon.primaryFields.
        var style = template.style;
        _this.structure = _this.fields[style];
        if (!_this.structure)
            _this.structure = _this.fields[style] = {};
        _this.images = new images_1.PassImages();
        if (images)
            Object.assign(_this.images, images);
        // For localizations support
        _this.localizations = {};
        // Accessor methods for top-level fields (description, serialNumber,
        // logoText, etc).  Call with an argument to set field and return self,
        // call with no argument to get field value.
        // pass.description("Unbelievable discount");
        // console.log(pass.description());
        entries(constants.TOP_LEVEL_FIELDS).forEach(function (_a) {
            var key = _a[0], type = _a[1].type;
            if (typeof _this[key] !== 'function') {
                _this[key] = function set(v) {
                    if (arguments) {
                        if (type === Array && !Array.isArray(v)) {
                            throw new Error(key + " must be an Array!");
                        }
                        this.fields[key] = v;
                        return this;
                    }
                    return this.fields[key];
                };
            }
        });
        // Accessor methods for structure fields (primaryFields, backFields, etc).
        //
        // For example:
        //
        //   pass.headerFields.add("time", "The Time", "10:00AM");
        //   pass.backFields.add("url", "Web site", "http://example.com");
        constants.STRUCTURE_FIELDS.forEach(function (key) {
            if (!(key in _this)) {
                Object.defineProperty(_this, key, {
                    writable: false,
                    enumerable: true,
                    value: new fields_1.Fields(_this, key)
                });
            }
        });
        Object.preventExtensions(_this);
        return _this;
    }
    /**
     * Returns normalized geopoint object from geoJSON, {lat, lng} or
     * {lattitude,longutude,altitude}
     *
     * @param {number[] | { lat: number, lng: number, alt?: number } | {
     *     longitude: number, latitude: number, altitude?: number }} point
     * @returns {{ longitude: number, latitude: number, altitude: number }}
     * @throws on unknown point format
     * @memberof Pass
     */
    Pass.getGeoPoint = function (point) {
        if (!point)
            throw new Error('Can\'t get coordinates from undefined');
        // GeoJSON Array [longitude, latitude(, elevation)]
        if (Array.isArray(point)) {
            if (point.length < 2 || !point.every(function (n) { return Number.isFinite(n); })) {
                throw new Error("Invalid GeoJSON array of numbers, length must be 2 to 3, received " + point.length);
            }
            return {
                longitude: point[0],
                latitude: point[1],
                altitude: point[2]
            };
        }
        // it can be an object with both lat and lng properties
        if ('lat' in point && 'lng' in point) {
            return {
                longitude: point.lng,
                latitude: point.lat,
                altitude: point.alt
            };
        }
        if ('longitude' in point && 'latitude' in point) {
            // returning a copy
            return {
                longitude: point.longitude,
                latitude: point.latitude,
                altitude: point.altitude || point.elevation
            };
        }
        // If we are here it means we can't understand what a hell is it
        throw new Error("Unknown geopoint format: " + JSON.stringify(point));
    };
    Pass.prototype.transitType = function (v) {
        if (arguments.length === 1) {
            // setting transit type
            // only allowed at boardingPass
            if (this.template.style !== 'boardingPass') {
                throw new Error('transitType field is only allowed at boarding passes');
            }
            if (!values(constants.TRANSIT).includes(v)) {
                throw new Error("Unknown value " + v + " for transit type");
            }
            this.structure.transitType = v;
            return this;
        }
        // getting value
        return this.structure.transitType;
    };
    /**
     * Date and time when the pass expires.
     *
     * @param {string | Date} v - value to set
     * @returns {Pass | string}
     * @throws when passed value can't be interpreted as W3C string
     * @memberof Pass
     */
    Pass.prototype.expirationDate = function (v) {
        if (arguments.length === 1) {
            this.fields.expirationDate = w3cdate_1.getW3CDateString(v);
            return this;
        }
        return this.fields.expirationDate;
    };
    /**
     *  Indicates that the pass is void—for example, a one time use coupon that
     * has been redeemed.
     *
     * @param {boolean} v
     * @returns {Pass | boolean}
     * @memberof Pass
     */
    Pass.prototype.voided = function (v) {
        if (arguments.length === 1) {
            if (v)
                this.fields.voided = true;
            else
                delete this.fields.voided;
            return this;
        }
        return !!this.fields.voided;
    };
    /**
     * Date and time when the pass becomes relevant. For example, the start time
     * of a movie. Recommended for event tickets and boarding passes; otherwise
     * optional.
     *
     * @param {string | Date} v - value to set
     * @returns {Pass | string}
     * @throws when passed value can't be interpreted as W3C string
     * @memberof Pass
     */
    Pass.prototype.relevantDate = function (v) {
        if (arguments.length === 1) {
            this.fields.relevantDate = w3cdate_1.getW3CDateString(v);
            return this;
        }
        return this.fields.relevantDate;
    };
    /**
     * Maximum distance in meters from a relevant latitude and longitude that the
     * pass is relevant. This number is compared to the pass’s default distance
     * and the smaller value is used.
     *
     * @param {number} v - distance in meters
     * @returns {Pass | number}
     * @memberof Pass
     */
    Pass.prototype.maxDistance = function (v) {
        if (arguments.length === 1) {
            if (!Number.isInteger(v) || v <= 0) {
                throw new Error('Number must be a positive integer distance in meters!');
            }
            this.fields.maxDistance = v;
            return this;
        }
        return this.fields.maxDistance;
    };
    /**
     * Adds a location where a pass is relevant.
     *
     * @param {number[] | { lat: number, lng: number, alt?: number } | {
     *     longitude: number, latitude: number, altitude?: number }} point
     * @param {string} relevantText
     * @returns {Pass}
     * @memberof Pass
     */
    Pass.prototype.addLocation = function (point, relevantText) {
        if (!Array.isArray(this.fields.locations))
            this.fields.locations = [];
        var _a = Pass.getGeoPoint(point), longitude = _a.longitude, latitude = _a.latitude, altitude = _a.altitude;
        this.fields.locations.push({
            longitude: longitude,
            latitude: latitude,
            altitude: altitude,
            relevantText: relevantText
        });
        return this;
    };
    /**
     * Gets or sets Pass barcodes field
     *
     * @param {Array.<{format: string, message: string, messageEncoding:
     *     string}>} v
     */
    Pass.prototype.barcodes = function (v) {
        if (arguments.length === 1) {
            if (!Array.isArray(v))
                throw new Error('barcodes must be an Array!');
            // Barcodes dictionary:
            // https://developer.apple.com/library/content/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/LowerLevel.html#//apple_ref/doc/uid/TP40012026-CH3-SW3
            v.forEach(function (barcode) {
                if (!includes([
                    'PKBarcodeFormatQR',
                    'PKBarcodeFormatPDF417',
                    'PKBarcodeFormatAztec',
                    'PKBarcodeFormatCode128'
                ], barcode.format)) {
                    throw new Error("Barcode format value " + barcode.format + " is invalid!");
                }
                if (typeof barcode.message !== 'string') {
                    throw new Error('Barcode message string is required');
                }
                if (typeof barcode.messageEncoding !== 'string') {
                    throw new Error('Barcode messageEncoding is required');
                }
            });
            // copy array
            this.fields.barcodes = v.slice();
            // set backward compatibility field
            Object.assign(this.fields, { barcode: v[0] });
            return this;
        }
        return this.fields.barcodes;
    };
    // Localization
    Pass.prototype.addLocalization = function (lang, values) {
        // map, escaping the " symbol
        this.localizations[lang] =
            (lang in this.localizations ? this.localizations[lang] + "\n" : '') +
                entries(values)
                    .map(function (_a) {
                    var originalStr = _a[0], translatedStr = _a[1];
                    return "\"" + originalStr + "\" = \"" + translatedStr.replace(/"/g, '\\"') + "\";";
                })
                    .join('\n');
    };
    // Validate pass, throws error if missing a mandatory top-level field or
    // image.
    Pass.prototype.validate = function () {
        var _this = this;
        entries(constants.TOP_LEVEL_FIELDS).some(function (_a) {
            var field = _a[0], required = _a[1].required;
            if (required && !(field in _this.fields)) {
                throw new Error("Missing field " + field);
            }
            return false;
        });
        // authenticationToken && webServiceURL must be either both or none
        if ('webServiceURL' in this.fields) {
            if (!('authenticationToken' in this.fields)) {
                throw new Error('While webServiceURL is present, authenticationToken also required!');
            }
            if (this.fields.authenticationToken.length < 16) {
                throw new Error('authenticationToken must be at least 16 characters long!');
            }
        }
        else if ('authenticationToken' in this.fields) {
            throw new Error('authenticationToken is presented in Pass data while webServiceURL is missing!');
        }
        // validate color fields
        // valid values must be like rgb(123, 2, 22)
        Object.keys(constants.TOP_LEVEL_FIELDS)
            .filter(function (v) { return v.endsWith('Color'); })
            .filter(function (v) { return v in _this.fields; })
            .forEach(function (colorFieldName) {
            var value = _this.fields[colorFieldName];
            try {
                /^rgb\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)$/
                    .exec(value)
                    .slice(1)
                    .map(function (v) { return parseInt(v, 10); })
                    .some(function (v) {
                    if (isNaN(v) || v < 0 || v > 255) {
                        throw new Error("Invalid color value " + value);
                    }
                    return false;
                });
            }
            catch (e) {
                throw new Error("Color value \"" + value + "\" for field \"" + colorFieldName + "\" is invalid, must be an rgb(...)");
            }
        });
        REQUIRED_IMAGES.some(function (image) {
            if (!_this.images.map.has(image)) {
                throw new Error("Missing image " + image + ".png");
            }
            return false;
        });
    };
    // Returns the pass.json object (not a string).
    Pass.prototype.getPassJSON = function () {
        return Object.assign({}, this.fields, { formatVersion: 1 });
    };
    /**
     * Pipe pass to a write stream.
     *
     * @param {Writable} output - Write stream
     * @memberof Pass
     */
    Pass.prototype.pipe = function (output) {
        var _this = this;
        var zip = new zip_1.Zip(output);
        var lastError;
        zip.on('error', function (error) {
            lastError = error;
        });
        // Validate before attempting to create
        try {
            this.validate();
        }
        catch (error) {
            setImmediate(function () {
                _this.emit('error', error);
            });
            return;
        }
        // Construct manifest here
        var manifest = {};
        /**
         * Add file to zip and it's SHA to manifest
         *
         * @param {string} filename
         * @returns {SHAWriteStream}
         */
        var addFile = function (filename) {
            return new SHAWriteStream_1.SHAWriteStream(manifest, filename, zip.addFile(filename));
        };
        var doneWithImages = function () {
            if (lastError) {
                zip.close();
                _this.emit('error', lastError);
            }
            else {
                setImmediate(function () {
                    _this.signZip(zip, manifest, function (error) {
                        if (error) {
                            return _this.emit('error', error);
                        }
                        zip.close();
                        zip.on('end', function () {
                            _this.emit('end');
                        });
                        zip.on('error', function (err) {
                            _this.emit('error', err);
                        });
                    });
                });
            }
        };
        // Create pass.json
        var passJson = Buffer.from(JSON.stringify(this.getPassJSON()), 'utf-8');
        addFile('pass.json').end(passJson, 'utf8');
        // Localization
        entries(this.localizations).forEach(function (_a) {
            var lang = _a[0], strings = _a[1];
            addFile(lang + ".lproj/pass.strings").end(Buffer.from(strings), 'utf-16');
        });
        var expecting = 0;
        this.images.map.forEach(function (imageVariants, imageType) {
            imageVariants.forEach(function (file, density) {
                var filename = "" + imageType + (density !== '1x'
                    ? "@" + density
                    : '') + ".png";
                pipe_into_stream_1.pipeIntoStream(addFile(filename), file, function (error) {
                    --expecting;
                    if (error)
                        lastError = error;
                    if (expecting === 0)
                        doneWithImages();
                });
                ++expecting;
            });
        });
    };
    /**
     * Use this to send pass as HTTP response.
     * Adds appropriate headers and pipes pass to response.
     *
     * @param {http.response} response - HTTP response
     * @memberof Pass
     */
    Pass.prototype.render = function (response) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            response.setHeader('Content-Type', constants.PASS_MIME_TYPE);
            _this.on('error', reject);
            _this.on('end', resolve);
            _this.pipe(response);
        });
    };
    /**
     * Returns the Pass as a Readable strem
     *
     * @returns {Stream}
     * @memberof Pass
     */
    Pass.prototype.stream = function () {
        var stream = new stream_1.PassThrough();
        this.pipe(stream);
        return stream;
    };
    /**
     * Add manifest.json and signature files.
     *
     * @param {Zip} zip
     * @param {Object} manifest
     * @param {Function} callback
     * @memberof Pass
     */
    Pass.prototype.signZip = function (zip, manifest, callback) {
        var json = JSON.stringify(manifest);
        // Add manifest.json
        zip.addFile('manifest.json').end(json, 'utf-8');
        // Create signature
        var identifier = this.template.passTypeIdentifier().replace(/^pass./, '');
        signManifest_forge_1.signManifest(Path.resolve(this.template.keysPath, identifier + ".pem"), this.template.password, json, function (error, signature) {
            if (!error) {
                // Write signature file
                zip.addFile('signature').end(signature);
            }
            callback(error);
        });
    };
    return Pass;
}(events_1.EventEmitter));
exports.Pass = Pass;
