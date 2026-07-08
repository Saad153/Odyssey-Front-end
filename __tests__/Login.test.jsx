import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('apis/axiosClient', () => ({ post: jest.fn() }))
jest.mock('js-cookie', () => ({ set: jest.fn() }))
jest.mock('next/router', () => ({ push: jest.fn() }))
jest.mock('jwt-decode', () => jest.fn())

const axiosClient = require('apis/axiosClient')
const Cookies = require('js-cookie')
const Router = require('next/router')
const jwt_decode = require('jwt-decode')

import Login from '../Components/Layouts/Login'

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('successful login sets cookies and redirects', async () => {
    axiosClient.post.mockResolvedValue({ data: { message: 'Success', token: 'fake.jwt' } })
    jwt_decode.mockReturnValue({ designation: 'Dev', username: 'tester', id: 123 })

    render(<Login sessionData={{ isLoggedIn: false }} />)

    fireEvent.change(screen.getByPlaceholderText('Enter your username...'), { target: { value: 'u' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password...'), { target: { value: 'p' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(Cookies.set).toHaveBeenCalledWith('token', 'fake.jwt', { expires: 1 }))
    expect(Cookies.set).toHaveBeenCalledWith('designation', 'Dev', { expires: 1 })
    expect(Cookies.set).toHaveBeenCalledWith('username', 'tester', { expires: 1 })
    expect(Cookies.set).toHaveBeenCalledWith('loginId', 123, { expires: 1 })
    expect(Router.push).toHaveBeenCalledWith('/')
  })

  test('invalid credentials shows error message', async () => {
    axiosClient.post.mockResolvedValue({ data: { message: 'Invalid' } })

    render(<Login sessionData={{ isLoggedIn: false }} />)

    fireEvent.change(screen.getByPlaceholderText('Enter your username...'), { target: { value: 'u' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password...'), { target: { value: 'p' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('Wrong username or password')).toBeInTheDocument())
  })

  test('force login flow shows modal on 409 response', async () => {
    axiosClient.post.mockRejectedValue({ response: { status: 409 } })

    render(<Login sessionData={{ isLoggedIn: false }} />)

    fireEvent.change(screen.getByPlaceholderText('Enter your username...'), { target: { value: 'u' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password...'), { target: { value: 'p' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('User Already Logged In')).toBeInTheDocument())
  })
})
