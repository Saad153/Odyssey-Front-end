import React from 'react'
import JobList from 'Components/Layouts/JobsLayout/JobList'
import axiosClient from 'apis/axiosClient'
import Cookies from 'cookies'
import { handleSSRAuthError } from 'functions/withAuthRedirect'

const jobList = ({ data }) => {
  return (
    <div>
      <JobList data={data} />
    </div>
  )
}

export default jobList

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const data = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_SEAJOB_VALUES_JOB_LIST, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    return {
      props: { data: data }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}