import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  approved: '0'
}

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setApproved: (state, action) => {
      state.approved = action.payload
    },
  },
})

export const { setApproved } = invoiceSlice.actions

export default invoiceSlice.reducer