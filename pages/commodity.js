import React from 'react';
import Commodity from 'Components/Layouts/Setup/Commodity';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const commodity = ({ CommodityData, sessionData }) => {
  return (
    <Commodity CommodityData={CommodityData} sessionData={sessionData} />
  )
}
export default commodity

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const CommodityRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CREATE_COMMODITY, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: { sessionData: sessionRequest, CommodityData: CommodityRequest }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}