export declare class Fields {
    pass: any;
    key: any;
    passTypeIdentifier: string;
    serialNumber: string;
    teamIdentifier: string;
    description: string;
    backgroundColor: any;
    labelColor: any;
    foregroundColor: any;
    logoText: any;
    organizationName: any;
    groupingIdentifier: any;
    suppressStripShine: any;
    webServiceURL: any;
    expirationDate: any;
    voided: any;
    relevantDate: any;
    maxDistance: any;
    locations: any[];
    barcodes: any[];
    authenticationToken: any;
    coupon: any;
    eventTicket: any;
    /**
     * Creates an instance of Fields
     *
     * @param {Pass} pass - parent Pass class
     * @param {string} key - key name that these fields are bound to
     * @memberof Fields
     */
    constructor(pass: any, key: any);
    /**
     * Returns an array of all fields.
     *
     * @returns {{key: string, value: string, label: string}[]}
     * @memberof Fields
     */
    all(): any;
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
    add(key: any, label?: any, value?: any, options?: any): this;
    /**
     * Returns a field
     *
     * @param {string} key
     * @returns {{key: string, label: string, value: string}} If field exists, returns an object with common keys and rest of keys
     * @memberof Fields
     */
    get(key: any): any;
    /**
     * Sets value field for a given key
     *
     * @param {string} key
     * @param {string} value
     * @memberof Fields
     */
    setValue(key: any, value: any): this;
    /**
     * Removes a given field.
     *
     * @param {string} key
     * @returns {Fields}
     * @memberof Fields
     */
    remove(key: any): this;
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
    setDateTime(key: any, label: any, date: any, formatOptions?: {}): this;
    /**
     * Removes all fields.
     *
     * @returns {Fields}
     * @memberof Fields
     */
    clear(): this;
}
