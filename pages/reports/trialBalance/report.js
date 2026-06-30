import React from 'react';
import Report from 'Components/Layouts/Reports/TrialBalance/Report';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const report = ({ query, result }) => {
  return (
    <div className='base-page-layout'>
      <Report query={query} result={result} />
    </div>
  )
}

export default report

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const result = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_MISC_GET_TRIAL_BALANCE, {
      headers: {
        company: query.company,
        from: query.from,
        to: query.to,
        accountid: query.accountid,
        currency: query.currency,
        old: query.old,
        Authorization: token,
      }
    }).then((x) => x.data);

    return {
      props: {
        result,
        query
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}