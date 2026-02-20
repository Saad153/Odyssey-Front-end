import React from 'react';
import axios from 'axios';
import AuditReport from '/Components/Layouts/Reports/AuditLog/report';

const report = ({query, result}) => {
  return (
    <div className='base-page-layout'>
      <AuditReport query={query} result={result}/>
    </div>
  )
}

export default report

export async function getServerSideProps(context) {
  const { query } = context;
  console.log("Audit Query:", query)
  const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getHistory`,{headers:{...query}}).then((x)=>x.data);

  return{ 
    props: {
      query,
      result
    }
  }
}