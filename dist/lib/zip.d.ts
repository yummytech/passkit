/// <reference types="node" />
import { EventEmitter } from 'events';
import { File } from './zip-file';
export declare class Zip extends EventEmitter {
    output: any;
    _offset: number;
    _active: any;
    _files: any[];
    _closed: boolean;
    constructor(output: any);
    /**
     * Call this to add a file.
     *
     * @param {string} filename - The file name
     * @param {any} modified - Modified date (if missing, uses current date)
     * @returns {Stream} - Returns an output stream.
     * @memberof Zip
     */
    addFile(filename: any, modified?: any): File;
    /**
     * Call this when done adding files.
     *
     * @memberof Zip
     */
    close(): void;
    /**
     * Used internally to write central directory and close file.
     *
     * @memberof Zip
     * @private
     */
    _flush(): void;
    /**
     * Write next central directory header
     *
     * @param {{filename: string}} file
     * @memberof Zip
     * @private
     */
    _writeCentralDirectoryHeader(file: any): void;
    /**
     * Write end of central directory record and close output stream.
     *
     * @param {number} offsetOfCentralDirectory
     * @param {number} sizeOfCentralDirectory
     * @memberof Zip
     * @private
     */
    _writeEndOfCentralDirectory(offsetOfCentralDirectory: any, sizeOfCentralDirectory: any): void;
    /**
     * Returns true if this is the active file.
     *
     * @param {string} file
     * @returns {boolean}
     * @memberof Zip
     */
    isActive(file: any): boolean;
    /**
     * Call this to pass active batton to the next file.
     *
     * @memberof Zip
     */
    nextActive(): void;
    /**
     * Write buffer to output stream.
     *
     * @param {Buffer} buffer
     * @memberof Zip
     * @private
     */
    _writeBuffer(buffer: any): void;
}
