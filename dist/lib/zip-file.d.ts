/// <reference types="node" />
import * as stream from 'stream';
export declare class File extends stream {
    zip: any;
    filename: any;
    modified: any;
    _deflate: any;
    _offset: number;
    _done: boolean;
    _wroteHeader: boolean;
    _buffers: any[];
    writable: boolean;
    private _crc;
    private _uncompressedLength;
    private _compressedLength;
    constructor(zip: any, filename: any, modified: any);
    /**
     * Writeable stream output
     *
     * @param {Buffer} buffer
     * @param {string} encoding
     * @returns {boolean}
     * @memberof File
     */
    write(buffer: any, encoding?: string): boolean;
    /**
     * Writeable stream end
     *
     * @param {Buffer} buffer
     * @param {string} encoding
     * @memberof File
     */
    end(buffer: any, encoding: any): void;
    /**
     * Writeable stream destroy
     *
     * @memberof File
     */
    destroy(): void;
    /**
     * Write local file header.
     *
     * @memberof File
     */
    _writeLocalFileHeader(): void;
    /**
     * This is called in two cases:
     * - End of file, write the data descriptor and move on
     * - This file is now active, flush any open buffers
     *
     * If the file is still open for writing, flush any buffers.
     *
     * If the file is closed, flush any buffers, write data descriptor and move to
     * the next file.
     *
     * @memberof File
     */
    _flush(): void;
    /**
     * Called when we're done writing the deflated file, takes care of writing data
     * descriptor and activating the next file.
     *
     * @memberof File
     */
    _doneWritingFile(): void;
    /**
     * Write file descriptor at end of file, and then make the next file active.
     *
     * @memberof File
     */
    _writeDataDescriptor(): void;
}
