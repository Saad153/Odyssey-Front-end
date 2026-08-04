const { parseEmailList, isValidEmailList } = require('functions/emailList')

describe('parseEmailList', () => {
  test('returns an empty array for falsy input', () => {
    expect(parseEmailList(undefined)).toEqual([])
    expect(parseEmailList(null)).toEqual([])
    expect(parseEmailList('')).toEqual([])
  })

  test('splits on semicolons (Outlook-style)', () => {
    expect(parseEmailList('a@x.com;b@x.com;c@x.com')).toEqual(['a@x.com', 'b@x.com', 'c@x.com'])
  })

  test('splits on commas', () => {
    expect(parseEmailList('a@x.com,b@x.com,c@x.com')).toEqual(['a@x.com', 'b@x.com', 'c@x.com'])
  })

  test('splits on a mix of semicolons and commas', () => {
    expect(parseEmailList('a@x.com;b@x.com,c@x.com')).toEqual(['a@x.com', 'b@x.com', 'c@x.com'])
  })

  test('trims whitespace around each entry', () => {
    expect(parseEmailList('  a@x.com ; b@x.com ,  c@x.com  ')).toEqual(['a@x.com', 'b@x.com', 'c@x.com'])
  })

  test('drops empty entries produced by trailing/leading/duplicate separators', () => {
    expect(parseEmailList('a@x.com;;b@x.com,,,')).toEqual(['a@x.com', 'b@x.com'])
    expect(parseEmailList(';,;')).toEqual([])
  })

  test('coerces non-string input to a string before parsing', () => {
    expect(parseEmailList(12345)).toEqual(['12345'])
  })

  test('returns a single-entry array when there is no separator', () => {
    expect(parseEmailList('a@x.com')).toEqual(['a@x.com'])
  })
})

describe('isValidEmailList', () => {
  test('treats empty input as valid when requireNonEmpty is not set (field optional by default)', () => {
    expect(isValidEmailList('')).toBe(true)
    expect(isValidEmailList(undefined)).toBe(true)
    expect(isValidEmailList(null)).toBe(true)
  })

  test('treats empty input as invalid when requireNonEmpty is true', () => {
    expect(isValidEmailList('', { requireNonEmpty: true })).toBe(false)
    expect(isValidEmailList('   ', { requireNonEmpty: true })).toBe(false)
  })

  test('accepts a single well-formed address', () => {
    expect(isValidEmailList('a@x.com')).toBe(true)
  })

  test('accepts multiple well-formed addresses separated by semicolons or commas', () => {
    expect(isValidEmailList('a@x.com;b@x.com,c@x.com')).toBe(true)
  })

  test('rejects a list containing a malformed address', () => {
    expect(isValidEmailList('a@x.com;not-an-email')).toBe(false)
    expect(isValidEmailList('missing-at-sign.com')).toBe(false)
    expect(isValidEmailList('a@b')).toBe(false)
    expect(isValidEmailList('a @x.com')).toBe(false)
  })

  test('rejects if any single one of several addresses is malformed', () => {
    expect(isValidEmailList('good@x.com;bad@;also-good@y.com')).toBe(false)
  })

  test('requireNonEmpty:true still validates format when a list is present', () => {
    expect(isValidEmailList('a@x.com', { requireNonEmpty: true })).toBe(true)
    expect(isValidEmailList('not-an-email', { requireNonEmpty: true })).toBe(false)
  })
})
