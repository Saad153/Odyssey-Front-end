import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '/apis/axiosClient';

const EmployeeAccess = () => {

  const [values, setValues] = useState({
    name:'',
  })

  useEffect(() => {
    fetchData();
    // console.log('Acess Page') ;
  }, [])

  const fetchData = async() => {
    await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_EMPLOYEES)
    // .then((x)=>console.log(x.data));
  }

  return (
    <div>
      Employee Access
    </div>
  )
}

export default EmployeeAccess
