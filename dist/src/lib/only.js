/* eslint-disable no-nested-ternary */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns object with only selected properties
 *
 * @param {Object} obj
 * @param {string | string[]} args
 * @returns {Object}
 */
function only(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!obj || typeof obj !== 'object' || !Object.keys(obj).length)
        return {};
    if (arguments.length === 1)
        return obj;
    var properties = args.length === 1
        ? Array.isArray(args[0]) ? args[0] : String(args[0]).split(/\s+/)
        : args;
    var res = {};
    properties.forEach(function (prop) {
        if (prop in obj)
            res[prop] = obj[prop];
    });
    return res;
}
exports.only = only;
