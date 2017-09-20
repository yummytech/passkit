'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('../src/lib/w3cdate'), isValidW3CDateString = _a.isValidW3CDateString, getW3CDateString = _a.getW3CDateString;
describe('W3C dates strings ', function () {
    test('isValidW3CDateString', function () {
        expect(isValidW3CDateString('2012-07-22T14:25-08:00')).toBeTruthy();
        // allow seconds too
        expect(isValidW3CDateString('2018-07-16T19:20:30+01:00')).toBeTruthy();
        expect(isValidW3CDateString('2012-07-22')).toBeFalsy();
    });
    test('getW3CDateString', function () {
        var date = new Date();
        var res = getW3CDateString(date);
        expect(isValidW3CDateString(res)).toBeTruthy();
        expect(function () { return getW3CDateString({ byaka: 'buka' }); }).toThrow();
        // must not cust seconds if supplied as string
        expect(getW3CDateString('2018-07-16T19:20:30+01:00')).toBe('2018-07-16T19:20:30+01:00');
    });
});
