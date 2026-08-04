// setAccesLevels() builds the whole sidebar menu tree and is too large to
// cover exhaustively. This focuses narrowly on the designation-based gating
// (isCeoOrCfo / isAdminDesignation) that controls the 'Employees' and
// 'Parties' entries under the 'Setup' section - recently changed so Parties
// is gated the same way Employees already was.
//
// setAccesLevels reads the token from js-cookie itself (not a function
// param) and keeps module-level state (`firstCall`/`tempToken`) across
// calls, so each test resets the module registry and re-requires fresh
// mocks to get a clean "first call after page load" state.

jest.mock('js-cookie', () => ({ get: jest.fn() }))
jest.mock('jwt-decode', () => jest.fn())
jest.mock('functions/logout', () => jest.fn())
jest.mock('redux/tabs/tabSlice', () => ({ incrementTab: jest.fn((x) => x) }))

const findParent = (items, key) => items.find((x) => x && x.key === key)
const findChild = (parent, key) => parent?.children?.find((x) => x && x.key === key)

describe('setAccesLevels designation gating (Employees / Parties)', () => {
  let Cookies
  let jwt_decode
  let setAccesLevels

  beforeEach(() => {
    jest.resetModules()
    jest.mock('js-cookie', () => ({ get: jest.fn() }))
    jest.mock('jwt-decode', () => jest.fn())
    jest.mock('functions/logout', () => jest.fn())
    jest.mock('redux/tabs/tabSlice', () => ({ incrementTab: jest.fn((x) => x) }))

    Cookies = require('js-cookie')
    jwt_decode = require('jwt-decode')
    ;({ setAccesLevels } = require('functions/setAccesLevels'))
  })

  test.each(['ceo', 'cfo', 'admin', 'CEO', 'CfO'])(
    'designation "%s" sees both Employees and Parties under Setup',
    (designation) => {
      Cookies.get.mockReturnValue('valid.jwt.token')
      jwt_decode.mockReturnValue({ designation, access: 'Commodity' })

      const items = setAccesLevels(jest.fn(), false)
      const setup = findParent(items, '2')

      expect(setup).toBeTruthy()
      expect(findChild(setup, '2-1')).toMatchObject({ label: 'Employees' })
      expect(findChild(setup, '2-2')).toMatchObject({ label: 'Parties' })
    }
  )

  test('an ordinary employee designation does not see Employees or Parties under Setup', () => {
    Cookies.get.mockReturnValue('valid.jwt.token')
    jwt_decode.mockReturnValue({ designation: 'employee', access: 'Commodity' })

    const items = setAccesLevels(jest.fn(), false)
    const setup = findParent(items, '2')

    // Setup is always present (Fiscal Years is visible to everyone), but its
    // Employees/Parties slots must be null for a non-privileged designation.
    expect(setup).toBeTruthy()
    expect(findChild(setup, '2-1')).toBeFalsy()
    expect(findChild(setup, '2-2')).toBeFalsy()
  })

  test('missing/undecodable designation does not see Employees or Parties (defaults closed, not open)', () => {
    Cookies.get.mockReturnValue('valid.jwt.token')
    jwt_decode.mockReturnValue({ access: 'Commodity' }) // no designation field

    const items = setAccesLevels(jest.fn(), false)
    const setup = findParent(items, '2')

    expect(findChild(setup, '2-1')).toBeFalsy()
    expect(findChild(setup, '2-2')).toBeFalsy()
  })

  test('admin designation grants full menu access independent of the access-level string', () => {
    Cookies.get.mockReturnValue('valid.jwt.token')
    // Deliberately no "admin" in the access-level string - only the
    // designation should be enough to unlock everything.
    jwt_decode.mockReturnValue({ designation: 'admin', access: 'Commodity' })

    const items = setAccesLevels(jest.fn(), false)

    expect(findParent(items, '4')).toBeTruthy() // Sea Jobs
    expect(findParent(items, '7')).toBeTruthy() // Air Jobs
    expect(findParent(items, '2')).toBeTruthy() // Setup
    expect(findParent(items, '3')).toBeTruthy() // Accounts
    expect(findParent(items, '5')).toBeTruthy() // Reports
  })

  test('no token cookie still returns a menu (Setup only, no crash)', () => {
    Cookies.get.mockReturnValue(undefined)

    const items = setAccesLevels(jest.fn(), false)
    const setup = findParent(items, '2')

    expect(setup).toBeTruthy()
    expect(findChild(setup, '2-1')).toBeFalsy()
    expect(findChild(setup, '2-2')).toBeFalsy()
  })
})
