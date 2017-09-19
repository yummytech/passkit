'use strict'
import { Fields } from '../src/lib/fields'

import { isValidW3CDateString } from '../src/lib/w3cdate'

test('Fields Class', () => {
  const pass = { structure: {} }
  const fields = new Fields(pass, 'headerFields')
  // should not add empty arrays if not needed
  expect(Object.keys(pass.structure).length).toBe(0)
  // add
  fields.add('testKey', 'testLabel', 'testValue')
  expect(fields.get('testKey')).toMatchObject({
    key: 'testKey',
    label: 'testLabel',
    value: 'testValue'
  })
  // setValue
  fields.setValue('testKey', 'newValue')
  expect(fields.get('testKey')).toMatchObject({
    key: 'testKey',
    label: 'testLabel',
    value: 'newValue'
  })
  // Add should replace the same key
  fields.add('testKey', 'testLabel2', 'testValue2')
  expect(fields.get('testKey')).toMatchObject({
    key: 'testKey',
    label: 'testLabel2',
    value: 'testValue2'
  })
  // remove should remove the entry and whole key if it last one
  fields.remove('testKey')
  expect(Object.keys(pass.structure).length).toBe(0)

  // setDateTime
  fields.setDateTime('testDate', 'labelDate', new Date())
  expect(isValidW3CDateString(fields.get('testDate').value)).toBeTruthy()
})
