import React from 'react';
import OpeningBalance from 'Components/Layouts/AccountsComp/OpeningBalance';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const openingBalance = ({ id, voucherData }) => {
  return (
    <OpeningBalance id={id} voucherData={voucherData} />
  )
}

export default openingBalance;

export async function getServerSideProps(context) {
  const { params, req, res } = context;
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  let voucherData = {};

  try {
    if (params.id != "new") {
      voucherData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCHER_BY_ID, {
        headers: {
          id: `${params.id}`,
          Authorization: token,
        }
      }).then((x) => x.data.result);

      if (!voucherData.id) {
        return {
          notFound: true
        }
      }
    }

    return {
      props: {
        voucherData,
        id: params.id
      }
    }
  } catch (error) {
    return handleSSRAuthError(error, res, cookies);
  }
}