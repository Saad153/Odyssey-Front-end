import logout from 'functions/logout'

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}))
jest.mock('functions/setAccesLevels', () => ({ setTempToken: jest.fn() }))
jest.mock('next/router', () => ({ push: jest.fn() }))

const Cookies = require('js-cookie')
const Router = require('next/router')
const { setTempToken } = require('functions/setAccesLevels')

describe('logout function', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    Cookies.get.mockReturnValue('token-value')
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  test('successful logout sends the token and clears session', async () => {
    global.fetch.mockResolvedValue({ ok: true })

    await logout()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/authRoutes/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'token-value' }),
      })
    )
    expect(Cookies.remove).toHaveBeenCalledTimes(5)
    expect(Cookies.remove).toHaveBeenCalledWith('token')
    expect(Cookies.remove).toHaveBeenCalledWith('username')
    expect(Cookies.remove).toHaveBeenCalledWith('companyId')
    expect(Cookies.remove).toHaveBeenCalledWith('designation')
    expect(Cookies.remove).toHaveBeenCalledWith('loginId')
    expect(setTempToken).toHaveBeenCalledWith(null, true)
    expect(Router.push).toHaveBeenCalledWith('/login')
  })

  test('failed logout shows the server error and does not clear session', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'err' }) })
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {})

    await logout()

    expect(alertSpy).toHaveBeenCalledWith('err')
    expect(Cookies.remove).not.toHaveBeenCalled()
    expect(setTempToken).not.toHaveBeenCalled()
    expect(Router.push).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  test('failed logout falls back to a generic message when the server sends none', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {})

    await logout()

    expect(alertSpy).toHaveBeenCalledWith('Logout failed')
    alertSpy.mockRestore()
  })
})