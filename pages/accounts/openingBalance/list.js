import React from 'react';
import OpeningBalance from '../../../Components/Layouts/AccountsComp/OpeningBalance/List';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const openingBalancesList = ({ sessionData, openingBalancesList }) => {
  return (
    <OpeningBalance sessionData={sessionData} openingBalancesList={openingBalancesList} />
  )
}

export default openingBalancesList;

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const companyId = cookies.get('companyId');

  try {
    const sessionData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const openingBalancesList = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_OPENING_BALANCES, {
      headers: {
        id: `${companyId}`,
        Authorization: token,
      }
    }).then((x) => x.data);

    return {
      props: { sessionData, openingBalancesList }
    }
  } catch (error) {
    return handleSSRAuthError(error, res, cookies);
  }
}