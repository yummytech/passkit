/**
 * Base PassImages class to add image filePath manipulation
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var includes = require("array-includes");
var fs_1 = require("fs");
var promisify = require("es6-promisify");
var path_1 = require("path");
// Supported images.
var constants = require("../constants");
var readdirAsync = promisify(fs_1.readdir);
var statAsync = promisify(fs_1.stat);
var PassImages = /** @class */ (function () {
    function PassImages() {
        var _this = this;
        // Creating this way to make it invisible
        this.map = new Map();
        // define setters and getters for particular images
        Object.keys(constants.IMAGES).forEach(function (imageType) {
            Object.defineProperty(_this, imageType, {
                enumerable: false,
                get: _this.getImage.bind(_this, imageType),
                set: _this.setImage.bind(_this, imageType, '1x')
            });
            // setting retina properties too
            constants.DENSITIES.forEach(function (density) {
                Object.defineProperty(_this, imageType + density, {
                    enumerable: false,
                    get: _this.getImage.bind(_this, imageType, density),
                    set: _this.setImage.bind(_this, imageType, density)
                });
            });
        });
        Object.preventExtensions(this);
    }
    /**
     * Returns a given imageType path with a density
     *
     * @param {string} imageType
     * @param {string} density - can be '2x' or '3x'
     * @returns {string} - image path
     * @memberof PassImages
     */
    PassImages.prototype.getImage = function (imageType, density) {
        if (density === void 0) { density = '1x'; }
        if (!(imageType in constants.IMAGES)) {
            throw new Error("Requested unknown image type: " + imageType);
        }
        if (!includes(constants.DENSITIES, density)) {
            throw new Error("Invalid desity for \"" + imageType + "\": " + density);
        }
        if (!this.map.has(imageType))
            return undefined;
        return this.map.get(imageType).get(density);
    };
    /**
     * Saves a given imageType path
     *
     * @param {string} imageType
     * @param {string} density
     * @param {string} fileName
     * @memberof PassImages
     */
    PassImages.prototype.setImage = function (imageType, density, fileName) {
        if (density === void 0) { density = '1x'; }
        if (!(imageType in constants.IMAGES)) {
            throw new Error("Attempted to set unknown image type: " + imageType);
        }
        var imgData = this.map.get(imageType) || new Map();
        imgData.set(density, fileName);
        this.map.set(imageType, imgData);
    };
    /**
     * Load all images from the specified directory. Only supported images are
     * loaded, nothing bad happens if directory contains other files.
     *
     * @param {string} dir - path to a directory with images
     * @memberof PassImages
     */
    PassImages.prototype.loadFromDirectory = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, stats, files, _i, files_1, filePath, fileName, _a, imageType, density;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullPath = path_1.resolve(dir);
                        return [4 /*yield*/, statAsync(fullPath)];
                    case 1:
                        stats = _b.sent();
                        if (!stats.isDirectory()) {
                            throw new Error("Path " + fullPath + " must be a directory!");
                        }
                        return [4 /*yield*/, readdirAsync(fullPath)];
                    case 2:
                        files = _b.sent();
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            filePath = files_1[_i];
                            // we are interesting only in PNG files
                            if (path_1.extname(filePath) === '.png') {
                                fileName = path_1.basename(filePath, '.png');
                                _a = fileName.split('@'), imageType = _a[0], density = _a[1];
                                if (imageType in constants.IMAGES && (!density || includes(constants.DENSITIES, density))) {
                                    this.setImage(imageType, density, path_1.resolve(fullPath, filePath));
                                }
                            }
                        }
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return PassImages;
}());
exports.PassImages = PassImages;
