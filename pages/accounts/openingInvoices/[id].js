import OpeningInvoice from '/Components/Layouts/AccountsComp/OpeningInvoices/OpeningInvoice';
import React from 'react';
import axios from 'axios';

const openingInvoices = (id) => {
  return <OpeningInvoice id={id}/>
}
export default openingInvoices;

export async function getServerSideProps(context) {
    const { params } = context

    return { props: { id:params.id }}
}