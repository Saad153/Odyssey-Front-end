import React from 'react'
import axiosClient from 'apis/axiosClient';
import Airports from 'Components/Layouts/Setup/Airports';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const airports = ({ airportsData, initialPage, initialSearch }) => {
  return (
    <Airports airportsData={airportsData} initialPage={initialPage} initialSearch={initialSearch} />
  )
}

export default airports

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const pageSize = 50;
  const requestedPage = Number(query.page);
  const initialPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
  const initialSearch = typeof query.search === 'string' ? query.search.trim() : '';

  try {
    const response = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_AIRPORTS, {
      headers: { Authorization: token },
      params: {
        search: initialSearch || undefined,
        page: initialPage,
        limit: pageSize,
      }
    });
    const data = response.data;

    return {
      props: {
        airportsData: data,
        initialPage,
        initialSearch,
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}
