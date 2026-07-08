import React from 'react';
import axios from 'axios';
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

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const sessionRes = await axios.get(
      process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,
      {
        headers: { 'x-access-token': token },
      }
    );

    if (sessionRes.data?.isLoggedIn === false) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        sessionData: sessionRes.data,
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}