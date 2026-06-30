import React from 'react';
import JobBalancingReport from 'Components/Layouts/Reports/JobBalancing/JobBalancingReport';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const report = ({ result, query }) => {
  return (
    <JobBalancingReport result={result} query={query} />
  )
}

export default report

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const result = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_JOB_BALANCING, {
      headers: {
        company: query.company,
        overseasagent: query.overseasagent,
        representator: query.representator,
        currency: query.currency,
        from: query.from,
        to: query.to,
        paytype: query.paytype,
        jobtypes: query.jobtypes,
        party: query.party,
        Authorization: token,
      }
    }).then((x) => x.data);

    console.log(result);

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