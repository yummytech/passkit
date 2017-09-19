///<reference path="../node_modules/@types/node/index.d.ts"/>
/**
 * Passbook are created from templates
 */

'use strict'

import * as URL from 'url-parse'

import { readFile, stat } from 'fs'
import * as promisify from 'es6-promisify'
import * as colorString from 'color-string'
import * as apn from '@destinationstransfers/apn'
import { PassImages } from './lib/images'
import { Pass } from './pass'
import { Fields } from './lib/fields'
import { PASS_STYLES } from './constants'

import * as entries from 'object.entries'
import * as includes from 'array-includes'
import * as path from 'path'
import { join } from 'path'

const readFileAsync = promisify(readFile)
const statAsync = promisify(stat)

// Create a new template.
//
// style  - Pass style (coupon, eventTicket, etc)
// fields - Pass fields (passTypeIdentifier, teamIdentifier, etc)
export class Template {
  [x: string]: any;
  password: any
  private keysPath: string
  constructor (public style, public fields: Fields) {
    if (!includes(PASS_STYLES, style)) {
      throw new Error(`Unsupported pass style ${style}`)
    }
    // we will set all fields via class setters, as in the future we will implement strict validators
    // values validation: https://developer.apple.com/library/content/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/TopLevel.html
    entries(fields).forEach(([field, value]) => {
      if (typeof this[field] === 'function') this[field](value)
    })

    if (style in fields) {
      Object.assign(this.fields, { [style]: fields[style] })
    }

    this.keysPath = 'keys'
    this.password = null
    this.apn = null
    this.images = new PassImages()
    Object.preventExtensions(this)
  }

  static convertToRgb (value) {
    const rgb = colorString.get.rgb(value)
    if (rgb === null) throw new Error(`Invalid color value ${value}`)
    // convert to rgb(), stripping alpha channel
    return colorString.to.rgb(rgb.slice(0, 3))
  }

  /**
   * Loads Template, images and key from a given path
   *
   * @static
   * @param {string} folderPath
   * @param {string} keyPassword - optional key password
   * @returns {Template}
   * @throws - if given folder doesn't contain pass.json or it is's in invalid format
   * @memberof Template
   */
  static async load (folderPath: string, keyPassword?: string) {
    // Check if the path is accessible directory actually
    const stats = await statAsync(folderPath)
    if (!stats.isDirectory()) {
      throw new Error(`Path ${folderPath} must be a directory!`)
    }

    // getting main JSON file
    const passJson = JSON.parse(
        await readFileAsync.join(folderPath, 'pass.json'))

    // Trying to detect the type of pass
    let type
    if (
        !PASS_STYLES.some(t => {
          if (t in passJson) {
            type = t
            return true
          }
          return false
        })
    ) {
      throw new Error('Unknown pass style!')
    }

    const template = new Template(type, passJson)

    // load images from the same folder
    await template.images.loadFromDirectory(folderPath)

    // checking if there is a key - must be named ${passTypeIdentifier}.pem
    const typeIdentifier = passJson.passTypeIdentifier
    const keyName = `${typeIdentifier.replace(/^pass\./, '')}.pem`
    try {
      const keyStat = await statAsync(join(folderPath, keyName))
      if (keyStat.isFile()) template.keys(folderPath, keyPassword)
    } catch (_) {
      // throw new Error('Unknown pass style!')
    } // eslint-disable-line

    // done
    return template
  }
  // public pushUpdates (pushToken) {
  //   if (!this.apn) {
  //     // creating APN Provider
  //     const identifier = this.passTypeIdentifier().replace(/^pass./, '')
  //     const key = path.resolve(this.keysPath, `${identifier}.pem`)
  //
  //     this.apn = new apn.Provider({
  //       production: true,
  //       cert: key /* Certificate file path - we have both in the same file */,
  //       key /* Key file path */,
  //       passphrase: this.password
  //     })
  //   }
  //   // sending notification
  //   const note = new apn.Notification()
  //   note.payload = {} // payload must be empty
  //   return this.apn.send(note, pushToken)
  // }

  passTypeIdentifier (v?) {
    if (arguments.length === 1) {
      this.fields.passTypeIdentifier = v
      return this
    }
    return this.fields.passTypeIdentifier
  }

  teamIdentifier (v) {
    if (arguments.length === 1) {
      this.fields.teamIdentifier = v
      return this
    }
    return this.fields.teamIdentifier
  }

  description (v) {
    if (arguments.length === 1) {
      this.fields.description = v
      return this
    }
    return this.fields.description
  }

  backgroundColor (v) {
    if (arguments.length === 1) {
      this.fields.backgroundColor = Template.convertToRgb(v)
      return this
    }
    return this.fields.backgroundColor
  }

  foregroundColor (v) {
    if (arguments.length === 1) {
      this.fields.foregroundColor = Template.convertToRgb(v)
      return this
    }
    return this.fields.foregroundColor
  }

  labelColor (v) {
    if (arguments.length === 1) {
      this.fields.labelColor = Template.convertToRgb(v)
      return this
    }
    return this.fields.labelColor
  }

  logoText (v) {
    if (arguments.length === 1) {
      this.fields.logoText = v
      return this
    }
    return this.fields.logoText
  }

  organizationName (v) {
    if (arguments.length === 1) {
      this.fields.organizationName = v
      return this
    }
    return this.fields.organizationName
  }

  groupingIdentifier (v) {
    if (arguments.length === 1) {
      this.fields.groupingIdentifier = v
      return this
    }
    return this.fields.groupingIdentifier
  }

  /**
   * sets or gets suppressStripShine
   *
   * @param {boolean?} v
   * @returns {Template | boolean}
   * @memberof Template
   */
  suppressStripShine (v) {
    if (arguments.length === 1) {
      if (typeof v !== 'boolean') {
        throw new Error('suppressStripShine value must be a boolean!')
      }
      this.fields.suppressStripShine = v
      return this
    }
    return this.fields.suppressStripShine
  }

  /**
   * gets or sets webServiceURL
   *
   * @param {URL | string} v
   * @returns {Template | string}
   * @memberof Template
   */
  webServiceURL (v) {
    if (arguments.length === 1) {
      // validating URL, it will throw on bad value
      const url = v instanceof URL ? v : new URL(v)
      if (url.protocol !== 'https:') {
        throw new Error(`webServiceURL must be on HTTPS!`)
      }
      this.fields.webServiceURL = url.toString()
      return this
    }
    return this.fields.webServiceURL
  }

  /**
   * Sets path to directory containing keys and password for accessing keys.
   *
   * @param {string} path - Path to directory containing key files (default is 'keys')
   * @param {string} password - Password to use with keys
   * @memberof Template
   */
  keys (path, password) {
    if (path) this.keysPath = path
    if (password) this.password = password
  }

  /**
   * Create a new pass from a template.
   *
   * @param {Object} fields
   * @returns {Pass}
   * @memberof Template
   */
  createPass (fields = {}) {
    // Combine template and pass fields
    return new Pass(this, Object.assign({}, this.fields, fields), this.images)
  }
}
