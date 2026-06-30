import axiosClient from 'apis/axiosClient';
import moment from "moment";
import { Select, Radio, DatePicker, Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { incrementTab } from 'redux/tabs/tabSlice';
import { setFilterValues } from 'redux/filters/filterSlice';
import Router from 'next/router';
import Cookies from "js-cookie";

const IncomeStatement = () => {

  const [records, setRecords] = useState([]);
  const [debitAccount, setDebitAccount] = useState("");
  const [company, setCompany] = useState(1);
  const [from, setFrom] = useState(moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString());
  const [to, setTo] = useState(moment().toISOString());
  const [from1, setFrom1] = useState(moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString());
  const [to1, setTo1] = useState(moment().toISOString());
  const [currency, setCurrency] = useState("PKR");
  const [accountLevel, setAccountLevel] = useState("6");
  const [revenue, selectRevenue] = useState();
  const [expense, selectExpense] = useState();
  const [reportType, setReportType ] = useState("pnl");

  let isRevenue = false;
  let isExpense = false;

  const dispatch = useDispatch()

  const stateValues = {
    from,
    to,
    company,
    debitAccount,
    accountLevel
  }

  const filterValues = useSelector(state => state.filterValues);
  const filters = filterValues.find(page => page.pageName === "accountActivity");
  const values = filters ? filters.values : null;

  const getAccounts = async () => {
    let temprecords = [];
    const result = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_PARENT_ACCOUNTS_ADVANCED, {
      headers: { companyid: company }
    }).then((x) => {
      // temprecords = x.data.result
      x.data.result.forEach((account) => {
        if(account.code == '4'){
          temprecords.push(account)
        }
        if(account.code == '5'){
          temprecords.push(account)
        }
      })
      console.log("Accounts:", temprecords)
      // .filter((x) => {
      //   if(x.AccountId == 2 || x.AccountId == 1){
      //     return x
      //   }
      // })
    })
    setRecords(temprecords);
  }

  console.log("Records: ", records)

  useEffect(() => { getAccounts(); }, [company]);

  useEffect(() => {
    if (filters) {
      // setFrom(values.from);
      // setTo(values.to);
      setCompany(values.company);
      setDebitAccount(values.debitAccount);
      setAccountLevel(values.accountLevel);
    }
  }, [filters, isRevenue, isExpense]);





  const handleRevenueChange = (e) => {
    selectRevenue(e);
    isExpense = true;
    
  }
  const handleExpenseChange = (e) => {
    selectExpense(e);
    isRevenue = true;
    
  }

  const handleSubmit = async () => {
    if(revenue != null){
      Router.push({ 
        pathname: `/reports/incomeStatement/report`, 
        query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel, revenue:revenue} 
      });
      dispatch(incrementTab({
        "label": "Income Statement",
        "key": "5-12",
        "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&revenue=${revenue}`
      }))

    }else if(expense != null){
      Router.push({ 
        pathname: `/reports/incomeStatement/report`, 
        query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel, expense:expense } 
      });
      dispatch(incrementTab({
        "label": "Income Statement",
        "key": "5-12",
        "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&expense=${expense}`
      }))

    }else if(reportType == "CMP"){
      Router.push({ 
        pathname: `/reports/incomeStatement/comparitive`, 
        query: { from: from, to: to, from1: from1, to1: to1, company: company, currency: currency, accountLevel:accountLevel, reportType:reportType  } 
      });
      dispatch(incrementTab({
        "label": "IS Comparitive Report",
        "key": "5-20",
        "id": `?from=${from}&to=${to}&from1=${from1}&to1=${to1}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&reportType=${reportType}`
      }))
    }else if(reportType != null){
      Router.push({ 
        pathname: `/reports/incomeStatement/report`, 
        query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel, reportType:reportType  } 
      });
      dispatch(incrementTab({
        "label": "Income Statement",
        "key": "5-12",
        "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}&reportType=${reportType}`
      }))
    }else{
      Router.push({ 
        pathname: `/reports/incomeStatement/report`, 
        query: { from: from, to: to, company: company, currency: currency, accountLevel:accountLevel } 
      });
      dispatch(incrementTab({
        "label": "Income Statement",
        "key": "5-12",
        "id": `?from=${from}&to=${to}&company=${company}&currency=${currency}&accountLevel=${accountLevel}`
      }))
    }
  }

  return (
    <div className="base-page-layout">
            <div className="page-header">
                <h4 className='fw-7 m-0'>Income Statement</h4>
                <button className='btn-custom my-1 px-4' onClick={handleSubmit}>
                  Go
                </button>
            </div>
        <div className="form-card">
       <Col gutter={1} className=" mt-3">
        <div className="card-section">
        <Row gutter={16} className='form-row'>
        <Col md={3} className="mt-2">
          <label>From</label>
          <DatePicker 
          allowClear={false} 
          style={{width:"100%", borderRadius:"6px"}}
          className='datePicker-modern' 
          format="DD-MM-YYYY" 
          value={moment(from)} 
          onChange={(e)=>{setFrom(moment(e).toISOString())}}/>
        </Col>
        <Col md={3} className="mt-2">
          <label>To</label>
          <DatePicker
          allowClear={false}
          style={{width:"100%", borderRadius:"6px"}}
          value={moment(to)}
          format="DD-MM-YYYY"
          onChange={(e)=>{
            setTo(moment(e).toISOString())
          }}
          className='datePicker-modern'
          />
        </Col>
        <Col md={6} className="mt-2">
        <label>Account Level</label>
        <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Account Level"
            className='select-modern'
            onChange={(e) => setAccountLevel(e)}
            options={[
              { value:'1', label:'1' },
              { value:'6', label:'6' },

                      
            ]}
            value={accountLevel}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
        />
        </Col>
        </Row></div></Col>
        <Row className="mt-3">
                    
        <Col md={6}>
          <div className="card-section">
        <b><label>Revenue Parent</label></b>
        <Select 
        disabled={isRevenue} 
        name="selectRevenue" 
        style={{ width: "100%" }} 
        className='select-modern'
        placeholder="Select Revenue" 
        showSearch onChange={handleRevenueChange}>
          {records.map((x, index) => {
            if(x.code == '4'){
              // console.log(x)
              return <Select.OptGroup key={index} label={x.title}>
                {x.children.map((y, index) => {
                  return <Select.Option key={index} value={y.title}>{"("+y.code+")" + ' - ' +y.title}</Select.Option>
                })}
              </Select.OptGroup>
            }
            // return <Select.Option key={index} value={x.label}>{x.label}</Select.Option>
          })}
        </Select>
        </div>
        </Col>
        <Col md={6}>
        <div className="card-section">
        <b><label>Expense Parent</label></b>
        <Select 
        disabled={isExpense} 
        name="selectExpense" 
        style={{ width: "100%" }} 
        className='select-modern'
        placeholder="Select Expense" 
        showSearch onChange={handleExpenseChange}>
        {records.map((x, index) => {
            if(x.code == '5'){
              return <Select.OptGroup key={index} label={x.title}>
                {x.children.map((y, index) => {
                  return <Select.Option key={index} value={y.title}>{"("+y.code+")" + ' - ' +y.title}</Select.Option>
                })}
              </Select.OptGroup>
            }
            // return <Select.Option key={index} value={x.label}>{x.label}</Select.Option>
          })}
        </Select></div>
        </Col>
        </Row>

        <Row gutter={16} className=" mt-3">
        <Col md={6}>
          <div className="card-section">
          <h5>Company</h5>
          <Radio.Group className='mt-1'
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
            }}
          >
            <Radio value={1}>SEA NET SHIPPING & LOGISTICS</Radio>
            {/* <br /> */}
            {/* <Radio value={2}>CARGO LINKERS</Radio> */}
            <Radio value={3}>AIR CARGO SERVICES</Radio>
          </Radio.Group>
          </div>
        </Col>
        <Col md={6}>
        
          <div className="card-section">
            <h5>Report Types</h5>
            <Radio.Group className='mt-1'
              value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <Radio value={"TC"}>Two Column </Radio>
              <Radio value={"CMP"}>Comparitive</Radio>
              {/* <br /> */}
              <Radio value={"pnl"}>Profit & Loss Income Statement </Radio>
            </Radio.Group>
            </div>
          </Col>
          </Row>
        <Row gutter={16} className=" mt-3">
        <Col md={16}>
          <div className="card-section">
          <b>Currency</b><br />
          <Radio.Group className="mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
        </Row>
        {reportType == 'CMP' && <div className="card-section mt-3">
          <Row gutter={16} className='form-row'>
            <b>Comparative Dates</b>
            <Col md={3} className="mt-2">
              <label>From</label>
              <DatePicker 
              allowClear={false} 
              style={{width:"100%", borderRadius:"6px"}}
              className='datePicker-modern' 
              format="DD-MM-YYYY" 
              value={moment(from1)} 
              onChange={(e)=>{setFrom1(moment(e).toISOString())}}/>
            </Col>
            <Col md={3} className="mt-2">
              <label>To</label>
              <DatePicker
              allowClear={false}
              style={{width:"100%", borderRadius:"6px"}}
              value={moment(to1)}
              format="DD-MM-YYYY"
              onChange={(e)=>{
                setTo1(moment(e).toISOString())
              }}
              className='datePicker-modern'
              />
            </Col>
          </Row>
        </div>}
     </div>
    </div>
  )
}

export default React.memo(IncomeStatement)
