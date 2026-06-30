import React from 'react';
import Comparative from '../../../Components/Layouts/Reports/JobPL/Comparative';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const comparative = ({ query, result }) => {
  return (
    <Comparative query={query} result={result} />
  )
}

export default comparative

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const response = await axiosClient.get(
      `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/jobPnLComparison`,
      {
        params: {
          ...query,
          from1: query.from,
          to1: query.to,
          from2: query.from2,
          to2: query.to2,
          includeFields: query.includeFields
        },
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