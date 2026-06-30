import React from 'react';
import AgeingReport from '../../../Components/Layouts/Reports/AgeingReport';
import Summary from 'Components/Layouts/Reports/AgeingReport/AgeingSummary';
import Weekly from 'Components/Layouts/Reports/AgeingReport/AgeingWeekly'
import axiosClient from '/apis/axiosClient';
import moment from "moment";

const ageingReport = ({query, result}) => {
  console.log("result", result)
  return (
    <>
      <AgeingReport query={query} result={result}/>
    </>
  )
}


export default ageingReport
