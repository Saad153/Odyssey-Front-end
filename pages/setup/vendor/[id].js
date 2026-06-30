import React from 'react';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import CreateOrEditComp from 'Components/Layouts/Setup/Vendor/CreateOrEditComp';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const vendor = ({ sessionData, representativeData, vendorData, id }) => {
  return (
    <CreateOrEditComp sessionData={sessionData} representativeData={representativeData} vendorData={vendorData} id={id} />
  )
}
export default vendor

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const companyId = cookies.get('companyId');

  let vendorsRequest = {};

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const representativesRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_REPRESENTATIVES_EMPLOYEES, {
      headers: {
        id: `${companyId}`,
        Authorization: token,
      }
    }).then((x) => x.data);

    if (params.id != "new") {
      vendorsRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VENDOR_BY_ID, {
        headers: {
          id: `${params.id}`,
          Authorization: token,
        }
      }).then((x) => x.data);
    }

    return {
      props: {
        sessionData: sessionRequest,
        representativeData: representativesRequest,
        vendorData: vendorsRequest,
        id: params.id
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}