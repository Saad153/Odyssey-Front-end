import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Select, Radio, DatePicker, Checkbox } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import Router from 'next/router';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import moment from "moment";
import { setAuditField } from '../../../../redux/audit/auditSlice';
import axios from 'axios';
import AuditReport from '/Components/Layouts/Reports/AuditLog/report';

const AuditLog = () => {
    const state = useSelector((state) => state.audit);
    const [exporting, setExporting] = useState(false);
    const dispatch = useDispatch();

    const ExportExcel = async () => {
        setExporting(true);
        try {
          const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getHistory`,{headers:{ audit_sdate: state.audit_sdate, audit_edate: state.audit_edate, audit_form: state.audit_form, audit_user: state.audit_user, audit_action: state.audit_action }}).then((x)=>x.data);
          console.log("Export to Excel Result:", result)
        } catch (error) {
          console.error("Error exporting to Excel:", error);
        }
      };

    const getFormNames = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getFormTypes`);
        let temp = [
            {value:"All",label:"All"}
        ];
        res.data.result.forEach((x)=>{
            temp.push({value:x.formName,label:x.formName})
        })
        dispatch(setAuditField({field:"audit_FormNames",value:temp}))
    }

    const getTypes = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getTypes`);
        let temp = [
            {value:"All",label:"All"}
        ];
        res.data.result.forEach((x)=>{
            temp.push({value:x.type,label:x.type})
        })
        dispatch(setAuditField({field:"audit_Types",value:temp}))
    }

    const getUsers = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/employeeRoutes/getEmployeesIdAndName`);
        let temp = [
            {value:"All",label:"All"}
        ];
        res.data.result.forEach((x)=>{
            temp.push(x)
        })
        dispatch(setAuditField({field:"audit_Users",value:temp}))
    }

    useEffect(()=>{
        if(state.audit_FormNames.length==0){
            getFormNames()
        }
        if(state.audit_Types.length==0){
            getTypes()
        }
        if(state.audit_Users.length==0){
            getUsers()
        }
    }, [])
    console.log("Audit State:", state)
    return (    
        <div className="base-page-layout">
                    <div className="page-header">
                        <h4 className='fw-7 m-0'>Audit Log</h4>
                        <div className='btn-header'>
                            <button className='btn-custom my-1 px-4 mx-1'
                        onClick={() => {
                            Router.push({ 
                                pathname: `/reports/auditLog/report`, 
                                query: { from: moment(state.audit_sdate).toISOString(), to: moment(state.audit_edate).add(1, 'day').toISOString(), form: state.audit_form, user: state.audit_user, action: state.audit_action } 
                            });
                            // console.log(revenue)
                            dispatch(incrementTab({
                                "label": "Audit Report",
                                "key": "5-16",
                                // "id": '1'
                                "id": `?from=${moment(state.audit_sdate).toISOString()}&to=${moment(state.audit_edate).toISOString()}&form=${state.audit_form}&user=${state.audit_user}&action=${state.audit_action}`  
                            }))
                        }}>
                        Go
                    </button>
                    <button
                    className="btn-custom-excel my-1 px-4"
                     onClick={() => {
                                              // ExportExcel();
                                              setExporting(true);
                                              const iframe = document.createElement('iframe');
                                                  iframe.style.display = 'none'; 
                                                  iframe.src =
                                                    `/reports/auditLog/report` +
                                                    `?audit_reportType=${state.audit_reportType}` +
                                                    `&from=${state.audit_sdate}` +
                                                    `&to=${state.audit_edate}` +
                                                    `&form=${state.audit_form}` +
                                                    `&user=${state.audit_user}` +
                                                    `&action=${state.audit_action}` +       
                                                    `&autoExport=true`;
                                            document.body.appendChild(iframe);
                                            setTimeout(() => {
                                            setExporting(false);
                                                }, 1500);
                                              }}
                                            >
                                          {exporting ? (
                                            <>
                                              <span className="spinner-border spinner-border-sm me-2" />
                                              Exporting...
                                            </>
                                              ) : (
                                            <>
                                              <FileExcelOutlined /> Export to Excel
                                            </>
                                              )}
                </button>
                        </div>
                    </div>
                <div className="form-card">
                    <Col gutter={1} className=" mt-3">
                    <div className="card-section">
                    <Row gutter={16} className='form-row'>
                    <Col md={3}>
                        <label>From</label>
                        <DatePicker 
                        format={'DD-MM-YYYY'}
                        style={{ width: "100%", borderRadius:"6px" }}
                        className='datePicker-modern'
                        allowClear={false}
                        value={moment(state.audit_sdate)}
                        onChange={(e) => dispatch(setAuditField({ field: "audit_sdate", value: moment(e).toISOString()}))}
                    />
                  </Col>
        
                  <Col md={3}>
                    <label>To</label>
                    <DatePicker 
                    format={'DD-MM-YYYY'}
                      style={{ width: "100%", borderRadius:"6px" }}
                      className='datePicker-modern'
                      allowClear={false}
                      value={moment(state.audit_edate)}
                      onChange={(e) => dispatch(setAuditField({ field: "audit_edate", value: moment(e).toISOString()}))}
                    />
                  </Col>

                  <Col md={6}>
                    <label>Form</label>
                            <Select 
                            showSearch 
                            allowClear
                            style={{ width: "100%" }}
                            className='select-modern' 
                            placeholder="Select Form" 
                            value={state.audit_form}
                            onChange={e => dispatch(setAuditField({field:"audit_form",value:e}))} 
                            options={state.audit_FormNames}
                                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
                            />
                    </Col>
                </Row>
                </div></Col>
                <Row className="mt-3">  
                        <Col md={6}>
                        <div className="card-section">
                            <h5>User</h5>
                            <Select 
                            showSearch 
                            allowClear
                            style={{ width: "100%" }}
                            className='select-modern' 
                            placeholder="Select User" 
                            value={state.audit_user}
                            onChange={e => dispatch(setAuditField({field:"audit_user",value:e}))} 
                            options={state.audit_Users}
                                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
                            />
                         </div>
                    </Col>
                <Col md={6}>
                        <div className="card-section">
                        <h5 className="form-label">Action</h5>
                            <Select 
                            showSearch 
                            allowClear
                            style={{ width: "100%" }} 
                            className='select-modern'
                            placeholder="Select Action" 
                            value={state.audit_action}
                            onChange={e => dispatch(setAuditField({field:"audit_action",value:e}))} 
                            options={state.audit_Types}
                            //     filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                            //     filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
                            />
                            </div>
                    </Col>
                </Row>
                  
            </div>
    </div> 
  )
}

export default React.memo(AuditLog)