import React from 'react';
import Client from '../../Components/Layouts/Setup/Client';
import axiosClient from '../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../functions/withAuthRedirect';

const clientList = ({ sessionData, representativeData, clientData }) => {
  return (
    <div>
      <Client sessionData={sessionData} representativeData={representativeData} clientData={clientData} />
    </div>
  )
}
export default clientList;

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const companyId = cookies.get('companyId');

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

    const ClientsRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CLIENTS, {
      headers: {
        id: `${companyId}`,
        Authorization: token,
      }
    }).then((x) => x.data);

    return {
      props: {
        sessionData: sessionRequest,
        representativeData: representativesRequest,
        clientData: ClientsRequest
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}