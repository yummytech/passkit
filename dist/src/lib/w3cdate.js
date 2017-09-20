///<reference path="../../node_modules/@types/node/index.d.ts"/>
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var padStart = require("string.prototype.padstart");
/**
 * Checks if given string is a valid W3C date representation
 *
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidW3CDateString(dateStr) {
    if (typeof dateStr !== 'string')
        return false;
    // W3C date format with optional seconds
    return /^20[1-9]{2}-[0-1][0-9]-[0-3][0-9]T[0-5][0-9]:[0-5][0-9](:[0-5][0-9])?(Z|([-+][0-1][0-9]:[03]0)$)/.test(dateStr);
}
exports.isValidW3CDateString = isValidW3CDateString;
/**
 * Converts given string or Date instance into valid W3C date string
 *
 * @param {string | Date} value
 * @throws if given string can't be converted into w3C date
 * @returns {string}
 */
function getW3CDateString(value) {
    if (typeof value !== 'string' && !(value instanceof Date)) {
        throw new Error('Argument must be either a string or Date object');
    }
    if (isValidW3CDateString(value))
        return value;
    var date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime()))
        throw new Error('Invalid date value!');
    // creating W3C date (we will always do without seconds)
    var month = padStart((1 + date.getMonth()).toFixed(), 2, '0');
    var day = padStart(date.getDate().toFixed(), 2, '0');
    var hours = padStart(date.getHours().toFixed(), 2, '0');
    var minutes = padStart(date.getMinutes().toFixed(), 2, '0');
    var offset = -date.getTimezoneOffset();
    var offsetHours = padStart(Math.abs(Math.floor(offset / 60))
        .toFixed(), 2, '0');
    var offsetMinutes = padStart((Math.abs(offset) - offsetHours * 60)
        .toFixed(), 2, '0');
    var offsetSign = offset < 0 ? '-' : '+';
    return date.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes + offsetSign + offsetHours + ":" + offsetMinutes;
}
exports.getW3CDateString = getW3CDateString;
