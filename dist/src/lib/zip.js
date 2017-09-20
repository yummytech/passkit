// Simple Zip implementation, no compression, that opens on the iPhone.
//
// var zip = new Zip(output);
// var file = zip.addFile(filename);
// file.write(buffer);
// file.end();
// zip.close();
//
// See http://www.pkware.com/documents/casestudies/APPNOTE.TXT
/* eslint-disable no-underscore-dangle, no-bitwise */
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
var events_1 = require("events");
var zip_file_1 = require("./zip-file");
var get_part_time_1 = require("./get-part-time");
var debug = console.log;
// const debug = () => {}
// Creates a new zip.
//
// output - Output stream
//
// Emits the following events:
// end   - Finished writing to output stream
// error - Encountered an error writing to output stream
var Zip = /** @class */ (function (_super) {
    __extends(Zip, _super);
    function Zip(output) {
        var _this = _super.call(this) || this;
        _this.output = output;
        // Set to true when zip is closed
        _this._closed = false;
        // Keep track of all files added so we can write central directory
        _this._files = [];
        // The currently active file
        _this._active = null;
        // Current offset in the output stream
        _this._offset = 0;
        var zip = _this;
        output.on('error', function (error) {
            debug('Zip file encountered an error', error);
            // Closed output, propagate.
            // Output error, destroy all files and propagate.
            zip._closed = true;
            for (var i in zip._files) {
                var file = zip._files[i];
                if (!file._done)
                    file.destroy();
            }
            zip.emit('error', error);
        });
        output.on('finish', function () {
            debug('Zip completed');
            zip.emit('end');
        });
        output.on('close', function () {
            debug('Zip completed');
            zip.emit('end');
        });
        Object.preventExtensions(_this);
        return _this;
    }
    /**
     * Call this to add a file.
     *
     * @param {string} filename - The file name
     * @param {any} modified - Modified date (if missing, uses current date)
     * @returns {Stream} - Returns an output stream.
     * @memberof Zip
     */
    Zip.prototype.addFile = function (filename, modified) {
        if (this._closed)
            throw new Error('Zip file already closed');
        var file = new zip_file_1.File(this, filename, modified);
        this._files.push(file);
        return file;
    };
    // -- API --
    /**
     * Call this when done adding files.
     *
     * @memberof Zip
     */
    Zip.prototype.close = function () {
        if (this._closed)
            throw new Error('Zip file already closed');
        this._closed = true;
        // Are there any open files (not flushed)?
        for (var i in this._files) {
            if (!this._files[i]._done) {
                this.on('drain', this._flush);
                return;
            }
        }
        // All files are flushed, time to wrap things up
        this._flush();
    };
    // -- Central directory --
    /**
     * Used internally to write central directory and close file.
     *
     * @memberof Zip
     * @private
     */
    Zip.prototype._flush = function () {
        var centralDirectoryOffset = this._offset;
        var centralDirectorySize = 0;
        for (var i in this._files) {
            this._writeCentralDirectoryHeader(this._files[i]);
        }
        centralDirectorySize = this._offset - centralDirectoryOffset;
        this._writeEndOfCentralDirectory(centralDirectoryOffset, centralDirectorySize);
        // Once this buffer is out, we're done with the output stream
        this.output.end();
    };
    /**
     * Write next central directory header
     *
     * @param {{filename: string}} file
     * @memberof Zip
     * @private
     */
    Zip.prototype._writeCentralDirectoryHeader = function (file) {
        var filename = Buffer.from(file.filename, 'utf-8');
        var buffer = Buffer.alloc(46 + filename.length);
        // central file header signature
        buffer.writeInt32LE(0x02014b50, 0);
        // version made by
        buffer.writeUInt16LE(0x133f, 4);
        // version needed to extract
        buffer.writeUInt16LE(0x1314, 6);
        // general purpose bit flag
        buffer.writeUInt16LE(0x0008, 8); // Use data descriptor
        // compression method
        buffer.writeUInt16LE(0x0008, 10); // DEFLATE
        // last mod file time
        buffer.writeUInt16LE(get_part_time_1.getTimePart(file.modified), 12);
        // last mod file date
        buffer.writeUInt16LE(get_part_time_1.getDatePart(file.modified), 14);
        // crc-32
        buffer.writeInt32LE(file._crc ^ -1, 16);
        // compressed size
        buffer.writeInt32LE(file._compressedLength, 20); // no compression
        // uncompressed size
        buffer.writeInt32LE(file._uncompressedLength, 24);
        // file name length
        buffer.writeUInt16LE(filename.length, 28);
        // extra field length
        buffer.writeUInt16LE(0, 30);
        // file comment length
        buffer.writeUInt16LE(0, 32);
        // disk number start
        buffer.writeUInt16LE(0, 34);
        // internal file attributes
        buffer.writeUInt16LE(0, 36);
        // external file attributes
        buffer.writeInt32LE(0, 38);
        // relative offset of local header 4 bytes
        buffer.writeInt32LE(file._offset, 42);
        // file name (variable size)
        filename.copy(buffer, 46);
        // extra field (variable size)
        // file comment (variable size)
        this._writeBuffer(buffer);
    };
    /**
     * Write end of central directory record and close output stream.
     *
     * @param {number} offsetOfCentralDirectory
     * @param {number} sizeOfCentralDirectory
     * @memberof Zip
     * @private
     */
    Zip.prototype._writeEndOfCentralDirectory = function (offsetOfCentralDirectory, sizeOfCentralDirectory) {
        var buffer = Buffer.alloc(22);
        // end of central dir signature
        buffer.writeInt32LE(0x06054b50, 0);
        // number of this disk
        buffer.writeUInt16LE(0, 4);
        // number of the disk with the start of the central directory
        buffer.writeUInt16LE(0, 6);
        // total number of entries in the central directory on this disk
        buffer.writeUInt16LE(this._files.length, 8);
        // total number of entries in the central directory
        buffer.writeUInt16LE(this._files.length, 10);
        // size of the central directory
        buffer.writeInt32LE(sizeOfCentralDirectory, 12);
        // offset to start of central directory with respect to the starting disk number
        buffer.writeInt32LE(offsetOfCentralDirectory, 16);
        // .ZIP file comment length
        buffer.writeUInt16LE(0, 20);
        this._writeBuffer(buffer);
    };
    // -- Buffered output --
    /**
     * Returns true if this is the active file.
     *
     * @param {string} file
     * @returns {boolean}
     * @memberof Zip
     */
    Zip.prototype.isActive = function (file) {
        if (this._active === file)
            return true;
        if (!this._active) {
            this._active = file;
            return true;
        }
        return false;
    };
    /**
     * Call this to pass active batton to the next file.
     *
     * @memberof Zip
     */
    Zip.prototype.nextActive = function () {
        this._active = null;
        var done = true;
        for (var i in this._files) {
            var file = this._files[i];
            if (!file._done) {
                done = false;
                if (!file.writable) {
                    // Completed, not flushed: this is now the active file
                    this._active = file;
                    file._flush();
                    return;
                }
            }
        }
        // No files open or need flushing: emit drain event
        if (done)
            this.emit('drain');
    };
    /**
     * Write buffer to output stream.
     *
     * @param {Buffer} buffer
     * @memberof Zip
     * @private
     */
    Zip.prototype._writeBuffer = function (buffer) {
        this._offset += buffer.length;
        this.output.write(buffer);
    };
    return Zip;
}(events_1.EventEmitter));
exports.Zip = Zip;
