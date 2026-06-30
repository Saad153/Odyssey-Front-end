import React from 'react';
import BlComp from '../../../Components/Layouts/JobsLayout/BlComp';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const seBl = ({ id, blData, partiesData }) => {
  return (
    <div>
      <BlComp id={id} blData={blData} partiesData={partiesData} type={"AI"} />
    </div>
  )
}
export default seBl

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const partiesData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_NOTIFY_PARTIES, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    let blData = {};
    if (params.id != "new") {
      blData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_BL_BY_ID, {
        headers: {
          id: `${params.id}`,
          Authorization: token,
        }
      }).then((x) => x.data.result);

      if (!blData.id) {
        return {
          notFound: true
        }
      }
    }

    return {
      props: {
        blData: blData,
        id: params.id,
        partiesData: partiesData
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}