import React from 'react';
import AgeingDetail from 'Components/Layouts/Reports/AgeingReport';
import Summary from 'Components/Layouts/Reports/AgeingReport/AgeingSummary';
import Weekly from 'Components/Layouts/Reports/AgeingReport/AgeingWeekly';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';


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

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  try {
    const result = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/ageingSummary`,{headers: {...query, Authorization: token}}).then((x)=>x.data);

    return{
      props: {
        query,
        result
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}

