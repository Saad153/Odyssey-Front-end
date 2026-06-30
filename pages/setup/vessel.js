import React from 'react';
import Vessel from 'Components/Layouts/Setup/Vessel';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const vessel = ({ VesselData, sessionData }) => {
  return (
    <Vessel VesselData={VesselData} sessionData={sessionData} />
  )
}
export default vessel

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const VesselRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VESSELS, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: { sessionData: sessionRequest, VesselData: VesselRequest }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}