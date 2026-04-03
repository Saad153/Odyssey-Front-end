import React from 'react';
import Summary from '/Components/Layouts/Reports/JobPL/Summary';

const summary = ({query, result}) => {
  return (
    <Summary query={query} result={result} />
  )
}

export default summary

export async function getServerSideProps(context) {
  const { query } = context;
  const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/jobPnLSummary`,{
    query:{ ...query }
  }).catch((err) => {
    console.log(err)
  });

  return{ 
    props: {
      query,
      result
    }
  }
}