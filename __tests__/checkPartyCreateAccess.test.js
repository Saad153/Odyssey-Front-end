jest.mock('js-cookie', () => ({ get: jest.fn() }))
jest.mock('jwt-decode', () => jest.fn())

const Cookies = require('js-cookie')
const jwt_decode = require('jwt-decode')
const { checkPartyCreateAccess, hasPartyCreateDesignation } = require('functions/checkPartyCreateAccess')

describe('hasPartyCreateDesignation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each(['ceo', 'cfo', 'admin'])('grants access for designation "%s"', (designation) => {
    jwt_decode.mockReturnValue({ designation })
    expect(hasPartyCreateDesignation('valid.jwt.token')).toBe(true)
  })

  test.each(['CEO', 'Cfo', 'ADMIN', 'CeO'])('grants access case-insensitively for "%s"', (designation) => {
    jwt_decode.mockReturnValue({ designation })
    expect(hasPartyCreateDesignation('valid.jwt.token')).toBe(true)
  })

  test('denies access for a disallowed designation', () => {
    jwt_decode.mockReturnValue({ designation: 'employee' })
    expect(hasPartyCreateDesignation('valid.jwt.token')).toBe(false)
  })

  test('denies access when designation is missing from the decoded token', () => {
    jwt_decode.mockReturnValue({})
    expect(hasPartyCreateDesignation('valid.jwt.token')).toBe(false)
  })

  test('returns false when jwt-decode throws (malformed/undecodable token)', () => {
    jwt_decode.mockImplementation(() => {
      throw new Error('Invalid token specified')
    })
    expect(hasPartyCreateDesignation('not-a-real-jwt')).toBe(false)
    expect(jwt_decode).toHaveBeenCalledWith('not-a-real-jwt')
  })

  test('returns false for undefined token without attempting to decode', () => {
    expect(hasPartyCreateDesignation(undefined)).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })

  test('returns false for null token without attempting to decode', () => {
    expect(hasPartyCreateDesignation(null)).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })

  test('returns false for empty-string token without attempting to decode', () => {
    expect(hasPartyCreateDesignation('')).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })

  test('returns false for the literal string "undefined"', () => {
    expect(hasPartyCreateDesignation('undefined')).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })
})

describe('checkPartyCreateAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('reads the token from js-cookie and grants access for an allowed designation', () => {
    Cookies.get.mockReturnValue('cookie.jwt.token')
    jwt_decode.mockReturnValue({ designation: 'ceo' })

    expect(checkPartyCreateAccess()).toBe(true)
    expect(Cookies.get).toHaveBeenCalledWith('token')
    expect(jwt_decode).toHaveBeenCalledWith('cookie.jwt.token')
  })

  test('denies access when the cookie holds a disallowed designation', () => {
    Cookies.get.mockReturnValue('cookie.jwt.token')
    jwt_decode.mockReturnValue({ designation: 'employee' })

    expect(checkPartyCreateAccess()).toBe(false)
  })

  test('denies access when there is no token cookie', () => {
    Cookies.get.mockReturnValue(undefined)

    expect(checkPartyCreateAccess()).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })

  test('denies access when the token cookie is the literal string "undefined"', () => {
    Cookies.get.mockReturnValue('undefined')

    expect(checkPartyCreateAccess()).toBe(false)
    expect(jwt_decode).not.toHaveBeenCalled()
  })
})
