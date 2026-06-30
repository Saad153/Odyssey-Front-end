import React from 'react';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import Main from 'Components/Layouts/Main/';

const index = ({ sessionData }) => {
  return (
    <Main sessionData={sessionData} />
  )
}

export default index

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");

  let sessionData = { isLoggedIn: false };

  if (token) {
    try {
      const sessionRes = await axiosClient.get(
        process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,
        {
          headers: { "x-access-token": token },
        }
      );
      sessionData = sessionRes.data;
    } catch (err) {
      sessionData = { isLoggedIn: false };
    }
  }

  return {
    props: {
      sessionData
    },
  };
}