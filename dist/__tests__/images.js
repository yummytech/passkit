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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var images_1 = require("../src/lib/images");
var path = require('path');
describe('PassImages', function () {
    test('Class properties', function () {
        var img = new images_1.PassImages();
        expect(img).toHaveProperty('background');
        expect(img).toHaveProperty('footer2x');
        expect(img.loadFromDirectory).toBeInstanceOf(Function);
    });
    test('images setter and getter', function () {
        var img = new images_1.PassImages();
        img.background = 'testBackground';
        img.background2x = 'testBackground2x';
        expect(img.background).toBe('testBackground');
        expect(img.background2x).toBe('testBackground2x');
        expect(img.background3x).toBeUndefined();
    });
    test('reading images from directory', function () { return __awaiter(_this, void 0, void 0, function () {
        var img, _i, _a, variations;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    img = new images_1.PassImages();
                    return [4 /*yield*/, img.loadFromDirectory(path.resolve(__dirname, '../images/'))];
                case 1:
                    _b.sent();
                    expect(img.map.size).toBe(6);
                    // ensure it loaded all dimensions for all images
                    for (_i = 0, _a = img.map.values(); _i < _a.length; _i++) {
                        variations = _a[_i];
                        expect(variations).toBeInstanceOf(Map);
                        expect(variations.size).toBe(3);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
});
