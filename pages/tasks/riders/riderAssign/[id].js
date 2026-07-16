import React from 'react'
import RiderAssign from 'Components/Layouts/Tasks/RiderAssign'
import axiosClient from 'apis/axiosClient'
import Cookies from 'cookies'
import { handleSSRAuthError } from 'functions/withAuthRedirect'
const riderTasks = ({riderData, id, tasks}) => {
  return (
    <div>
      <RiderAssign riderData={riderData} id={id} tasks={tasks}/>
    </div>
  )
}

export default riderTasks


export async function getServerSideProps({ req, res, params }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  let riderData = '';
  let tasks = []

  try {
    if(params.id!="new"){
      // riderData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_EMPLOYEE_ID_AND_NAME,{})
      tasks = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_EMPLOYEE_TASK,{
        headers:{ Authorization: token, "id": `${params.id}` }
      }).then((x)=>x.data.result);
    }
    return {
      props: { riderData:riderData, tasks:tasks, id:params.id }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}
