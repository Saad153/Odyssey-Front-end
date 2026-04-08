import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from "react-bootstrap";
import moment from "moment";
import { DatePicker, Radio, Select } from "antd";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import Router from 'next/router';
import { setFilterValues } from '../../../../redux/filters/filterSlice';
import { setFrom, setTo, setCompany, setCurrency, setRecords, setAccount, setName, setFirst } from '../../../../redux/ledger/ledgerSlice';
import Cookies from 'js-cookie';

const Ledger = () => {

  const dispatch = useDispatch();

  const filterValues = useSelector(state => state.filterValues);
  const { from, to, company, currency, records,account, name, first } = useSelector((state) => state.ledger);

  const filters = filterValues.find(page => page.pageName === "ledgerReport");
  const values = filters ? filters.values : null;

  useEffect(()=>{
    if(first){
      // alert("UseEffect Ran")
      dispatch(setCompany(parseInt(Cookies.get("companyId"))))
      dispatch(setFirst(false))
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
            dispatch(setRecords(temprecords));
            getAccountName(temprecords);
    }catch(e){
      console.log("e",e)
    }
  };

  const getAccountName = (temprecords) =>{

    const data = temprecords || records
    const foundAccount = data?.find(x => x.value == account);
    // console.log("found", foundAccount)
    if (foundAccount) {
      let acName = foundAccount?.label;
      dispatch(setName(acName))
          }else{
      dispatch(setName(""))
    }
  }

  useEffect(() => { 
    if (company != "") {
      getAccounts();
    }
  }, [company]);

  useEffect(() => {
    if (account && records.length > 0) {
      getAccountName(records);
    }
  }, [account, records]);


  // useEffect(()=>{
  //   if(filters){
  //     setFrom(values.from),
  //     setTo(values.to),
  //     setCompany(values.company),
  //     setAccount(values.account),
  //     setCurrency(values.currency)

  //   }
  // },[filters])

  const handleAccountChange = (value) => {
    dispatch(setAccount(value));
  };

  return (
  <div className="base-page-layout">
      <div className="page-header">
          <h4 className='fw-7 m-0'>Ledger</h4>
          <button className='btn-custom my-1 px-4' onClick={() => {
          if (account != "" && account != null) {
            const foundAccount = records?.find(x => x.value == account);
            const accountName = foundAccount ? foundAccount.label : "";
            Router.push({
              pathname: `/reports/ledgerReport/${account}`,
              query: {
                from: moment(from).format("DD-MM-YYYY"),
                to: moment(to).format("DD-MM-YYYY"),
                name: accountName,
                company,
                currency,
              },
            });
            dispatch(
              incrementTab({
                label: "Ledger Report",
                key: "5-7",
                id: `/${account}?from=${moment(from).format("DD-MM-YYYY")}&to=${moment(to).format("DD-MM-YYYY")}&name=${encodeURIComponent(accountName)}&company=${company}&currency=${currency}`,
              })
            );
          }
        }
        }> Go </button>
      </div>
        <div className="form-card">
      <Col gutter={1} className=" mt-3">
      <div className="card-section">
      <Row gutter={16} className='form-row'>
      <Col md={3} className="mt-3">
          <label>From</label>
          <DatePicker 
          allowClear={false} 
          format="DD-MM-YYYY" 
          style={{ width: "100%", borderRadius:"6px" }} 
          value={moment(from)} 
          onChange={(e)=>{dispatch(setFrom(moment(e).toString()))}}/>
      </Col>
      <Col md={3} className="mt-3">
        <label>To</label>
        <DatePicker 
        allowClear={false} 
        format="DD-MM-YYYY" 
        style={{ width: "100%", borderRadius:"6px" }} 
        value={moment(to)} 
        onChange={(e)=>{dispatch(setTo(moment(e).toString()))}}/>
      </Col>
      <Col md={6} className="mt-3">
        <label>Accounts</label>
        <Select showSearch 
        allowClear
        style={{ width: "100%" }} 
        placeholder="Select Account" 
        className='select-modern'
        value={account}
        onChange={handleAccountChange} 
        options={records}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
        />
      </Col>
      </Row>
      <Col md={8} className="my-3">
        <b>Company</b>
        <Radio.Group className="mt-1" 
        value={company} 
        style={{width: '100%'}}
        onChange={(e) => dispatch(setCompany(e.target.value))}>
          <Radio value={1}>SEA NET SHIPPING & LOGISTICS</Radio>
          <Radio value={2}>CARGO LINKERS</Radio>
          <Radio value={3}>AIR CARGO SERVICES</Radio>
        </Radio.Group>
      </Col>
      </div></Col>
    
      <Col gutter={2} className=" mt-3">
      <div className="card-section">

      <Col md={9} className="my-3">
        <b>Currency</b><br />
        <Radio.Group className="mt-1" 
        value={currency} onChange={(e) => dispatch(setCurrency(e.target.value))}>
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
      
      
      </div>
      </Col>
     
    </div>
  </div>
  )
}

export default  React.memo(Ledger)