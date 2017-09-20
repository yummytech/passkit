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
var Crypto = require("crypto");
var child_process_1 = require("child_process");
var File = require("fs");
var path = require("path");
var stream_1 = require("stream");
var template_1 = require("../src/template");
var constants = require("../src/constants");
var pass_1 = require("../src/pass");
// Clone all the fields in object, except the named field, and return a new
// object.
//
// object - Object to clone
// field  - Except this field
function cloneExcept(object, field) {
    var clone = {};
    for (var key in object) {
        if (key !== field)
            clone[key] = object[key];
    }
    return clone;
}
function unzip(zipFile, filename) {
    return new Promise(function (resolve) {
        child_process_1.execFile('unzip', ['-p', zipFile, filename], { encoding: 'binary' }, function (error, stdout) {
            if (error) {
                // throw new Error(stdout)
            }
            else {
                resolve(Buffer.from(stdout.toString(), 'binary'));
                // resolve(stdout)
            }
        });
    });
}
var template = new template_1.Template('coupon', {
    passTypeIdentifier: 'pass.com.fastlane.flomio',
    teamIdentifier: 'MXL',
    labelColor: 'red'
});
template.keys(__dirname + "/../keys", 'flomio');
var fields = {
    serialNumber: '123456',
    organizationName: 'Acme flowers',
    description: '20% of black roses'
};
describe('Pass', function () {
    test('from template', function () {
        var pass = template.createPass();
        // should copy template fields
        expect(pass.fields.passTypeIdentifier).toBe('pass.com.fastlane.flomio');
        // should start with no images
        expect(pass.images.map.size).toBe(0);
        // should create a structure based on style
        expect(pass.fields.coupon).toBeDefined();
        expect(pass.fields.eventTicket).toBeUndefined();
    });
    test('getGeoPoint', function () {
        expect(pass_1.Pass.getGeoPoint([14.235, 23.3444, 23.4444])).toMatchObject({
            longitude: expect.any(Number),
            latitude: expect.any(Number),
            altitude: expect.any(Number)
        });
        expect(function () { return pass_1.Pass.getGeoPoint([14.235, 'brrrr', 23.4444]); }).toThrow();
        expect(pass_1.Pass.getGeoPoint({ lat: 1, lng: 2, alt: 3 })).toMatchObject({
            longitude: 2,
            latitude: 1,
            altitude: 3
        });
        expect(pass_1.Pass.getGeoPoint({ longitude: 10, latitude: 20 })).toMatchObject({
            longitude: 10,
            latitude: 20,
            altitude: undefined
        });
        expect(function () { return pass_1.Pass.getGeoPoint({ lat: 1, log: 3 }); }).toThrow('Unknown geopoint format');
    });
    //
    test('barcodes as Array', function () {
        var pass = template.createPass(cloneExcept(fields, 'serialNumber'));
        expect(function () {
            return pass.barcodes([
                {
                    format: 'PKBarcodeFormatQR',
                    message: 'Barcode message',
                    messageEncoding: 'iso-8859-1'
                }
            ]);
        }).not.toThrow();
        expect(function () { return pass.barcodes('byaka'); }).toThrow();
    });
    test('without serial number should not be valid', function () {
        var pass = template.createPass(cloneExcept(fields, 'serialNumber'));
        expect(function () { return pass.validate(); }).toThrow('Missing field serialNumber');
    });
    test('without organization name should not be valid', function () {
        var pass = template.createPass(cloneExcept(fields, 'organizationName'));
        expect(function () { return pass.validate(); }).toThrow('Missing field organizationName');
    });
    test('without description should not be valid', function () {
        var pass = template.createPass(cloneExcept(fields, 'description'));
        expect(function () { return pass.validate(); }).toThrow('Missing field description');
    });
    test('without icon.png should not be valid', function () {
        var pass = template.createPass(fields);
        expect(function () { return pass.validate(); }).toThrow('Missing image icon.png');
    });
    test('without logo.png should not be valid', function () { return __awaiter(_this, void 0, void 0, function () {
        var pass, file, validationError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pass = template.createPass(fields);
                    pass.images.icon = 'icon.png';
                    file = File.createWriteStream('/tmp/pass.pkpass');
                    return [4 /*yield*/, new Promise(function (resolve) {
                            pass.pipe(file);
                            pass.on('done', function () {
                                throw new Error('Expected validation error');
                            });
                            pass.on('error', resolve);
                        })];
                case 1:
                    validationError = _a.sent();
                    expect(validationError).toHaveProperty('message', 'Missing image logo.png');
                    return [2 /*return*/];
            }
        });
    }); });
    test('boarding pass has string-only property in sctructure fields', function () { return __awaiter(_this, void 0, void 0, function () {
        var templ, pass;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, template_1.Template.load(path.resolve(__dirname, './resources/passes/BoardingPass.pass/'))];
                case 1:
                    templ = _a.sent();
                    expect(templ.style).toBe('boardingPass');
                    pass = templ.createPass();
                    expect(pass.transitType()).toBe(constants.TRANSIT.AIR);
                    pass.transitType(constants.TRANSIT.BUS);
                    expect(pass.transitType()).toBe(constants.TRANSIT.BUS);
                    expect(pass.getPassJSON().boardingPass).toHaveProperty('transitType', constants.TRANSIT.BUS);
                    return [2 /*return*/];
            }
        });
    }); });
    test('stream', function () { return __awaiter(_this, void 0, void 0, function () {
        var pass, stream, file, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pass = template.createPass(fields);
                    return [4 /*yield*/, pass.images.loadFromDirectory(path.resolve(__dirname, './resources'))];
                case 1:
                    _a.sent();
                    pass.headerFields.add('date', 'Date', 'Nov 1');
                    pass.primaryFields.add([
                        { key: 'location', label: 'Place', value: 'High ground' }
                    ]);
                    stream = pass.stream();
                    expect(stream).toBeInstanceOf(stream_1.Readable);
                    file = File.createWriteStream('/tmp/pass1.pkpass');
                    stream.pipe(file);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            stream.on('end', resolve);
                            stream.on('error', function (e) {
                                throw e;
                            });
                        })
                        // test that result is valid ZIP at least
                    ];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            child_process_1.execFile('unzip', ['-t', '/tmp/pass1.pkpass'], function (error, stdout) {
                                if (error)
                                    throw new Error(stdout);
                                resolve(stdout);
                            });
                        })];
                case 3:
                    res = _a.sent();
                    File.unlinkSync('/tmp/pass1.pkpass');
                    expect(res).toContain('No errors detected in compressed data');
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('generated', function () {
    var pass = template.createPass(fields);
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
                    return [4 /*yield*/, pass.images.loadFromDirectory(path.resolve(__dirname, './resources'))];
                case 1:
                    _a.sent();
                    pass.headerFields.add('date', 'Date', 'Nov 1');
                    pass.primaryFields.add([
                        { key: 'location', label: 'Place', value: 'High ground' }
                    ]);
                    if (File.existsSync('/tmp/pass.pkpass')) {
                        File.unlinkSync('/tmp/pass.pkpass');
                    }
                    file = File.createWriteStream('/tmp/pass.pkpass');
                    return [4 /*yield*/, new Promise(function (resolve) {
                            pass.pipe(file);
                            pass.on('end', resolve);
                            pass.on('error', function (err) {
                                throw err;
                            });
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should be a valid ZIP', function (done) {
        child_process_1.execFile('unzip', ['-t', '/tmp/pass.pkpass'], function (error, stdout) {
            if (error)
                throw new Error(stdout);
            expect(stdout).toContain('No errors detected in compressed data');
            done(error);
        });
    });
    test('should contain pass.json', function () { return __awaiter(_this, void 0, void 0, function () {
        var res, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, unzip('/tmp/pass.pkpass', 'pass.json')];
                case 1:
                    res = _b.apply(_a, [_c.sent()]);
                    expect(res).toMatchObject({
                        passTypeIdentifier: 'pass.com.fastlane.flomio',
                        teamIdentifier: 'MXL',
                        serialNumber: '123456',
                        organizationName: 'Acme flowers',
                        description: '20% of black roses',
                        coupon: {
                            headerFields: [
                                {
                                    key: 'date',
                                    label: 'Date',
                                    value: 'Nov 1'
                                }
                            ],
                            primaryFields: [
                                {
                                    key: 'location',
                                    label: 'Place',
                                    value: 'High ground'
                                }
                            ]
                        },
                        formatVersion: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test('should contain a manifest', function () { return __awaiter(_this, void 0, void 0, function () {
        var res, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, unzip('/tmp/pass.pkpass', 'manifest.json')];
                case 1:
                    res = _b.apply(_a, [_c.sent()]);
                    expect(res).toMatchObject({
                        'pass.json': expect.any(String),
                        'icon.png': 'e0f0bcd503f6117bce6a1a3ff8a68e36d26ae47f',
                        'icon@2x.png': '10e4a72dbb02cc526cef967420553b459ccf2b9e',
                        'logo.png': 'abc97e3b2bc3b0e412ca4a853ba5fd90fe063551',
                        'logo@2x.png': '87ca39ddc347646b5625062a349de4d3f06714ac',
                        'strip.png': '68fc532d6c76e7c6c0dbb9b45165e62fbb8e9e32',
                        'strip@2x.png': '17e4f5598362d21f92aa75bc66e2011a2310f48e',
                        'thumbnail.png': 'e199fc0e2839ad5698b206d5f4b7d8cb2418927c',
                        'thumbnail@2x.png': 'ac640c623741c0081fb1592d6353ebb03122244f'
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    // this test depends on MacOS specific signpass, so, run only on MacOS
    if (process.platform === 'darwin') {
        test('should contain a signature', function (done) {
            child_process_1.execFile(path.resolve(__dirname, './resources/bin/signpass'), ['-v', '/tmp/pass.pkpass'], function (error, stdout) {
                expect(stdout).toContain('*** SUCCEEDED ***');
                done();
            });
        });
    }
    test('should contain the icon', function () { return __awaiter(_this, void 0, void 0, function () {
        var buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, unzip('/tmp/pass.pkpass', 'icon.png')];
                case 1:
                    buffer = _a.sent();
                    expect(Crypto.createHash('sha1').update(buffer).digest('hex')).toBe('e0f0bcd503f6117bce6a1a3ff8a68e36d26ae47f');
                    return [2 /*return*/];
            }
        });
    }); });
    test('should contain the logo', function () { return __awaiter(_this, void 0, void 0, function () {
        var buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, unzip('/tmp/pass.pkpass', 'logo.png')];
                case 1:
                    buffer = _a.sent();
                    expect(Crypto.createHash('sha1').update(buffer).digest('hex')).toBe('abc97e3b2bc3b0e412ca4a853ba5fd90fe063551');
                    return [2 /*return*/];
            }
        });
    }); });
});
