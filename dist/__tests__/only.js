'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var only_1 = require("../src/lib/only");
var testObj = {
    field1: 'blbllb',
    field2: 'bdddddd',
    field3: 'dddddd',
    field4: 'eeeee'
};
describe('only', function () {
    test('parameters as string', function () {
        var res = only_1.only(testObj, 'field1 field3');
        expect(res).toHaveProperty('field1', testObj.field1);
        expect(res).toHaveProperty('field3', testObj.field3);
        expect(res).not.toHaveProperty('field2');
        expect(res).not.toHaveProperty('field4');
    });
    test('parameters as tokens', function () {
        var res = only_1.only(testObj, 'field1', 'field3');
        expect(res).toHaveProperty('field1', testObj.field1);
        expect(res).toHaveProperty('field3', testObj.field3);
        expect(res).not.toHaveProperty('field2');
        expect(res).not.toHaveProperty('field4');
    });
    test('parameters as array', function () {
        var res = only_1.only(testObj, ['field1', 'field3']);
        expect(res).toHaveProperty('field1', testObj.field1);
        expect(res).toHaveProperty('field3', testObj.field3);
        expect(res).not.toHaveProperty('field2');
        expect(res).not.toHaveProperty('field4');
    });
    test('same object if no params', function () {
        var res = only_1.only(testObj);
        expect(res).toMatchObject(testObj);
    });
    test('empty object for bad object', function () {
        var res = only_1.only('byaka buka', 'byaka byka');
        expect(Object.keys(res).length).toBe(0);
    });
});
