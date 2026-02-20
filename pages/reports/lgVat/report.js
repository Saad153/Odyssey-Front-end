import React from 'react';
import axios from 'axios';
import LgVat from '../../../Components/Layouts/Reports/LgVat';
import LGReport from '../../../Components/Layouts/Reports/LgVat/report';


const report = ({query, result}) => {
  return (
    <div className='base-page-layout'>
        <LGReport query={query} result={result}/>
       
      
    </div>
  )
}

export default report

export async function getServerSideProps(context) {
  const { query } = context;
  console.log("LG Query:", query)
 const result = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_MISC_GET_INCOME_STATEMENT,{
    headers:{
      "company":query.company,
      "from":query.from,
      "to":query.to,
      "currency":query.currency
  }}).then((x)=>x.data);

  return{ 
    props: {
      query,
      result
    }
  }
}