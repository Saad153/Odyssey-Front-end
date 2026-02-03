import axios from 'axios';
import moment from "moment";
import { Select, Radio, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import { setFilterValues } from '/redux/filters/filterSlice';
import Router from 'next/router';
import Cookies from "js-cookie";
import { FileExcelOutlined } from '@ant-design/icons';
const AgeingReport = () => {
    const dispatch = useDispatch()
    
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
                      <DatePicker style={{width:"100%"}} size="sm" />
                      {/* <Form.Control type={"date"} size="sm"  /> */}
                    </Col>
                    <Col md={2} className="mt-3">
                      <div>To</div>
                        <DatePicker style={{width:"100%"}}   size="sm" />
                      {/* <Form.Control type={"date"} size="sm" /> */}
                    </Col>
                </Row>
                <Row className='mb-3'>
                    <Col md={4}>
                        <div>Account</div>
                            <Select
                              showSearch
                              allowClear
                              style={{ width: '100%' }}
                              placeholder="Account"
                              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                              filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={8} className="mb-3">
                      <div>Company</div>
                      <Radio.Group className='mt-1'
                      >
                        <Radio value={1}>SEA NET SHIPPING & LOGISTICS</Radio>
                        {/* <Radio value={2}>CARGO LINKERS</Radio> */}
                        <Radio value={3}>AIR CARGO SERVICES</Radio>
                      </Radio.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={9} className="mb-3">
                      <b>Currency</b><br />
                      <Radio.Group className="mt-1">
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
                </Row>
                <Row>
                <Col md={4} className="mt-0">
                    <div>Job No:</div>
                  <Select
                      showSearch
                      style={{ width: '100%' }}
                      placeholder="Job No:"
                    />
                </Col>
                </Row>
                <Row>
                <Col md={4} className='py-1 mt-3'>
                    <div>Report Types</div>
                    <Select
                        showSearch
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Select Report Type"
                        options={[
                          { label: 'Ageing Detail', value: 'Ageing Detail' },
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
                                    // query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel, revenue:revenue} 
                                });
                                // console.log(revenue)
                                dispatch(incrementTab({
                                    "label": "Ageing Report",
                                    "key": "5-14",
                                    // "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&revenue=${revenue}`
                                }))
                            }}>
                            Go
                        </button>
                    </Col>
                    <Col md={1} className=''>
                        <button className='btn-custom mt-3 px-3'
                            onClick={() => {
                                Router.push({ 
                                    pathname: `/reports/ageingReport/summary`, 
                                    // query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel, revenue:revenue} 
                                });
                                // console.log(revenue)
                                dispatch(incrementTab({
                                    "label": "Ageing Summary",
                                    "key": "5-15",
                                    // "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&revenue=${revenue}`
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