import React from 'react';
import Cookies from 'cookies';
import JobsList from '/Components/Layouts/JobsLayout/JobsList';


const SEJobListPage = ({ sessionData }) => {
  return <JobsList sessionData={sessionData} type="SE" />;
};

export default SEJobListPage;


export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);

  const sessionData = await fetch(
    process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,
    {
      headers: { "x-access-token": cookies.get("token") }
    }
  ).then(res => res.json());

  return {
    props: {
      sessionData
    }
  };
}