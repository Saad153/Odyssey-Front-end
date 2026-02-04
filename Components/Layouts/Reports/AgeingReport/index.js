import axios from 'axios';
import moment from "moment";
import { Select, Radio, DatePicker, Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import { setFilterValues } from '/redux/filters/filterSlice';
import Router from 'next/router';
import Cookies from "js-cookie";
import { FileExcelOutlined } from '@ant-design/icons';
import { setAgeingField } from '../../../../redux/ageing/ageingSlice';

const AgeingReport = () => {



    const state = useSelector((state) => state.ageing);
    const dispatch = useDispatch()
    
    
    // const [ ageing_reportType, setageing_reportType ] = useState('Ageing Detail');
    useEffect(()=>{
        if(state.ageing_accounts.length == 0){
            getAccounts();
        }
        if(state.ageing_company == undefined){
            dispatch(setAgeingField({field:"ageing_company",value:parseInt(Cookies.get('companyId'))}));
        }
    },[])
    const getAccounts = async () => {
   
        try{  
        const gotAccounts = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHILD_ACCOUNTS);
            const {data}= gotAccounts;
            const {result} = data
            let temprecords=[];
            result?.map((x) => {
            // console.log("x",x)
                return temprecords.push({ value: x.id, label: `(${x.code}) ${x.title}`, });
                });
                dispatch(setAgeingField({field:"ageing_accounts",value:temprecords}))
                // getAccountName(temprecords);
        }catch(e){
        console.log("e",e)
        }
    };
    console.log("AgeingState: ",state)
    return (
        <div className='base-page-layout'>
            <Row>
                <Row className='mt-2' style={{borderBottom: "1px solid #ccc", paddingBottom: "10px"}}>
                    <Col md={12}>
                      <h4 className='fw-7'>Ageing Report</h4>
                    </Col>
                </Row>
                <Row className='mb-3'>
                    <Col md={2} className="mt-3">
                      <div>From</div>
                      <DatePicker style={{width:"100%"}} size="sm" 
                      value={moment(state.ageing_sdate)} 
                      onChange={(e)=>{dispatch(setAgeingField({field:"ageing_sdate",value:e  }))}}    />
                      {/* <Form.Control type={"date"} size="sm"  /> */}
                    </Col>
                    <Col md={2} className="mt-3">
                      <div>To</div>
                        <DatePicker style={{width:"100%"}}   size="sm" 
                        value={moment(state.ageing_edate)} 
                        onChange={(e)=>{dispatch(setAgeingField({field:"ageing_edate",value:e}))}}  />
                      {/* <Form.Control type={"date"} size="sm" /> */}
                    </Col>
                </Row>
                <Row className='mb-3'>
                    <Col md={4}>
                        <div>Account</div>
                            <Select 
                            showSearch 
                            allowClear
                            style={{ width: "100%" }} 
                            placeholder="Select Account" 
                            value={state.ageing_account}
                            onChange={e => dispatch(setAgeingField({field:"ageing_account",value:e}))} 
                            options={state.ageing_accounts}
                                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
                            />
                    </Col>
                </Row>
                <Row>
                    <Col md={9} className="mb-3">
                      {/* <b>Currency</b><br /> */}
                      <Checkbox.Group className="mt-1" 
                      value={state.ageing_RP}
                    //   disabled={state.ageing_partyType == "Local"}
                      onChange={e => {
                        if (e.length == 0) return;
                        dispatch(setAgeingField({field:"ageing_RP",value:e})
                      )}}>
                        <Checkbox value={"Recievable"}>Receivable</Checkbox>
                        <Checkbox value={"Payble"}>Payable</Checkbox>
                      </Checkbox.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={8} className="mb-3">
                      <div>Company</div>
                      <Checkbox.Group className="mt-1"
                      value={state.ageing_company}
                      onChange={(e)=> {
                        console.log(e.length)
                        if(e.length == 0){
                            dispatch(setAgeingField({field: 'ageing_company', value: [parseInt(Cookies.get('companyId'))] }))    
                        }else{
                            dispatch(setAgeingField({field: 'ageing_company', value: e}))
                        }
                      }}
                      >
                        <Checkbox value={1}>SEA NET SHIPPING & LOGISTICS</Checkbox>
                        <Checkbox value={3}>AIR CARGO SERVICES</Checkbox>
                      </Checkbox.Group>
                    </Col>
                </Row>
                
                {/* <Row>
                    <Col md={9} className="mb-3">
                      <b>Currency</b><br />
                      <Radio.Group className="mt-1" 
                      value={state.ageing_currency} 
                      disabled={state.ageing_partyType == "Local"}
                      onChange={e => dispatch(setAgeingField({field:"ageing_currency",value:e.target.value})
                      )}>
                        <Radio value={"PKR"}>PKR</Radio>
                        <Radio value={"USD"}>USD</Radio>
                        <Radio value={"GBP"}>GBP</Radio>
                        <Radio value={"CHF"}>CHF</Radio>
                        <Radio value={"EUR"}>EUR</Radio>
                        <Radio value={"AED"}>AED</Radio>
                        <Radio value={"OMR"}>OMR</Radio>
                        <Radio value={"BDT"}>BDT</Radio>
                      </Radio.Group>
                    </Col>
                </Row> */}
                <Row>
                <Col md={4} className="mt-0">
                    <div>Party type:</div>
                  <Radio.Group className="mt-1" 
                      value={state.ageing_partyType} 
                      onChange={e => {
                        // if(e.target.value == "Local"){dispatch(setAgeingField({field:"ageing_currency",value:"PKR"}))}
                        dispatch(setAgeingField({field:"ageing_partyType",value:e.target.value}))
                      }}>
                        <Radio value={"Local"}>Local Party</Radio>
                        <Radio value={"Agent"}>Agent</Radio>
                      </Radio.Group>
                </Col>
                </Row>
                <Row>
                <Col md={4} className='py-1 mt-3'>
                    <div>Report Types</div>
                    <Select
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Select Report Type"
                        value={state.ageing_reportType}
                        onChange={(e)=>{
                            // setageing_reportType(e)
                            dispatch(setAgeingField({field:"ageing_reportType",value:e}))
                        }}
                        options={[
                        //   { label: 'Ageing Detail', value: 'Ageing Detail' },
                          { label: 'Ageing Summary', value: 'Ageing Summary' },
                          { label: 'Ageing Weekly', value: 'Ageing Weekly' },
                        ]}
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
                    />
                </Col>
                </Row>
                <Row>
                    <Col md={1} className=''>
                        <button className='btn-custom mt-3 px-3'
                            onClick={() => {
                                Router.push({ 
                                    pathname: `/reports/ageingReport/report`, 
                                    query: { ageing_reportType: state.ageing_reportType, ageing_company: state.ageing_company, from: state.ageing_sdate, to: state.ageing_edate, ageing_RP: state.ageing_RP, ageing_account: state.ageing_account, ageing_partyType: state.ageing_partyType } 
                                });
                                // console.log(revenue)
                                dispatch(incrementTab({
                                    "label": "Ageing Report",
                                    "key": "5-14",
                                    "id": `?ageing_reportType=${state.ageing_reportType}&ageing_company=${state.ageing_company}&from=${state.ageing_sdate}&to=${state.ageing_edate}&ageing_RP=${state.ageing_RP}&ageing_account=${state.ageing_account}&ageing_partyType=${state.ageing_partyType}`
                                }))
                            }}>
                            Go
                        </button>
                    </Col>
                    <Col md={2} className=''>
                        <button className='btn-custom-excel mt-3 px-3'>
                            <FileExcelOutlined />Export to Excel
                        </button>
                    </Col>
                </Row>      
                  </Row>
        </div>
    )
}

export default React.memo(AgeingReport)