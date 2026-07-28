import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: '',
  fiscalYears:[]
}

export const fiscalYearSlice = createSlice({
  name: 'fiscalYear',
  initialState,
  reducers: {
    fiscalYearSelect: (state, action) => {
      state.value = action.payload
    },
    addFiscalYears: (state, action) => {
      state.fiscalYears = action.payload
    },
  },
})

export const { fiscalYearSelect, addFiscalYears } = fiscalYearSlice.actions

export default fiscalYearSlice.reducer
