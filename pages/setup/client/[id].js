import React from 'react';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import CreateOrEditComp from '../../../Components/Layouts/Setup/Client/CreateOrEditComp';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const client = ({ id, representativeData, clientData }) => {
  return (
    <>
      <CreateOrEditComp id={id} representativeData={representativeData} clientData={clientData} />
    </>
  )
}
export default client

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const companyId = cookies.get('companyId');

  let clientData = {};

  try {
    const representativesRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_REPRESENTATIVES_EMPLOYEES, {
      headers: {
        id: `${companyId}`,
        Authorization: token,
      }
    }).then((x) => x.data);

    if (params.id != "new") {
      clientData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CLIENT_BY_ID, {
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
    }

    return {
      props: {
        id: params.id,
        representativeData: representativesRequest,
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