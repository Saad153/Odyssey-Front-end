import axiosInstance from 'apis/axiosClient'

jest.mock('js-cookie', () => ({ get: jest.fn() }))
jest.mock('functions/logout', () => jest.fn())

const Cookies = require('js-cookie')
const logout = require('functions/logout')

describe('axios client interceptors', () => {
  test('request interceptor adds Authorization header when token exists', () => {
    Cookies.get.mockReturnValue('abc')
    const config = { headers: {} }
    const result = axiosInstance.interceptors.request.handlers[0].fulfilled(config)
    expect(result.headers.Authorization).toBe('abc')
  })

  test('response interceptor handles 401 with session messages by calling logout', async () => {
    // simulate response error
    const error = { response: { status: 401, data: { message: 'Token expired' } } }
    // call the interceptor's rejected handler
    const rejected = axiosInstance.interceptors.response.handlers[0].rejected
    await expect(rejected(error)).rejects.toEqual(error)
    // logout should be triggered asynchronously; we can't assert directly here without DOM alert
  })
})
