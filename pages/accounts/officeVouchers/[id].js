import React from 'react';
import OfficeVoucher from 'Components/Layouts/AccountsComp/OfficeVouchers/OfficeVoucher';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const officeVoucher = ({voucherData, id, employeeData}) => {
  return (
    <OfficeVoucher voucherData={voucherData} id={id} employeeData={employeeData} />
  )
}

export default officeVoucher

export async function getServerSideProps({ req, res, params }) {
    const cookies = new Cookies(req, res)
    const token = cookies.get('token');
  try{
    let voucherData = { }
    const employeeData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_EMPLOYEE_ID_AND_NAME, {
      headers:{ Authorization: token }
    }).then((x)=>x.data.result);
    if(params.id!="new") {
      voucherData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_OFFICE_VOUCHER_BY_ID,{
        headers:{ Authorization: token, "id": `${params.id}` }
      }).then((x)=>x.data.result);
        if (!voucherData.id) {
        return {
          notFound: true
        }
      }
    }
    return{
      props: {
        voucherData,
        id:params.id,
        employeeData
      }
    }
  }catch(error){
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}
