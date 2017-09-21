/**
 * Pipes given source (filename or buffer) into a given writeble stream
 *
 * @param {WritableStream} stream
 * @param {string | Buffer | Function} source - filename or Buffer
 * @param {Function} callback
 * @returns {Promise}
 */
export declare function pipeIntoStream(stream: any, source: any, callback: any): any;
