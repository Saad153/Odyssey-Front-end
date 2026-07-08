import React from 'react';
import Commodity from 'Components/Layouts/Setup/Commodity';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const commodity = ({ CommodityData, sessionData, initialPage, initialSearch }) => {
  return (
    <Commodity
      CommodityData={CommodityData}
      sessionData={sessionData}
      initialPage={initialPage}
      initialSearch={initialSearch}
    />
  )
}
export default commodity

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const pageSize = 50;
  const requestedPage = Number(query.page);
  const initialPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
  const initialSearch = typeof query.search === 'string' ? query.search.trim() : '';

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const CommodityRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CREATE_COMMODITY, {
      headers: { Authorization: token },
      params: {
        search: initialSearch || undefined,
        page: initialPage,
        limit: pageSize,
      }
    }).then((x) => x.data);

    const rawRecords = Array.isArray(CommodityRequest?.result)
      ? CommodityRequest.result
      : Array.isArray(CommodityRequest?.data)
        ? CommodityRequest.data
        : [];

    const backendPagination = CommodityRequest?.pagination || {};
    const totalRecords = Number(backendPagination.totalRecords) || rawRecords.length;
    const totalPages = Number(backendPagination.totalPages) || Math.max(1, Math.ceil(totalRecords / pageSize));
    const safePage = Math.min(initialPage, totalPages);

    return {
      props: {
        sessionData: sessionRequest,
        CommodityData: {
          ...CommodityRequest,
          result: rawRecords,
          pagination: {
            currentPage: safePage,
            pageSize,
            totalRecords,
            totalPages,
            search: initialSearch,
          },
        },
        initialPage: safePage,
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