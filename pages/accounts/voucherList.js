import React from 'react';
import VoucherList from 'Components/Layouts/AccountsComp/Voucher/VoucherList';
import Cookies from 'cookies';
import axiosClient from 'apis/axiosClient';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const voucherList = ({ sessionData, voucherData }) => {
  return (
    <VoucherList sessionData={sessionData} voucherData={voucherData} />
  )
}

export default voucherList

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const companyId = cookies.get('companyId');
  const token = cookies.get('token');

  try {
    const sessionData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const voucherData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VOUCHERS, {
      headers: {
        id: `${companyId}`,
        offset: 0,
        Authorization: token,
      }
    }).then((x) => x.data);

    return {
      props: { sessionData, voucherData }
    }
  } catch (error) {
    return handleSSRAuthError(error, res, cookies);
  }
}