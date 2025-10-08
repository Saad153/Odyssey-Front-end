import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  type: 'client',
  payType: 'Recievable',
  currency: 'PKR',
  search: '',
  searchAccount: '',
  accounts: [],
  oldVouchers: [],
  oldVouchersList: [],
  selectedAccount: undefined,
  voucherNarration: "",
  edit: false,
  editing: false,
  voucherId: undefined,
  invoices: [],
  load: false,
  transactionMode: 'Cash',
  receivingAccounts: [],
  receivingAccount: undefined,
  adjustAccounts: [],
  bankChargesAccount: undefined,
  bankChargesAmount: 0.0,
  taxAccount: undefined,
  taxAmount: 0.0,
  taxPercent: 0.0,
  gainLossAccount: undefined,
  gainLossAmount: 0.0,
  subType: 'Cash',
  autoKnockOff: false,
  percent: false,
  checkNo: "",
  checkDate: moment(),
  date: moment(),
  totalReceivable: 0.0,
  exRate: 1.0,
  modal: false,
  transactions: [],
  onAccount: 'client',
  delete: false,
  advance: false,
  knockOffAmount: 0.0
};

export const paymentRecieptSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setField(state, action) {
        const { field, value } = action.payload;
        if (field in state) {
          state[field] = value;
        } else {
          console.warn(`P/R Field "${field}" does not exist in the state.`);
        }
      },
    setType(state, action) {
      state.type = action.payload;
    },
    setPayType(state, action) {
      state.payType = action.payload;
    },
    resetState(state, action) {
      console.log("reset")
      return initialState;
      // state = initialState
    },
  },
});

export const { setField, resetState } = paymentRecieptSlice.actions;

export default paymentRecieptSlice.reducer;
