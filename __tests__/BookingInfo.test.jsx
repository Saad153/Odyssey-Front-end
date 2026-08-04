import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Booking Info was deliberately changed so that clicking a party label
// (Client, Shipper, Consignee, Forwarder, etc.) does NOT navigate anywhere -
// only the Vessel/Voyage label (owned by Carrier.js, wired through the
// pageLinking prop) should still navigate. These tests exercise the real
// `pageLinking` closure and the real `PartyLabel` markup from BookingInfo.js,
// and the real "Vessel *" label from the (unmocked) Carrier.js.

jest.mock('next/router', () => ({ push: jest.fn() }))

jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => []),
  useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('redux/tabs/tabSlice', () => ({
  incrementTab: jest.fn((payload) => ({ type: 'tabs/incrementTab', payload })),
  removeTab: jest.fn((payload) => ({ type: 'tabs/removeTab', payload })),
}))

jest.mock('redux/BlCreation/blCreationSlice', () => ({
  addBlCreationId: jest.fn((payload) => ({ type: 'bl/addBlCreationId', payload })),
}))

jest.mock('apis/pickLists', () => ({
  getAllPorts: jest.fn(() => Promise.resolve([])),
  getAllDestinations: jest.fn(() => Promise.resolve([])),
  getAllAirports: jest.fn(() => Promise.resolve([])),
}))

jest.mock('apis/jobs', () => ({
  getChargeHeads: jest.fn(() => Promise.resolve({ charges: [] })),
}))

jest.mock('functions/checkEditAccess', () => ({ checkEditAccess: jest.fn(() => false) }))

jest.mock('Components/Shared/Notification', () => jest.fn())

// Heavy/irrelevant sub-components - stub to plain no-render components so the
// tree mounts without needing a real react-hook-form context.
jest.mock('Components/Layouts/JobsLayout/Jobs/CopyFromJobModal', () => () => null)
jest.mock('Components/Layouts/JobsLayout/Jobs/WeightComp', () => () => null)
jest.mock('Components/Layouts/JobsLayout/Jobs/BLInfo', () => () => null)
jest.mock('Components/Layouts/JobsLayout/Jobs/AddPort', () => () => null)
jest.mock('Components/Layouts/JobsLayout/Jobs/Notes', () => () => null)

jest.mock('Components/Shared/Form/SelectComp', () => () => null)
jest.mock('Components/Shared/Form/SelectSearchComp', () => () => null)
jest.mock('Components/Shared/Form/CheckGroupComp', () => () => null)
jest.mock('Components/Shared/Form/DateComp', () => () => null)
jest.mock('Components/Shared/Form/TimeComp', () => () => null)
jest.mock('Components/Shared/Form/InputComp', () => () => null)
jest.mock('Components/Shared/Form/CustomBoxSelect', () => () => null)

// NOTE: Carrier.js (and its ./Dates import) are intentionally NOT mocked -
// it owns the real "Vessel *" label wired to the pageLinking prop, which is
// what this test needs to exercise for comparison against the party labels.

const Router = require('next/router')

import BookingInfo from '../Components/Layouts/JobsLayout/Jobs/BookingInfo'

const noop = () => {}

const buildState = () => ({
  edit: true,
  voyageVisible: false,
  isModalOpen: false,
  InvoiceList: [],
  equipments: [],
  voyageList: [],
  selectedRecord: { id: 1, jobNo: 'SE-1', shippingLineId: 1, Bl: null },
  fields: {
    party: { shipper: [], consignee: [], notify: [], client: [] },
    vendor: { transporter: [], forwarder: [], overseasAgent: [], chaChb: [], airLine: [], sLine: [], localVendor: [] },
    commodity: [],
    vessel: [],
    sr: [],
  },
})

const watchMap = {
  transportCheck: [],
  transporterId: '',
  customCheck: [],
  customAgentId: '',
  vesselId: '',
  VoyageId: '',
  ClientId: '',
  shipperId: '',
  consigneeId: '',
  overseasAgentId: '',
  airLineId: '',
  forwarderId: '',
  shippingLineId: '',
  localVendorId: '',
  approved: [],
  canceled: false,
}

const useWatchStub = ({ name } = {}) => {
  if (!name) return { freightType: 'Prepaid', approved: [] }
  return watchMap[name]
}

const renderBookingInfo = (overrides = {}) => {
  const props = {
    handleSubmit: (fn) => fn,
    setValue: jest.fn(),
    onEdit: jest.fn(),
    companyId: '1',
    register: jest.fn(() => ({})),
    control: {},
    errors: {},
    state: buildState(),
    useWatch: useWatchStub,
    dispatch: jest.fn(),
    reset: jest.fn(),
    id: 'new',
    type: 'SE',
    ...overrides,
  }
  return render(<BookingInfo {...props} />)
}

describe('BookingInfo party labels are not clickable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('clicking the Client party label does not call Router.push', async () => {
    renderBookingInfo()
    const label = await screen.findByText('Client *')
    fireEvent.click(label)
    expect(Router.push).not.toHaveBeenCalled()
  })

  test('clicking the Consignee party label does not call Router.push', async () => {
    renderBookingInfo()
    const label = await screen.findByText('Consignee *')
    fireEvent.click(label)
    expect(Router.push).not.toHaveBeenCalled()
  })

  test('clicking the Forwarder/Coloader party label does not call Router.push', async () => {
    renderBookingInfo()
    const label = await screen.findByText('Forwarder/Coloader *')
    fireEvent.click(label)
    expect(Router.push).not.toHaveBeenCalled()
  })

  test('party label renders as plain (non-link) markup with no onClick wiring', async () => {
    renderBookingInfo()
    const label = await screen.findByText('Client *')
    // PartyLabel is a bare <div>; it must not carry the "custom-link" class
    // used elsewhere for genuinely clickable labels (e.g. Vessel).
    expect(label.className).not.toMatch('custom-link')
  })

  test('the Vessel label (owned by Carrier.js) still navigates via Router.push', async () => {
    renderBookingInfo()
    const vesselLabel = await screen.findByText('Vessel *')
    fireEvent.click(vesselLabel)
    await waitFor(() => expect(Router.push).toHaveBeenCalledWith('/setup/voyage/'))
  })
})
