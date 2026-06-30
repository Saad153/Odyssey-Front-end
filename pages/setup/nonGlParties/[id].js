import React from 'react';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import CreateOrEditComp from 'Components/Layouts/Setup/Non_Gl_Parties/CreateOrEditComp';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const client = ({ id, clientData }) => {
  return (
    <CreateOrEditComp id={id} clientData={clientData} />
  )
}
export default client

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const clientData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_NON_GL_PARTIES_BY_ID, {
      headers: {
        id: `${params.id}`,
        Authorization: token,
      }
    }).then((x) => x.data.result);

    if (!clientData) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        id: params.id,
        clientData: clientData
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}