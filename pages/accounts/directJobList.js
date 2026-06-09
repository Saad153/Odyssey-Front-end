import React from 'react';
import DirectJobList from 'Components/Layouts/AccountsComp/directJob/list';
import Cookies from 'cookies';
import axios from 'axios';

const directJobList = () => {
  return (
    <DirectJobList/>
  )
}

export default directJobList
// export async function getServerSideProps({req, res}) {
//   const cookies = new Cookies(req, res);
//   const companyId = await cookies.get('companyId');
//   const sessionData = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,{
//     headers:{"x-access-token": `${cookies.get('token')}`}
//   }).then((x)=>x.data);

//   const voucherData = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VOUCHERS,{
//     headers:{
//       "id":`${companyId}`,
//       "offset":0
//     }
//   })
//   .then((x)=>x.data);
//   return{ 
//     props: { sessionData, voucherData }
//   }
// }
