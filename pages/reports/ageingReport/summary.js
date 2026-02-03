import React from 'react';
import AgeingSummary from '/Components/Layouts/Reports/AgeingReport/AgeingSummary';
import axios from 'axios';

const summary = ({query, result}) => {
  return (
    <div className='base-page-layout'>
      <AgeingSummary query={query} result={result} />
    </div>
  )
}

export default summary

export async function getServerSideProps(context) {
  const { query } = context;
  const result = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_MISC_GET_INCOME_STATEMENT,{
    headers:{
      "company":query.company,
      "from":query.from,
      "to":query.to,
      "currency":query.currency
  }}).then((x)=>x.data);

  return{ 
    props: {
      result,
      query
    }
  }
}