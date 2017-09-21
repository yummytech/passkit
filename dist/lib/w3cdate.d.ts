/// <reference path="../../node_modules/@types/node/index.d.ts" />
/**
 * Checks if given string is a valid W3C date representation
 *
 * @param {string} dateStr
 * @returns {boolean}
 */
export declare function isValidW3CDateString(dateStr: any): boolean;
/**
 * Converts given string or Date instance into valid W3C date string
 *
 * @param {string | Date} value
 * @throws if given string can't be converted into w3C date
 * @returns {string}
 */
export declare function getW3CDateString(value: any): string | Date;
