import OpeningInvoice from 'Components/Layouts/AccountsComp/OpeningInvoices/OpeningInvoice';
import React from 'react';
import axiosClient from '/apis/axiosClient';

const openingInvoices = (id) => {
  return <OpeningInvoice id={id}/>
}
export default openingInvoices;

export async function getServerSideProps(context) {
    const { params } = context

    return { props: { id:params.id }}
}
