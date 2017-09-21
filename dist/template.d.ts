/// <reference path="../node_modules/@types/node/index.d.ts" />
import { PassImages } from './lib/images';
import { Pass } from './pass';
export declare class Template {
    style: any;
    fields: any;
    images: PassImages;
    password: any;
    keysPath: string;
    private apn;
    constructor(style: any, fields?: any);
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
    static load(folderPath: any, keyPassword?: any): Promise<Template>;
    /**
     * Validates if given string is a correct color value for Pass fields
     *
     * @static
     * @param {string} value - a CSS color value, like 'red', '#fff', etc
     * @throws - if value is invalid this function will throw
     * @returns {string} - value converted to "rgb(222, 33, 22)" string
     * @memberof Template
     */
    static convertToRgb(value: any): any;
    passTypeIdentifier(v: any): any;
    teamIdentifier(v: any): any;
    description(v: any): any;
    backgroundColor(v: any): any;
    foregroundColor(v: any): any;
    labelColor(v: any): any;
    logoText(v: any): any;
    organizationName(v: any): any;
    groupingIdentifier(v: any): any;
    /**
     * sets or gets suppressStripShine
     *
     * @param {boolean?} v
     * @returns {Template | boolean}
     * @memberof Template
     */
    suppressStripShine(v: any): any;
    /**
     * gets or sets webServiceURL
     *
     * @param {URL | string} v
     * @returns {Template | string}
     * @memberof Template
     */
    webServiceURL(v: any): any;
    /**
     * Sets path to directory containing keys and password for accessing keys.
     *
     * @param {string} path - Path to directory containing key files (default is 'keys')
     * @param {string} password - Password to use with keys
     * @memberof Template
     */
    keys(path: any, password: any): void;
    /**
     * Create a new pass from a template.
     *
     * @param {Object} fields
     * @returns {Pass}
     * @memberof Template
     */
    createPass(fields?: {}): Pass;
}
