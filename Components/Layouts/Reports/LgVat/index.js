import React, { useEffect, useState }from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Select, Radio, DatePicker, Checkbox } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import Router from 'next/router';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { incrementTab } from 'redux/tabs/tabSlice';
import moment from "moment";
import { setLgField } from '../../../../redux/lgVat/lgSlice';
import axiosClient from '/apis/axiosClient';

const LgVat = ({query, result}) => {
    const state = useSelector((state) => state.lgVat);
    const dispatch = useDispatch();
    
    console.log("LG VAT:", state)
    useEffect(()=>{
            if(state.lg_clients.length == 0){
                getAccounts();
            }
        },[])

    const getAccounts = async () => {
       
            try{  
                const gotConsignee = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/clientRoutes/getClientsbyType`,
                    {
                        headers: {
                            type: 'Consignee'
                        }
                    }
                );
                const gotShipper = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/clientRoutes/getClientsbyType`,
                    {
                        headers: {
                            type: 'Shipper'
                        }
                    }
                );

                console.log("gotConsignee",gotConsignee)
                console.log("gotShipper",gotShipper)
                const {data}= gotConsignee;
                const {result} = data
                let temprecords=[];
                result?.map((x) => {
                return temprecords.push({ value: x.id, label: `(${x.code}) ${x.name}`, });
                });
                dispatch(setLgField({field:"lg_clients",value:temprecords}))
                let tempRecords = []
                gotShipper.data.result?.map((x) => {
                    return tempRecords.push({ value: x.id, label: `(${x.code}) ${x.name}`, });
                });
                dispatch(setLgField({field:"lg_shippers",value:tempRecords}))
            }catch(e){
            console.log("e",e)
            }
        };
        console.log("Lg Vat: ",state)
    return (    
        <div className="base-page-layout">
            <div className="page-header">
                <h4 className='fw-7 m-0'>LG VAT</h4>
                <div className='btn-header'>
                    <button type='primary' className='btn-custom my-1 px-4 mx-1'
                        onClick={() => {
                            Router.push({ 
                                pathname: `/reports/lgVat/report`, 
                                query: { from: moment(state.lg_sdate).toISOString(), to: moment(state.lg_edate).toISOString(), opType: state.lg_opType, report: state.lg_report, type: state.lg_type } 
                            });
                            // console.log(revenue)
                            dispatch(incrementTab({
                                "label": "LG VAT Report",
                                "key": "5-18",
                                // "id": '1'
                                "id": `?from=${moment(state.lg_sdate).toISOString()}&to=${moment(state.lg_edate).toISOString()}&opType=${state.lg_opType}&report=${state.lg_report}&type=${state.lg_type}`  
                            }))
                        }}>
                        Go
                    </button>
                    <button
                    className="btn-custom-excel my-1 px-4">
                    <FileExcelOutlined /> Export to Excel
                </button></div>
            </div>
        <div className="form-card">
            <Col gutter={1} className=" mt-3">
            <div className="card-section">
            <Row gutter={16} className='form-row'>
            <Col md={2}>
                <label>From</label>
                <DatePicker
                style={{ width: "100%", borderRadius:"6px" }} 
                className='datePicker-modern'
                allowClear={false}
                value={moment(state.lg_sdate)}
                onChange={(e) => dispatch(setLgField({ field: "lg_sdate", value: e }))}
            />
          </Col>

          <Col md={2}>
            <label>To</label>
            <DatePicker 
              style={{ width: "100%", borderRadius:"6px" }}
              className='datePicker-modern'
              allowClear={false}
              value={moment(state.lg_edate)}
              onChange={(e) => dispatch(setLgField({ field: "lg_edate", value: e }))}
            />
          </Col>

          <Col md={4}>
            <label>Customer</label>
            <Select style={{ width: '100%' }} 
            showSearch 
            allowClear
            placeholder="Customer" 
            className='select-modern'
            value={state.lg_customer}
            onChange={e => dispatch(setLgField({field:"lg_customer",value:e}))} 
            options={[...state.lg_clients, ...state.lg_shippers]}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
            />
          </Col>

          <Col md={4}>
            <label>Shipper</label>
            <Select style={{ width: '100%' }}
            showSearch 
            allowClear
            placeholder="Shipper"
            className='select-modern'
            value={state.lg_shipper}
            onChange={e => dispatch(setLgField({field:"lg_shipper",value:e}))} 
            options={state.lg_shippers}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}/>
          </Col>
        </Row>

        <Row gutter={16} className="form-row mt-3" >
          <Col md={4}>
            <label>Tax Authority</label>
            <Select 
            style={{ width: '100%' }} 
            placeholder="Tax Authority" 
            className='select-modern'
            value={state.lg_tax}
            onChange={e => dispatch(setLgField({field:"lg_tax",value:e}))} 
            // options={state.lg_taxes}
            options={[
                { label: 'Sales Tax SRB', value: 'Sales Tax SRB' },
            ]}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
            />
          </Col>
        
          <Col md={4}>
            <label>HS Code</label>
            <Select style={{ width: '100%' }} placeholder="HS Code" className='select-modern' />
          </Col>
          
         
        </Row>
        </div></Col>
        <Row className="mt-3">
            
          <Col md={12}>
            <div className="card-section">
              <h5>Operation Types</h5>
            <Checkbox.Group
              className="mt-1"
              value={state.lg_opType}
              onChange={(e) => e.length && dispatch(setLgField({ field: "lg_opType", value: e }))}>
              <Checkbox value="All">All</Checkbox>
              <Checkbox value="Sea Export">Sea Export</Checkbox>
              <Checkbox value="Sea Import">Sea Import</Checkbox>
              <Checkbox value="Air Export">Air Export</Checkbox>
              <Checkbox value="Air Import">Air Import</Checkbox>
              <Checkbox value="Logistics">Logistics</Checkbox>
              <Checkbox value="Direct Job">Direct Job</Checkbox>
              <Checkbox value="Other Job">Other Job</Checkbox>
            </Checkbox.Group>
            </div>
          </Col>

          {/* <Col md={3}>
            <div className="card-section form-section1">
            <h5 className="form-label">Invoice Title</h5>
            <Select style={{ width: '100%' }} placeholder="Select Invoice Title" className='select-modern' />
            </div>
          </Col> */}
        </Row>
        <Row gutter={16} className=" mt-3">
        <Col md={8}>
            <div className="card-section">
            <h5>Report Type</h5>
            <Radio.Group 
              className="mt-1" 
              value={state.lg_report}
              onChange={(e) => {
                dispatch(setLgField({ field: 'lg_report', value: e.target.value }))
                }}>
              <Radio value={1}>Detail</Radio>
              <Radio value={2}>Summary</Radio>
              <Radio value={3}>SRB</Radio>
              <Radio value={4}>Summary 1</Radio>
              <Radio value={5}>SRB Extended</Radio>
            </Radio.Group>
            </div>
          </Col>
          <Col md={4}>
                <div className="card-section">
                <h5 className="form-label">Type</h5>
                <div className="checkbox-group">
                        <Checkbox.Group 
                        className="mt-1"
                        value={state.lg_type}
                        onChange={(e) => e.length && dispatch(setLgField({ field: "lg_type", value: e }))}>
                        <Checkbox value="Receivable">Receivable</Checkbox>
                        <Checkbox value="Payable">Payable</Checkbox>
                        </Checkbox.Group>
                        </div>
                </div>
          </Col>
        </Row>
      </div>
    </div> 
  )
}

export default React.memo(LgVat)
