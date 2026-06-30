import React from 'react';
import Requests from 'Components/Layouts/Dashboard/Requests';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const requests = ({ sessionData }) => {
  return (
    <Requests sessionData={sessionData} />
  )
}

export default requests

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    return {
      props: { sessionData: sessionRequest }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}