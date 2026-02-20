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

const TrialBalance = () => {

  const [records, setRecords] = useState([]);
  const [debitAccount, setDebitAccount] = useState(null);
  const [company, setCompany] = useState(1);
  const [from, setFrom] = useState(moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString());
  const [to, setTo] = useState(moment().toISOString());
  const [currency, setCurrency] = useState("PKR");
  const [reportType, setReportType] = useState("6- Columns Simplified View");
  const [options, setOptions ] = useState("showall");

  const dispatch = useDispatch()

  const stateValues = {
    from,
    to,
    company,
    currency,
    debitAccount,
    reportType,
    options
  };

  const filterValues = useSelector(state => state.filterValues);
  const filters = filterValues.find(page => page.pageName === "trialBalance");
  const values = filters ? filters.values : null;

  useEffect(() => { getAccounts(); }, [company]);
  useEffect(() => {
    if (filters) {
      // setFrom(values.from);
      // setTo(values.to);
      setCompany(values.company);
      setCurrency(values.currency);
      setDebitAccount(values.debitAccount);
      setReportType(values.reportType);
      setOptions(values.options)

    }
    



  }, [filters]);

  const getAccounts = async () => {
    await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_PARENT_ACCOUNTS, {
      headers: { companyid: company }
    }).then((x) => {
      let temprecords = [];
      x.data.result.forEach((x) => {
        temprecords.push({ value: x.id, label: `(${x.code}) ${x.title}` });
      })
      setRecords(temprecords);
    })
  }

  const handleSubmit = () => {
    // console.log("here")
    // console.log(debitAccount)
    // Router.push("/reports/trialBalance/report")
    Router.push({ pathname: `/reports/trialBalance/report`, query: { from: from, to: to, company: company, reportType: reportType, currency: currency, accountid:debitAccount, options:options, old:false } });
    dispatch(incrementTab({
      "label": "Trial Balance Report",
      "key": "5-10",
      "id": `?from=${from}&to=${to}&company=${company}&reportType=${reportType}&currency=${currency}&accountid=${debitAccount}&options=${options}&old=${false}`
    }))

    dispatch(setFilterValues({
      pageName:"trialBalance",
      values:stateValues
    }))
  }

  const handleCompanyChange = (event) => {
        setCompany(event.target.value);
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);

};

  return (
  <div className="base-page-layout">
        <div className="page-header">
            <h4 className='fw-7 m-0'>Trial Balance</h4>
            <button className='btn-custom my-1 px-4' onClick={handleSubmit}>
              Go
            </button>
        </div>
        <div className="form-card">
      <Col gutter={1} className=" mt-3">
        <div className="card-section">
        <Row gutter={16} className='form-row'>
        <Col md={3}>
            <label>From</label>
        <DatePicker 
        allowClear={false} 
        style={{width:"100%",  borderRadius:"6px"}}
        className='datePicker-modern' 
        format="DD-MM-YYYY" 
        value={moment(from)} 
        onChange={(e)=>{setFrom(moment(e).toISOString())}}/>
      </Col>
      <Col md={3}>
            <label>To</label>
        <DatePicker 
        allowClear={false} 
        style={{width:"100%", borderRadius:"6px"}}
        className='datePicker-modern' 
        format="DD-MM-YYYY" 
        value={moment(to)} 
        onChange={(e)=>{setTo(moment(e).toISOString())}}/>
      </Col>
      <Col md={6}>
        <label>Account</label>
        <Select
          showSearch
          allowClear
          style={{ width: '100%' }}
          className='select-modern'
          placeholder="Debit Account"
          onChange={(e) => setDebitAccount(e)}
          options={records}
          value={debitAccount}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
        />
      </Col>
      </Row>

      <Row gutter={16} >
        <Col md={8}>
        <div className="card-section">
        <b>Currency</b><br />
        <Radio.Group className="mt-2"
         value={currency}
         onChange={handleCurrencyChange}>
        <Radio value={"PKR"}>PKR</Radio>
          <Radio value={"USD"}>USD</Radio>
          <Radio value={"GBP"}>GBP</Radio>
          <Radio value={"CHF"}>CHF</Radio>
          <Radio value={"EUR"}>EUR</Radio>
          <Radio value={"AED"}>AED</Radio>
          <Radio value={"OMR"}>OMR</Radio>
          <Radio value={"BDT"}>BDT</Radio>
        </Radio.Group>
        </div>
      </Col>
      <Col md={4}>
      <div className="card-section">
      <b><label>Report</label></b>
      <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Report"
          className='select-modern'
          onChange={(e) => setReportType(e)}
          options={[
            { value:'6- Columns Simplified View', label:'6- Columns Simplified View' },
            { value:'2- Columns Simplified View', label:'2- Columns Simplified View' },
            { value:'Debitors List', label:'Debitors List' },
            { value:'Creditors List', label:'Creditors List' },

           
          ]}
          value={reportType}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
        />
        </div>
      </Col>
      </Row>
      </div></Col>
      <Row gutter={16} className=" mt-3">
        <Col md={8}>
        <div className="card-section">
        <h5>Company</h5>
        <Radio.Group className='mt-1'
          value={company}
          onChange={(e)=>{setCompany(e.target.value)}}
        >
          <Radio value={1}>SEA NET SHIPPING & LOGISTICS</Radio>
          <Radio value={3}>AIR CARGO SERVICES</Radio>
        </Radio.Group>
        </div>
      </Col>
      <Col md={4} >
      <div className="card-section">
            <h5>Options</h5>
            <Radio.Group className='mt-1' onChange={(e)=>setOptions(e.target.value)} value={options}>
                {/* <Radio value={"exclude"}>Exclude 0 </Radio> */}
                <Radio value={"excludeOpening"}>Exclude Opening</Radio>
                <Radio default value={"showall"}>Show All</Radio>
            </Radio.Group>
            </div>
          </Col>
      </Row>
    <div className='d-flex'>

    
    </div>
    </div>
    </div>  
  )
}

export default React.memo(TrialBalance)