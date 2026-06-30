import React from 'react';
import OfficeVouchers from 'Components/Layouts/AccountsComp/OfficeVouchers';
import axiosClient from 'apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from 'functions/withAuthRedirect';

const list = ({ voucherList }) => {
  return (
    <OfficeVouchers voucherList={voucherList} />
  )
}

export default list

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const companyId = cookies.get('companyId');
  const token = cookies.get('token');
  const loginId = cookies.get('loginId');

  try {
    const voucherList = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_OFFICE_VOUCHERS, {
      headers: {
        companyId: `${companyId}`,
        employeeId: loginId,
        Authorization: token,
      }
    }).then((x) => x.data.result);

    return {
      props: {
        voucherList
      }
    }
  } catch (error) {
    return handleSSRAuthError(error, res, cookies);
  }
}