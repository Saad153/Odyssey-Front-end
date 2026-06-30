import React from 'react';
import Summary from '../../../Components/Layouts/Reports/JobPL/Summary';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const summary = ({ query, result }) => {
  return (
    <Summary query={query} result={result} />
  )
}

export default summary

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const response = await axiosClient.get(
      `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/jobPnLSummary`,
      {
        params: { ...query },
        headers: {
          Authorization: token,
        }
      }
    );

    return {
      props: {
        query,
        result: response.data ?? null
      }
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    console.error("API Error:", error.message);

    return {
      props: {
        query,
        result: null,
        error: true
      }
    };
  }
}