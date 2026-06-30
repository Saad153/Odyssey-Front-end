import React from 'react';
import BlList from 'Components/Layouts/JobsLayout/BlList/';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const seBlList = ({ partiesData, BlsData }) => {
  return <BlList partiesData={partiesData} BlsData={BlsData} type={"SE"} />
}
export default seBlList

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const partiesData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_NOTIFY_PARTIES, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    const BlsData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_BLS, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    return {
      props: { partiesData: partiesData, BlsData }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}