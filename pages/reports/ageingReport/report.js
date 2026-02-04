import React from 'react';
import AgeingDetail from '/Components/Layouts/Reports/AgeingReport/AgeingDetail';
import Summary from '/Components/Layouts/Reports/AgeingReport/AgeingSummary';
import Weekly from '/Components/Layouts/Reports/AgeingReport/AgeingWeekly';
import axios from 'axios';

const report = ({query, result}) => {
  return (
    <div className='base-page-layout'>
      {query.ageing_reportType === "Ageing Detail" ? 
        <AgeingDetail query={query} result={result}/>
        :null
      }
      {query.ageing_reportType === "Ageing Summary" ? 
        <Summary query={query} result={result}/>
        :null
      }
       {query.ageing_reportType === "Ageing Weekly" ? 
        <Weekly query={query} result={result}/>
        :null
      }
    </div>
  )
}

export default report

export async function getServerSideProps(context) {
  const { query } = context;
  console.log("Summary Query:", query)
  const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/ageingSummary`,{headers:{...query}}).then((x)=>x.data);
  // result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/ageingReport`,{headers:{...query}}).then((x)=>x.data);

  return{ 
    props: {
      query,
      result
    }
  }
}