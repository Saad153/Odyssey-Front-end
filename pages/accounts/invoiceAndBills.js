import React from 'react';
import InvoiceAndBills from 'Components/Layouts/AccountsComp/InvoiceAndBills';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const invoiceAndBills = ({invoiceData}) => {
  return (
    <InvoiceAndBills invoiceData={invoiceData} />
  )
}
export default invoiceAndBills

export async function getServerSideProps({req,res}){
  const cookies = new Cookies(req, res)
  const token = cookies.get('token');
  try{
    const invoiceData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_FILTERED_INVOICES,{
      headers:{ Authorization: token, "type": "Job Invoice" }
    }).then((x)=>x.data);
  
    return{
        props: { invoiceData:invoiceData }
    }
  }catch(error){
    return handleSSRAuthError(error, res, cookies);
  }
}