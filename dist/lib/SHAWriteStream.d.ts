/// <reference types="node" />
import { Writable } from 'stream';
import { Hash } from 'crypto';
export declare class SHAWriteStream extends Writable {
    manifest: any;
    filename: any;
    output: any;
    sha: Hash;
    constructor(manifest: any, filename: any, output: any);
    write(buffer: any, encoding: any): boolean;
    end(chunk?: any, encoding?: string | Function, cb?: Function): void;
}
