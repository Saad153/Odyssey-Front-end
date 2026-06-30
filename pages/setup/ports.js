import React from 'react'
import axiosClient from '../../apis/axiosClient';
import PortOfDischarge from '../../Components/Layouts/Setup/portOfDischarge';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../functions/withAuthRedirect';

const ports = ({ portsData }) => {
  return (
    <div className='base-page-layout'>
      <PortOfDischarge portsData={portsData} />
    </div>
  )
}

export default ports

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const response = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_VIEW_PORT, {
      headers: { Authorization: token }
    });
    const data = response.data;

    return {
      props: {
        portsData: data
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}