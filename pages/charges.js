import React from 'react';
import Charges from 'Components/Layouts/Setup/Charges';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const charges = ({ chargeData }) => {
  return (
    <Charges chargeData={chargeData} />
  )
}
export default charges;

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const chargeData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHARGES, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: { sessionData: sessionRequest, chargeData: chargeData }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}