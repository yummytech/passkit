'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var crypto_1 = require("crypto");
// -- Manifest output stream --
// A write stream that calculates SHA from the output and updates the manifest
// accordingly.
//
// manifest - Manifest object
// filename - Filename (manifest property to set)
// output   - Pipe to this output stream
var SHAWriteStream = /** @class */ (function (_super) {
    __extends(SHAWriteStream, _super);
    function SHAWriteStream(manifest, filename, output) {
        var _this = _super.call(this) || this;
        _this.manifest = manifest;
        _this.filename = filename;
        _this.output = output;
        _this.sha = crypto_1.createHash('sha1');
        output.on('close', _this.emit.bind(_this, 'close'));
        output.on('error', _this.emit.bind(_this, 'error'));
        Object.preventExtensions(_this);
        return _this;
    }
    SHAWriteStream.prototype.write = function (buffer, encoding) {
        this.output.write(buffer, encoding);
        this.sha.update(buffer, encoding);
        return true;
    };
    // The implementation:
    SHAWriteStream.prototype.end = function (chunk, encoding, cb) {
        if (chunk)
            this.write(chunk, encoding);
        this.output.end();
        this.manifest[this.filename] = this.sha.digest('hex');
    };
    return SHAWriteStream;
}(stream_1.Writable));
exports.SHAWriteStream = SHAWriteStream;
