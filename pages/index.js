import React from 'react';
import axios from 'axios';
import Cookies from 'cookies';
import Main from 'Components/Layouts/Main/';

const index = ({sessionData, chartData}) => {
  return (
    <Main sessionData={sessionData} chartData={chartData} />
  )
}

export default index

export async function getServerSideProps({ req, res }) {
  const cookies = new (require("cookies"))(req, res);
  const token = cookies.get("token");

  let sessionData = null;

  if (token) {
    try {
      const sessionRes = await axios.get(
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

  const chartData = await axios
    .get(process.env.NEXT_PUBLIC_CLIMAX_GET_DASHBOARD_DATA)
    .then((x) => x.data);

  return {
    props: {
      sessionData,
      chartData,
    },
  };
}
