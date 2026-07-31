import React from 'react';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import Vendor from 'Components/Layouts/Setup/Vendor/';
import { handleSSRAuthError } from 'functions/withAuthRedirect';
import { hasPartyCreateDesignation } from 'functions/checkPartyCreateAccess';

const vendorList = ({ sessionData, vendorData }) => {
  return (
    <Vendor sessionData={sessionData} vendorData={vendorData} />
  )
}
export default vendorList

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  if (!hasPartyCreateDesignation(token)) {
    return { redirect: { destination: '/dashboard/home', permanent: false } };
  }

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    // const representativesRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_REPRESENTATIVES_EMPLOYEES,{
    //   headers:{"id": `${cookies.get('companyId')}`}
    // }).then((x)=>x.data);

    const vendorsRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VENDORS, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: {
        sessionData: sessionRequest,
        //representativeData:representativesRequest, 
        vendorData: vendorsRequest
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}