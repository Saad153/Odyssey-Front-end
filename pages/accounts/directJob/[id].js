import React from 'react';
import DirectJob from 'Components/Layouts/AccountsComp/directJob/';
import axiosClient from 'apis/axiosClient';

const directJob = ({id}) => {
  return (
    <DirectJob id={id} />
  )
}
export default directJob

export async function getServerSideProps(context) {
    const { params } = context;
    return{ 
        props: {
            id:params.id
        }
    }
}
