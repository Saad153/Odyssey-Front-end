import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  ageing_reportType: 'Ageing Summary',
  ageing_sdate: moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString(),
  ageing_edate: moment().toISOString(),
  ageing_accounts: [],
  ageing_account: undefined,
  ageing_company: [1, 3],
//   ageing_currency: "PKR",
  ageing_RP: ["Recievable", "Payble"],
  ageing_partyType: "Local",
  ageing_reportData: [],
};



export const ageingSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setAgeingField(state, action) {
        const { field, value } = action.payload;
        if (field in state) {
            state[field] = value;
        } else {
            console.warn(`P/R Field "${field}" does not exist in the state.`);
        }
    },
    ageingResetState(state, action) {
      console.log("reset")
      return initialState;
      // state = initialState
    },
  },
  
  
});


export const { setAgeingField, ageingResetState } = ageingSlice.actions;

export default ageingSlice.reducer;
