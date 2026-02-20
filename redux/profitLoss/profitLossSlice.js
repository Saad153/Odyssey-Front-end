import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment';

  const initialState = {
    from: moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString(),
    to: moment().format("YYYY-MM-DD"),
    company: 4,
    jobType: ['SE','SI','AE','AI'],
    subType: ["FCL","LCL","AIR"],
    reportType: "viewer",
    salesRepresentative:"",
    overSeasagent: "",
    client:""
  };

  export const profitLossSlice = createSlice({
  name: 'profitloss',
  initialState,
  reducers: {
    setFrom(state, action) {
      state.from = action.payload;
    },
    setTo(state, action) {
      state.to = action.payload;
    },
    setCompany(state, action) {
      state.company = action.payload;
    },
    setJobType(state, action) {
      state.jobType = action.payload;
    },
    setSubType(state, action) {
      state.subType = action.payload;
    },
    setReportType(state, action) {
      state.reportType = action.payload;
    },
    setSalesRepresentative(state, action) {
      state.salesRepresentative = action.payload;
    },
    setOverSeasagent(state, action) {
      state.overSeasagent = action.payload;
    },
    setClient(state, action) {
      state.client = action.payload;
    },
  },
})

export const { setFrom, setTo, setCompany,setClient,setJobType,setOverSeasagent,setReportType,setSalesRepresentative,setSubType } = profitLossSlice.actions

export default profitLossSlice.reducer