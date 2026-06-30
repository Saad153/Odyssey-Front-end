import React from 'react'
import CreateOrEdit from '../../../Components/Layouts/Manifest/CreateOrEdit'
import axiosClient from '../../../apis/axiosClient'
import Cookies from 'cookies'
import { handleSSRAuthError } from '../../../functions/withAuthRedirect'

const index = ({ manifest, awb }) => {
  return (
    <CreateOrEdit manifest={manifest} awbNo={awb} />
  )
}

export default index

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const values = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_MANIFEST_BY_ID, {
      headers: { id: params.id, Authorization: token }
    }).then((x) => x.data);

    const awb = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_AWB_NUMBER, {
      headers: { Authorization: token }
    }).then((x) => x.data);

    return {
      props: { manifest: values, awb }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}