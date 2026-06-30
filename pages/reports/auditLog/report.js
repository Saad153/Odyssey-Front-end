import React from 'react';
import axiosClient from 'apis/axiosClient';
import AuditReport from 'Components/Layouts/Reports/AuditLog/report';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const report = ({ query, result }) => {
  return (
    <div className='base-page-layout'>
      <AuditReport query={query} result={result} />
    </div>
  )
}

export default report

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    console.log("Audit Query:", query);
    const result = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getHistory`, {
      headers: { ...query, Authorization: token }
    }).then((x) => x.data);

    return {
      props: {
        query,
        result
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}