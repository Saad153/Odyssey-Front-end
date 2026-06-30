import React from 'react';
import axiosClient from '../../../apis/axiosClient';
import LgVat from '../../../Components/Layouts/Reports/LgVat';
import LGReport from '../../../Components/Layouts/Reports/LgVat/report';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const report = ({ query, result }) => {
  return (
    <div className='base-page-layout'>
      <LGReport query={query} result={result} />
    </div>
  )
}

export default report

export async function getServerSideProps({ query, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    console.log("LG Query:", query);
    const result = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_MISC_GET_INCOME_STATEMENT, {
      headers: {
        company: query.company,
        from: query.from,
        to: query.to,
        currency: query.currency,
        Authorization: token,
      }
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