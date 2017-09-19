/**
 * Base PassImages class to add image filePath manipulation
 */

'use strict'
import * as includes from 'array-includes'
import { stat, readdir } from 'fs'
import * as promisify from 'es6-promisify'
import { basename, extname, resolve } from 'path'
// import * as async from 'asyncawait/async'
// import * as await from 'asyncawait/await'

const readdirAsync = promisify(readdir)
const statAsync = promisify(stat)

// Supported images.
import { IMAGES, DENSITIES } from '../constants'

export class PassImages {
  map: Map<any, any>
  background: string
  background2x: string
  background3x: string
  icon: string

  constructor () {
    // Creating this way to make it invisible
    this.map = new Map()

    // define setters and getters for particular images
    Object.keys(IMAGES).forEach(imageType => {
      Object.defineProperty(this, imageType, {
        enumerable: false,
        get: this.getImage.bind(this, imageType),
        set: this.setImage.bind(this, imageType, '1x')
      })
      // setting retina properties too
      DENSITIES.forEach(density => {
        Object.defineProperty(this, imageType + density, {
          enumerable: false,
          get: this.getImage.bind(this, imageType, density),
          set: this.setImage.bind(this, imageType, density)
        })
      })
    })

    Object.preventExtensions(this)
  }

  /**
   * Returns a given imageType path with a density
   *
   * @param {string} imageType
   * @param {string} density - can be '2x' or '3x'
   * @returns {string} - image path
   * @memberof PassImages
   */
  getImage (imageType, density = '1x') {
    if (!(imageType in IMAGES)) {
      throw new Error(`Requested unknown image type: ${imageType}`)
    }
    if (!includes(DENSITIES, density)) {
      throw new Error(`Invalid desity for "${imageType}": ${density}`)
    }
    if (!this.map.has(imageType)) return undefined
    return this.map.get(imageType).get(density)
  }

  /**
   * Saves a given imageType path
   *
   * @param {string} imageType
   * @param {string} density
   * @param {string} fileName
   * @memberof PassImages
   */
  setImage (imageType, density = '1x', fileName) {
    if (!(imageType in IMAGES)) {
      throw new Error(`Attempted to set unknown image type: ${imageType}`)
    }
    const imgData = this.map.get(imageType) || new Map()
    imgData.set(density, fileName)
    this.map.set(imageType, imgData)
  }

  /**
   * Load all images from the specified directory. Only supported images are
   * loaded, nothing bad happens if directory contains other files.
   *
   * @param {string} dir - path to a directory with images
   * @memberof PassImages
   */
  async loadFromDirectory (dir) {
    const fullPath = resolve(dir)
    const stats = await statAsync(fullPath)
    if (!stats.isDirectory()) {
      throw new Error(`Path ${fullPath} must be a directory!`)
    }
    const files = await readdirAsync(fullPath)
    for (const filePath of files) {
      // we are interesting only in PNG files
      if (extname(filePath) === '.png') {
        const fileName = basename(filePath, '.png')
        // this will split imagename like background@2x into 'background' and '2x' and fail on anything else
        //  [, imageType, , density] = /^([a-z]+)(@([2-3]x))?$/.exec(fileName) || []
        const [imageType, density] = fileName.split('@')
        if (imageType in IMAGES && (!density || includes(DENSITIES, density))) {
          this.setImage(imageType, density, resolve(fullPath, filePath))
        }
      }
    }

    return this
  }
}
