// setAccesLevels() builds the whole sidebar menu tree and is too large to
// cover exhaustively. This focuses narrowly on the designation-based gating
// (isCeoOrCfo / isAdminDesignation) under the 'Setup' section:
//
//   'Employees' (2-1) is gated to CEO / CFO / admin.
//   'Parties'   (2-2) is open to EVERY user, including one with no token.
//
// Parties was briefly gated alongside Employees, and these tests asserted
// that. It isn't any more: every user can create and edit parties, and the
// restriction moved to whether a party may be given a ledger - the Non-GL
// checkbox in the party's account info. That gate lives in
// functions/checkPartyCreateAccess.js (enforced on the backend by
// routes/clients + functions/requireDesignation.js) and is covered by
// __tests__/checkPartyCreateAccess.test.js, not here. The assertions below
// deliberately pin Parties as visible so it doesn't get re-gated by accident.
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

  test('an ordinary employee designation sees Parties but not Employees', () => {
    Cookies.get.mockReturnValue('valid.jwt.token')
    jwt_decode.mockReturnValue({ designation: 'employee', access: 'Commodity' })

    const items = setAccesLevels(jest.fn(), false)
    const setup = findParent(items, '2')

    // Setup is always present (Fiscal Years is visible to everyone). Employees
    // stays closed to a non-privileged designation; Parties is open to all -
    // what such a user can't do is untick Non-GL to attach a ledger.
    expect(setup).toBeTruthy()
    expect(findChild(setup, '2-1')).toBeFalsy()
    expect(findChild(setup, '2-2')).toMatchObject({ label: 'Parties' })
  })

  test('missing/undecodable designation keeps Employees closed but still sees Parties', () => {
    Cookies.get.mockReturnValue('valid.jwt.token')
    jwt_decode.mockReturnValue({ access: 'Commodity' }) // no designation field

    const items = setAccesLevels(jest.fn(), false)
    const setup = findParent(items, '2')

    // Employees defaults closed rather than open when the designation can't be
    // read. Parties is unconditional, so it is present here too.
    expect(findChild(setup, '2-1')).toBeFalsy()
    expect(findChild(setup, '2-2')).toMatchObject({ label: 'Parties' })
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
    // Parties is built unconditionally, so it survives even a missing token.
    // Nothing is reachable without a session anyway - the backend rejects
    // every request, and setAccesLevels triggers a logout on this path.
    expect(findChild(setup, '2-2')).toMatchObject({ label: 'Parties' })
  })
})
