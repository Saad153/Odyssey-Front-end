import React from 'react';
import Non_Gl_Parties from 'Components/Layouts/Setup/Non_Gl_Parties';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';
import { hasPartyCreateDesignation } from 'functions/checkPartyCreateAccess';

const nonGlParties = ({ clientData, sessionData }) => {
  return (
    <div>
      <Non_Gl_Parties clientData={clientData} sessionData={sessionData} />
    </div>
  )
}
export default nonGlParties;

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

    const ClientsRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_NON_GL_PARTIES, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: { sessionData: sessionRequest, clientData: ClientsRequest }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}