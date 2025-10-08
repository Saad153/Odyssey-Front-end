// import React from 'react';
// import PaymentsReceipt from '/Components/Layouts/AccountsComp/PaymentsReceipt';
// import axios from 'axios';

// const paymentReceipt = ({id, voucherData}) => {
//   return <PaymentsReceipt id={id} voucherData={voucherData} />
// }
// export default paymentReceipt

// export async function getServerSideProps(context) {
//     const { params } = context;
//     let voucherData = {};
//     if(params.id!="new"&&params.id!="undefined"){
//         voucherData = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCHER_BY_ID_ADVANCED,{
//         headers:{ "id": `${params.id}` }
//         }).then((x)=>x.data.result);
//         if (!voucherData?.id) {
//             return {
//                 notFound: true
//             }
//         }
//     }
//     return{ 
//         props: {
//             voucherData,
//             id:params.id
//         }
//     }
// }

import React from 'react';
import PaymentsReceipt from '/Components/Layouts/AccountsComp/PaymentsReceipt';
import axios from 'axios';

// Simple in-memory cache (this will be reset on every server restart)
const cache = {};

const paymentReceipt = ({id, voucherData, query}) => {
  return <PaymentsReceipt id={id} voucherData={voucherData} q={query} />
}
export default paymentReceipt;

export async function getServerSideProps(context) {
  const { params, query } = context;
  let voucherData = {};
    console.log(params)
    console.log(">>",query)
  // Check cache first (cache key can be the `id`)
  if (cache[params.id]) {
    console.log('Returning cached data');
    voucherData = cache[params.id];  // Use the cached data
  } else if (params.id !== "new" && params.id !== "undefined") {
    // Fetch data from the API if it's not in the cache
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCHER_BY_ID_ADVANCED, {
        headers: { "id": `${params.id}` }
      });
      voucherData = response.data.result;

      if (!voucherData?.id) {
        return { notFound: true };
      }

      // Cache the data for future requests
      cache[params.id] = voucherData;
      console.log('Data fetched and cached');
    } catch (error) {
      console.error('Error fetching data:', error);
      return { notFound: true };
    }
  }

  return { 
    props: {
      voucherData,
      id: params.id,
      query: query
    }
  };
}
