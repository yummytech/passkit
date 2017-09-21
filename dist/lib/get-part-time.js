'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-bitwise */
/**
 * Extract time value from Date usable for Zip header
 *
 * @param {Date} date
 * @returns {number}
 */
function getTimePart(date) {
    return ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() / 2));
}
exports.getTimePart = getTimePart;
/**
 * Extract date value from Date usable for Zip header
 *
 * @param {Date} date
 * @returns {number}
 */
function getDatePart(date) {
    return (((date.getFullYear() - 1980) << 9) |
        ((date.getMonth() + 1) << 5) |
        date.getDate());
}
exports.getDatePart = getDatePart;
