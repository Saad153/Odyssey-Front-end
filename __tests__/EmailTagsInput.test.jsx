import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('apis/axiosClient', () => ({ get: jest.fn() }))

const axiosClient = require('apis/axiosClient')

import EmailTagsInput from '../Components/Shared/EmailTagsInput'

// EmailTagsInput has a deliberate MIN_CHARS=2 threshold before it queries for
// suggestions, so a freshly-focused/1-character field doesn't dump the whole
// usage-history table into the dropdown.

const Wrapper = () => {
  const [value, setValue] = React.useState([])
  return <EmailTagsInput value={value} onChange={setValue} placeholder="To" />
}

const getInput = (container) => container.querySelector('input')

describe('EmailTagsInput suggestion threshold', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('typing 1 character does not query for or show suggestions', async () => {
    const { container } = render(<Wrapper />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: 'j' } })

    // Give any (incorrectly-fired) debounce a chance to resolve.
    await new Promise((res) => setTimeout(res, 300))

    expect(axiosClient.get).not.toHaveBeenCalled()
  })

  test('typing 2+ characters queries for and shows matching suggestions', async () => {
    axiosClient.get.mockResolvedValue({
      data: { status: 'success', result: ['john@example.com', 'jane@example.com'] },
    })

    const { container } = render(<Wrapper />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: 'jo' } })

    await waitFor(() => expect(axiosClient.get).toHaveBeenCalled(), { timeout: 2000 })

    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/invoice/suggestEmails'),
      expect.objectContaining({ headers: { q: 'jo' } })
    )

    await waitFor(() => expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0))
  })

  test('multiple emails can be entered, separated by semicolons/commas', async () => {
    axiosClient.get.mockResolvedValue({ data: { status: 'success', result: [] } })
    let currentValue = []
    const handleChange = jest.fn((v) => { currentValue = v })

    const ControlledWrapper = () => {
      const [value, setValue] = React.useState([])
      return (
        <EmailTagsInput
          value={value}
          onChange={(v) => { handleChange(v); setValue(v) }}
          placeholder="To"
        />
      )
    }

    const { container } = render(<ControlledWrapper />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: 'a@x.com;b@x.com,' } })

    await waitFor(() => expect(handleChange).toHaveBeenCalled())
    const lastCallValue = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
    expect(lastCallValue).toEqual(expect.arrayContaining(['a@x.com', 'b@x.com']))
  })
})
