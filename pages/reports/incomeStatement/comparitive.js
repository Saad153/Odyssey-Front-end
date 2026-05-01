import React from 'react';
import axios from 'axios';
import Comparitive from '../../../Components/Layouts/Reports/IncomeStatement/Comparitive';

const comparitive = ({query, result}) => {
  return (
    <div className='base-page-layout'>
      <Comparitive query={query} result={result} />
    </div>
  )
}

export default comparitive

export async function getServerSideProps(context) {
  const { query } = context;
  const result = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_MISC_GET_INCOME_STATEMENT_COMP,{
    params:{
      "company":query.company,
      "from":query.from,
      "to":query.to,
      "from1":query.from1,
      "to1":query.to1,
      "accountLevel":query.accountLevel,
      "currency":query.currency
  }}).then((x)=>x.data);

  return{ 
    props: {
      result,
      query
    }
  }
}