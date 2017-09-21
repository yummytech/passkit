/// <reference types="node" />
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { PassImages } from './lib/images';
import { Fields } from './lib/fields';
export declare class Pass extends EventEmitter {
    template: any;
    fields: any;
    images: PassImages;
    localizations: {};
    structure: any;
    auxiliaryFields: Fields;
    backFields: Fields;
    headerFields: Fields;
    primaryFields: Fields;
    secondaryFields: Fields;
    constructor(template: any, fields: any, images: PassImages);
    /**
     * Returns normalized geopoint object from geoJSON, {lat, lng} or
     * {lattitude,longutude,altitude}
     *
     * @param {number[] | { lat: number, lng: number, alt?: number } | {
     *     longitude: number, latitude: number, altitude?: number }} point
     * @returns {{ longitude: number, latitude: number, altitude: number }}
     * @throws on unknown point format
     * @memberof Pass
     */
    static getGeoPoint(point: any): {
        longitude: any;
        latitude: any;
        altitude: any;
    };
    transitType(v?: any): any;
    /**
     * Date and time when the pass expires.
     *
     * @param {string | Date} v - value to set
     * @returns {Pass | string}
     * @throws when passed value can't be interpreted as W3C string
     * @memberof Pass
     */
    expirationDate(v?: any): any;
    /**
     *  Indicates that the pass is void—for example, a one time use coupon that
     * has been redeemed.
     *
     * @param {boolean} v
     * @returns {Pass | boolean}
     * @memberof Pass
     */
    voided(v?: any): boolean | this;
    /**
     * Date and time when the pass becomes relevant. For example, the start time
     * of a movie. Recommended for event tickets and boarding passes; otherwise
     * optional.
     *
     * @param {string | Date} v - value to set
     * @returns {Pass | string}
     * @throws when passed value can't be interpreted as W3C string
     * @memberof Pass
     */
    relevantDate(v?: any): any;
    /**
     * Maximum distance in meters from a relevant latitude and longitude that the
     * pass is relevant. This number is compared to the pass’s default distance
     * and the smaller value is used.
     *
     * @param {number} v - distance in meters
     * @returns {Pass | number}
     * @memberof Pass
     */
    maxDistance(v?: any): any;
    /**
     * Adds a location where a pass is relevant.
     *
     * @param {number[] | { lat: number, lng: number, alt?: number } | {
     *     longitude: number, latitude: number, altitude?: number }} point
     * @param {string} relevantText
     * @returns {Pass}
     * @memberof Pass
     */
    addLocation(point: any, relevantText: any): this;
    /**
     * Gets or sets Pass barcodes field
     *
     * @param {Array.<{format: string, message: string, messageEncoding:
     *     string}>} v
     */
    barcodes(v?: any): any;
    addLocalization(lang: any, values: any): void;
    validate(): void;
    getPassJSON(): any;
    /**
     * Pipe pass to a write stream.
     *
     * @param {Writable} output - Write stream
     * @memberof Pass
     */
    pipe(output: any): void;
    /**
     * Use this to send pass as HTTP response.
     * Adds appropriate headers and pipes pass to response.
     *
     * @param {http.response} response - HTTP response
     * @memberof Pass
     */
    render(response: any): Promise<{}>;
    /**
     * Returns the Pass as a Readable strem
     *
     * @returns {Stream}
     * @memberof Pass
     */
    stream(): PassThrough;
    /**
     * Add manifest.json and signature files.
     *
     * @param {Zip} zip
     * @param {Object} manifest
     * @param {Function} callback
     * @memberof Pass
     */
    signZip(zip: any, manifest: any, callback: any): void;
}
