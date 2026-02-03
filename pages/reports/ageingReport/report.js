import React from 'react';
import AgeingDetail from '/Components/Layouts/Reports/AgeingReport/AgeingDetail';
import axios from 'axios';

const report = ({query, result}) => {
  return (
    <div className='base-page-layout'>
      <AgeingDetail query={query} result={result} />
    </div>
  )
}

export default report

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