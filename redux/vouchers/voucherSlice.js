import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  CompanyId:1,
  currency:"PKR",
  exRate:"1.00",
  chequeDate:moment(),
  chequeNo:"",
  costCenter:"KHI",
  payTo:"",
  voucherNarration:"",
  type:"",
  vType:"",
  voucher_id: "",
  voucher_No: "",
  date: moment(),
  settlementAccounts: [],
  cAccounts: [],
  settlementAccount: undefined,
  settleVoucherHead: {
    defaultAmount: 0.0,
    amount: 0.0,
    type: "",
    narration: "",
    settlement: "",
    accountType: "payAccount",
    createdAt: moment()
  },
  Voucher_Heads: [],
  debitTotal: 0.0,
  creditTotal: 0.0,
  closingBalance: 0.0,
  id: '',
  edit: false
}

export const voucherSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setField(state, action) {
        const { field, value } = action.payload;
        if (field in state) {
          state[field] = value;
        } else {
          console.warn(`Voucher Field "${field}" does not exist in the state.`);
        }
      },
    resetState(state, action) {
      return initialState;
    },
    resetVouchers(state, action) {
      return initialState;
    },
  },
});

export const { setField, resetState, resetVouchers } = voucherSlice.actions;

export default voucherSlice.reducer;
