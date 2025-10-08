import React, { useEffect, useReducer } from 'react';
import { recordsReducer, initialState } from './states';
import { getJobValues, getJobById } from '/apis/jobs';
import { useQuery } from '@tanstack/react-query';
import CreateOrEdit from './CreateOrEdit';
import { useSelector } from 'react-redux';
import Cookies from "js-cookie";

const SeJob = ({id, type}) => {

  const { data, isSuccess:dataSuccess } = useQuery({queryKey: ['values'], queryFn: getJobValues});
  const { data:newdata, isSuccess, refetch } = useQuery({
    queryKey:["jobData", {id, type}], queryFn: () => getJobById({id, type}),
  });

  const companyId = useSelector((state) => state.company.value);
  const [ state, dispatch ] = useReducer(recordsReducer, initialState);
  useEffect(() => {
    getData();


  }, [dataSuccess, isSuccess])
  
  const getData = async() => {


    if(dataSuccess && newdata) {
      console.log("index: ",data.result)
      console.log("index: ",newdata)
      // data?.result?.res?.forEach((x)=>{
      //   data.result.vendor.sLine.push(x)
      // })
      let temp
      if(dataSuccess){
        temp = {
          ...newdata.result,
          shippingLineId: newdata?.result?.shippingLineId?.toString()
        }
      }
      console.log("Temp", temp)
      dispatch({type:'set',
        payload:{
          fields:data.result,
          selectedRecord:dataSuccess?temp:{},
          fetched:true,
          edit:id=="new"?false:true,
          // permissions:tempPerms
        }
      })
    }
  }

  return (
  <div className='base-page-layout'>
    {state.fetched && 
      <CreateOrEdit
        jobData={isSuccess?{...newdata.result, shippingLineId: newdata.result.shippingLineId?newdata.result.shippingLineId.toString():null}:{}}
        companyId={companyId}
        dispatch={dispatch}
        refetch={refetch}
        state={state}
        type={type}
        id={id}
      />
    }
  </div>
  )
}

export default React.memo(SeJob);