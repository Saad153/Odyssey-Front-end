import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  audit_reportType: 'Audit Log',
  audit_sdate: moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).format("MM-DD-YYYY"): moment().set({ month: 6, date: 1 }).format("MM-DD-YYYY"),
  audit_edate: moment().format("MM-DD-YYYY"),
  audit_form: 'All',
  audit_user: 'All',
  audit_action: 'All',
  audit_FormNames: [],
  audit_Types: [],
  audit_Users: [],
  audit_History: [],
//   audit_account: undefined,
//   audit_company: [1, 3],
// //   audit_currency: "PKR",
//   audit_RP: ["Recievable", "Payble"],
//   audit_partyType: "Local",
//   audit_reportData: [],
};


export const auditSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setAuditField(state, action) {
        const { field, value } = action.payload;
        if (field in state) {
            state[field] = value;
        } else {
            console.warn(`P/R Field "${field}" does not exist in the state.`);
        }
    },
    auditResetState(state, action) {
      console.log("reset")
      return initialState;
      // state = initialState
    },
  },
  
  
});


export const { setAuditField, auditResetState } = auditSlice.actions;

export default auditSlice.reducer;