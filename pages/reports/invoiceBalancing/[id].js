import React from 'react';
import InvoiceBalancingReport from 'Components/Layouts/Reports/InvoiceBalancing/InvoiceBalancingReport';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const report = ({ result, query }) => {
  return (
    <InvoiceBalancingReport result={result} query={query} />
  )
}

export default report

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const result = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_INVOICE_BALANCING, {
      headers: {
        company: query.company,
        overseasagent: query.overseasagent,
        representator: query.representator,
        currency: query.currency,
        from: query.from,
        to: query.to,
        paytype: query.paytype,
        jobtypes: query.jobtypes,
        balance: query.balance,
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