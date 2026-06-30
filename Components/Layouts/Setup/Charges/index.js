import { Row, Col, Table } from 'react-bootstrap';
import React, { useEffect, useReducer, useState } from 'react';
import { Modal, Input, notification } from 'antd';
import CreateOrEdit from './CreateOrEdit';
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import axiosClient from '/apis/axiosClient';

function recordsReducer(state, action){
  switch (action.type) {
    case 'toggle': { 
      return { ...state, [action.fieldName]: action.payload } 
    }
    case 'create': {
      return {
        ...state,
        edit: false,
        visible: true,
      }
    }
    case 'edit': {
      return {
        ...state,
        selectedRecord:{},
        edit: true,
        visible: true,
        selectedRecord:action.payload
      }
    }
    case 'modalOff': {
      let returnVal = { ...state, visible: false, edit: false, viewHistory:false };
      state.edit?returnVal.selectedRecord={}:null
      return returnVal
    }
    default: return state 
  }
}

const baseValues = {
  //Basic Info
  id:'',
  code:"",
  currency:"",
  name:"",
  short:"",
  calculationType:"",
  defaultPaybleParty:"",
  defaultRecivableParty:"",
  taxApply:"No",
  taxPerc:"",
  fixAmount:0.00
}

const initialState = {
    records: [],
    load:false,
    visible:false,
    edit:false,
    search:"",
    values:baseValues,
    // Editing Records
    selectedRecord:{},
};

const Charges = ({chargeData}) => {
  const [ state, dispatch ] = useReducer(recordsReducer, initialState);
  const { records, visible, viewHistory } = state;
  const [ search, setSearch] = useState("")

  useEffect(() => dispatch({type:'toggle', fieldName:'records', payload:chargeData.result}), [])

  const openNotification = (title, message, color) => {
    notification.open({
      message: title,
      description: message,
      icon: <ExclamationCircleOutlined style={{ color }} />,
    });
  };

  const deleteCharge = async (x) => {
    try{
      console.log("Deleting Charge with ID:", x.id);
      const deleteResponse = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/charges/delete`, { id: x.id, employeeId: Cookies.get("username") })
      if(deleteResponse.data.status == 'success'){
        openNotification("Success", `${x.name} Deleted Successfully`)
      }else if(deleteResponse.data.status == 'exists'){
        openNotification("Error", `${x.name} cannot be deleted as it is associated with other records`)
      }else{
        openNotification("Error", `Error Deleting ${x.name}`)
      }
    }catch(e){
      console.log(e)
    }
  }

  const statusChange = async (x) => {
    try{
      console.log("Changing Status of Charge with ID:", x.id);
      const statusResponse = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/charges/status`, { id: x.id, employeeId: Cookies.get("username") })
      if(statusResponse.data.status == 'success'){
        openNotification("Success", `${x.name} Status Changed Successfully`)
      }else{
        openNotification("Error", `Error Changing Status ${x.name}`)
      }
    }catch(e){
      console.log(e)
    }
  }

  return (
    <div className='base-page-layout'>
    <Row>
        <Col><h5>Charges</h5></Col>
        <Col>
        <Row>
            <Col md={4}></Col>
            <Col md={5}>
                <Input value={search} placeholder="search"
                    style={{borderRadius:"5px"}}
                    className='ant-input'
                    onChange={(e)=>{
                        setSearch(e.target.value)
                    }}
                />
                </Col>
            <Col md={3}><button className='btn-custom right' onClick={()=>dispatch({type:'create'})}>Create</button></Col>
        </Row>
        </Col>
    </Row>
    <div className='table-sm-1 mt-3' style={{maxHeight:500, overflowY:'auto'}}>
        <Table className='tableFixHead'>
        <thead>
          <tr>
            <th>Code</th>
            <th>Currency</th>
            <th>Name</th>
            <th>Short Name</th>
            <th>Calculation Type</th>
            <th>Default Payble</th>
            <th>Default Receivable</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {/* {console.log(records)} */}
        {records?.filter((x)=>{
            if(
              x.code==search.toLowerCase() ||
              x.name?.toLowerCase().includes(search.toLowerCase()) ||
              x.short?.toLowerCase().includes(search.toLowerCase())||
              x.currency?.toLowerCase().includes(search.toLowerCase())){
              return x
            } else if(search==""){
              return x
            }
        }).map((x, index) => {
          return (
          <tr key={index} className='f row-hov' onClick={()=>dispatch({type:'edit', payload:x})}>
            <td>{x.code}</td>
            <td>{x.currency}</td>
            <td>{x.name}</td>
            <td>{x.short}</td>
            <td>{x.calculationType}</td>
            <td>{x.defaultPaybleParty}</td>
            <td>{x.defaultRecivableParty}</td>
            <td><button className={x.status ? 'status-btn-true' : 'status-btn-false'} onClick={(e) => {
                e.stopPropagation()
                console.log(x)
                statusChange(x)
              }}>
              {x.status === false && (
                <CloseCircleOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '30px' }} />
              )}
              {x.status === true && (
                <CheckCircleOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '30px' }} />
              )}
              </button></td>
            <td>
              <button className='delete-btn1' onClick={(e) => {
                e.stopPropagation()
                deleteCharge(x)
              }}>
                <DeleteOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />
              </button>
            </td>
          </tr>
          )
        })}
        </tbody>
        </Table>
    </div>
    <Modal
      open={visible}
      onOk={()=>dispatch({ type: 'modalOff' })} onCancel={()=>dispatch({ type: 'modalOff' })}
      width={1000} footer={false} centered={false}
    >
      {!viewHistory && <CreateOrEdit state={state} dispatch={dispatch} baseValues={baseValues} />}
      {/* {viewHistory && <History history={state.history} load={state.load} />} */}
    </Modal>
    </div>
  )
}

export default React.memo(Charges)
