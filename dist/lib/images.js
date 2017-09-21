/**
 * Base PassImages class to add image filePath manipulation
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fullPath, stats, files, _i, files_1, filePath, fileName, _a, imageType, density;
            return tslib_1.__generator(this, function (_b) {
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
