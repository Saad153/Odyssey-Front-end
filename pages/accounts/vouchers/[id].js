import React from 'react';
import Voucher from 'Components/Layouts/AccountsComp/Voucher/';
import axiosClient from 'apis/axiosClient';

const voucher = ({id}) => {
  return (
    <Voucher id={id}  />
  )
}
export default voucher

export async function getServerSideProps(context) {
    const { params } = context;
    return{ 
        props: {
            id:params.id
        }
    }
}
