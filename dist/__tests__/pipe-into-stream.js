/* eslint-disable node/no-unpublished-require */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var pipe_into_stream_1 = require("../src/lib/pipe-into-stream");
var crypto_1 = require("crypto");
var stream_buffers_1 = require("stream-buffers");
describe('pipeIntoStream', function () {
    test('piping a buffer into a stream', function (done) {
        // creating test buffer and fill it with random data
        var testBuffer = crypto_1.randomBytes(256);
        // create writable stream
        var ws = new stream_buffers_1.WritableStreamBuffer({ initialSize: 1024 });
        pipe_into_stream_1.pipeIntoStream(ws, testBuffer, function () {
            expect(testBuffer.compare(ws.getContents())).toBe(0);
            done();
        });
    });
});
