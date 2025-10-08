import { createSlice } from '@reduxjs/toolkit'
import Cookies, { set } from 'js-cookie';
import moment from 'moment';

  const initialState = {
    type: "OI",
    payType: "Recievable",
    operation: "AE",
    currency: "PKR",
    ex_rate: 1.0,
    total: 0,
    createdAt: moment().month() < 6 
  ? moment().subtract(1, 'year').startOf('year').month(5).endOf('month')
  : moment().startOf('year').month(5).endOf('month'),
    accounts: [],
    account: undefined,
    accountType: "client",
    creditAccount: undefined,
    creditAccounts: [],
  };

  export const openingInvoiceSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setField(state, action) {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      } else {
        console.warn(`Field "${field}" does not exist in the state.`);
      }
    },
    resetState(state, action) {
      console.log("reset")
      return initialState;
      // state = initialState
    },
    resetOpeningInvoice(state, action) {
      console.log("reset")
      return initialState;
      // state = initialState
    },
    
  },
})

export const { setField, resetState, resetOpeningInvoice } = openingInvoiceSlice.actions

export default openingInvoiceSlice.reducer