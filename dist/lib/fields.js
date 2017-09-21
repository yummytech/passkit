'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Field accessors class
 */
var w3cdate_1 = require("./w3cdate");
var only_1 = require("./only");
var Fields = /** @class */ (function () {
    // A value that uniquely identifies the pass.
    // should copy template fields
    /**
     * Creates an instance of Fields
     *
     * @param {Pass} pass - parent Pass class
     * @param {string} key - key name that these fields are bound to
     * @memberof Fields
     */
    function Fields(pass, key) {
        this.pass = pass;
        this.key = key;
        Object.preventExtensions(this);
    }
    /**
     * Returns an array of all fields.
     *
     * @returns {{key: string, value: string, label: string}[]}
     * @memberof Fields
     */
    Fields.prototype.all = function () {
        if (!(this.key in this.pass.structure))
            this.pass.structure[this.key] = [];
        return this.pass.structure[this.key];
    };
    /**
     * Adds a field to the end of the list
     *
     * @param {string | {key: string, label: string, value: string}} key - Field key or object with all fields
     * @param {string} [label] - Field label (optional)
     * @param {string} [value] - Field value
     * @param {Object} [options] - Other field options (e.g. dateStyle)
     * @returns {Fields}
     * @memberof Fields
     */
    Fields.prototype.add = function (key, label, value, options) {
        if (arguments.length > 1) {
            this.remove(key);
            var field = { key: key, label: label, value: value };
            if (label)
                field.label = label;
            if (options)
                Object.assign(field, options);
            this.all().push(field);
        }
        else if (Array.isArray(key)) {
            for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
                var k = key_1[_i];
                this.add(k);
            }
        }
        else {
            this.remove(key.key);
            // save object copy
            this.all().push(Object.assign({}, key));
        }
        return this;
    };
    /**
     * Returns a field
     *
     * @param {string} key
     * @returns {{key: string, label: string, value: string}} If field exists, returns an object with common keys and rest of keys
     * @memberof Fields
     */
    Fields.prototype.get = function (key) {
        return this.all().find(function (v) { return v.key === key; });
    };
    /**
     * Sets value field for a given key
     *
     * @param {string} key
     * @param {string} value
     * @memberof Fields
     */
    Fields.prototype.setValue = function (key, value) {
        var field = this.get(key);
        if (!field)
            return this.add({ key: key, value: value });
        field.value = value;
        return this;
    };
    /**
     * Removes a given field.
     *
     * @param {string} key
     * @returns {Fields}
     * @memberof Fields
     */
    Fields.prototype.remove = function (key) {
        var idx = this.all().findIndex(function (v) { return v.key === key; });
        if (idx > -1) {
            this.all().splice(idx, 1);
            // remove property completely if there is no fields left
            if (this.all().length === 0)
                this.clear();
        }
        return this;
    };
    /**
     * Set a field as Date value with appropriated options
     *
     * @param {string} key
     * @param {string} label
     * @param {Date} date
     * @param {{dateStyle?: string, ignoresTimeZone?: boolean, isRelative?: boolean, timeStyle?:string}} [formatOptions]
     * @returns {Fields}
     * @throws if date is not a Date or invalid Date
     * @memberof Fields
     */
    Fields.prototype.setDateTime = function (key, label, date, formatOptions) {
        if (formatOptions === void 0) { formatOptions = {}; }
        if (!(date instanceof Date)) {
            throw new Error('First parameter of setDateTime must be an instance of Date');
        }
        //  Either specify both a date style and a time style, or neither.
        if ((!('dateStyle' in formatOptions) && 'timeStyle' in formatOptions) ||
            ('dateStyle' in formatOptions && !('timeStyle' in formatOptions))) {
            throw new Error('Either specify both a date style and a time style, or neither');
        } // adding
        this.add(Object.assign({
            key: key,
            label: label,
            value: w3cdate_1.getW3CDateString(date)
        }, only_1.only(formatOptions, 'dateStyle timeStyle ignoresTimeZone isRelative changeMessage')));
        return this;
    };
    /**
     * Removes all fields.
     *
     * @returns {Fields}
     * @memberof Fields
     */
    Fields.prototype.clear = function () {
        delete this.pass.structure[this.key];
        return this;
    };
    return Fields;
}());
exports.Fields = Fields;
