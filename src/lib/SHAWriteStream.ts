'use strict'

import { Writable } from 'stream'
import { createHash, Hash } from 'crypto'

// -- Manifest output stream --

// A write stream that calculates SHA from the output and updates the manifest
// accordingly.
//
// manifest - Manifest object
// filename - Filename (manifest property to set)
// output   - Pipe to this output stream
export class SHAWriteStream extends Writable {
  sha: Hash

  constructor (public manifest, public filename, public output) {
    super()
    this.sha = createHash('sha1')
    output.on('close', this.emit.bind(this, 'close'))
    output.on('error', this.emit.bind(this, 'error'))
    Object.preventExtensions(this)
  }

  write (buffer, encoding) {
    this.output.write(buffer, encoding)
    this.sha.update(buffer, encoding)
    return true
  }
// The implementation:
  end (chunk: any, encoding?: string, cb?: Function) {
    if (chunk) this.write(chunk, encoding)
    this.output.end()
    this.manifest[this.filename] = this.sha.digest('hex')
  }
}
