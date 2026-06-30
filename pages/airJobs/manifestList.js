import React from 'react'
import Manifest from 'Components/Layouts/Manifest'
import axiosClient from 'apis/axiosClient'
import Cookies from 'cookies'
import { handleSSRAuthError } from 'functions/withAuthRedirect'

const manifist = ({ manifest }) => {
  return (
    <Manifest manifest={manifest} />
  )
}

export default manifist

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const values = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_MANIFEST, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    return {
      props: { manifest: values }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}