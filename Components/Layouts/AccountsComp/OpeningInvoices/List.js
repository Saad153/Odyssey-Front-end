import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import { Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import { Radio } from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import openNotification from '/Components/Shared/Notification';
import { setField, resetState } from '../../../../redux/openingInvoices/openingInvoicesSlice'
import { delay } from '../../../../functions/delay';

const List = () => {

  const dispatch = useDispatch();
  const [ type, setType ] = useState("OI");
  const [records, setRecords] = React.useState([]);
  const state = useSelector((state) => state.openingInvoice);
  const getInvoices = async () => {
    try{
        const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/getOpeningInvoices`, {
        headers: {
          companyId: Cookies.get('companyId'),
          type: type,
        }
        })  
      result.data.status == 'success'?setRecords(result.data.result):null
    }catch(e){
      console.log(e)
     } 
  }

  const deleteInvoice = async (id) => {
    try{
      console.log(id)
      axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/deleteOpeningInvoices`,
        {
          headers: {id: id}
        }
      )
      openNotification('Success', `Invoice ${id} deleted`, 'green')
      await delay(1000);
      await getInvoices()
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    getInvoices();
    // if(state.payType=="Recievable"){
    //   setType("OI")
    // }else{
    //   setType("OB")
    // }
    // dispatch(resetState())
  }, [type])

  useEffect(() => {
    if(state.payType=="Recievable"){
      setType("OI")
    }else{
      setType("OB")
    }
  }, [state.payType])
  
  return (
    <div className='base-page-layout'>
      <Row>
        <Col md={4}>
          <h5>Opening Invoices</h5>
        </Col>
        <Col md={4}>
          <Radio.Group onChange={(e) => setType(e.target.value)} value={type}>
            <Radio value="OI">Opening Invoice</Radio>
            <Radio value="OB">Opening Bill</Radio>
          </Radio.Group>
        </Col>
        <Col>
          <button style={{float:'right', width:'100px', display:'inline-block'}} className='btn-custom-green' 
            onClick={()=>{
              dispatch(incrementTab({"label":"Opening Invoice","key":"3-12","id":"new"}))
              Router.push("/accounts/openingInvoices/new")
            }}
          >Create</button>
        </Col>
      </Row>
      <hr></hr>
      <Col md={12}>
          <table style={{width: '100%', border: '1px solid #d7d7d7'}}>
            <thead style={{ width: '100%', color: '#1d1d1f', borderBottom: '1px solid #d7d7d7'}}>
              <tr>
                <th style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7', borderLeft: '1px solid #d7d7d7'}}>Sr #</th>
                <th style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>Invoice #</th>
                <th style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>Date</th>
                <th style={{paddingLeft: '1%', width: '25%', borderRight: '1px solid #d7d7d7'}}>Party</th>
                <th style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>Amount</th>
                <th style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>{type!="OI"?"Paid":"Recieved"}</th>
                <th style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7'}}>Edit</th>
                <th style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7'}}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7', borderLeft: '1px solid #d7d7d7'}}>{index+1}</td>
                  <td style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>{record.invoice_No}</td>
                  <td style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>{moment(record.createdAt).format('DD-MM-YYYY')}</td>
                  <td style={{paddingLeft: '1%', width: '25%', borderRight: '1px solid #d7d7d7'}}>{record.party_Name}</td>
                  <td style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>{record.total}</td>  
                  <td style={{paddingLeft: '1%', width: '15%', borderRight: '1px solid #d7d7d7'}}>{record.payType=="Payble"?record.paid:record.recieved}</td>
                  <td style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7', cursor: 'pointer'}}
                  onClick={()=>Router.push(`/accounts/openingInvoices/${record.id}`)}>
                  <EditOutlined style={{color: '#438995'}} />
                  </td>
                  <td style={{paddingLeft: '1%', width: '5%', borderRight: '1px solid #d7d7d7', cursor: 'pointer'}}
                    onClick={()=>deleteInvoice(record.id)}
                  >
                  <DeleteOutlined style={{color: 'red'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </Col>
    </div>
  )
}

export default List