import { Row, Col, Form } from "react-bootstrap";
import { Select, Input, Checkbox, Radio, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobValues } from '/apis/jobs';
import { incrementTab } from '/redux/tabs/tabSlice';
import Router from "next/router";
import { useDispatch, useSelector } from 'react-redux';
// import {useRouter} from "next/router";
import moment from 'moment';
import { setFilterValues } from "/redux/filters/filterSlice";

const InvoiceBalaincing = () => {

  const dispatch = useDispatch();
  const [from, setFrom] = useState(moment().month() < 6? moment().subtract(1, 'year').set({ month: 6, date: 1 }).toISOString(): moment().set({ month: 6, date: 1 }).toISOString());
  const [to, setTo] = useState(moment().toISOString());
  const [company, setCompany] = useState(4);
  const [overseasAgent, setOverseasAgent] = useState(undefined);
  const [representator, setRepresentator] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [reportType, setReportType] = useState("viewer");
  const [balance, setBalance] = useState("exclude0");
  const [jobTypes, setJobTypes] = useState([]);
  const [values, setValues] = useState();
  const [payType, setPayType] = useState("All");
  const { data, status } = useQuery({ queryKey: ['values'], queryFn: getJobValues });
  const commas = (a) => a ? parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ") : '0.0';

  const stateValues = {
    from,
    to,
    company,
    payType,
    overseasAgent,
    representator,
    currency,
    jobTypes,
    reportType,
    balance
  };
  
  const filterValues = useSelector(state => state.filterValues);
  const filters = filterValues.find(page => page.pageName === "AgentInvoiceBalancing");
  const value = filters ? filters.values : null

  useEffect(() => { if (status == "success") {

    setValues(data.result) 
  }else{
    console.log("error")
  }

  }, [status]);
  useEffect(() => {
    if (filters) {
      setFrom(value.from),
      setTo(value.to),
      setCompany(value.company),
      setPayType(value.payType),
      setOverseasAgent(value.overseasAgent),
      setRepresentator(value.representator),
      setCurrency(value.currency),
      setJobTypes(value.jobTypes),
      setReportType(value.reportType)
      // setBalance(value.balance)
    }
  }, [filters])


  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const plainOptions = [
    { label: 'Sea Export', value: 'SE' },
    { label: 'Sea Import', value: 'SI' },
    { label: 'Air Export', value: 'AE' },
    { label: 'Air Import', value: 'AI' }
  ];

  const handleSearch = async () => {
    // console.log(currency)
    Router.push({
        pathname: `/reports/invoiceBalancing/report`,
        query: {
          "company": company,
          "overseasagent": overseasAgent,
          "representator": representator,
          "jobtypes": jobTypes,
          "currency": currency,
          "from": from,
          "to": to,
          "paytype": payType,
          "report": reportType,
          "balance": balance,
        }
    });
    dispatch(incrementTab({
        "label": "Agt Invoice Bal Report",
        "key": "5-8",
        "id": `report?company=${company}&overseasagent=${overseasAgent}&representator=${representator}&currency=${currency}&jobtypes=${jobTypes}&to=${to}&from=${from}&paytype=${payType}&report=${reportType}&balance=${balance}`
    }))
    dispatch(setFilterValues({
        pageName: "AgentInvoiceBalancing",
        values: stateValues
    }));
  };

  return (
        <div className="base-page-layout">
            <div className="page-header d-flex justify-content-between align-items-center">
            <h4 className='fw-7 m-0'>Invoice Balancing</h4>
            <button className='btn-custom px-4' onClick={handleSearch}>
              Go
            </button>
            </div>
        {status == "success" &&
        <div className="form-card">
          
      <div className="filter-section">
              <Row gutter={16}>
                <Col md={4}>
                  <label>From</label>
                  <DatePicker
                  format={'DD-MM-YYYY'}
                  style={{ width: "100%", borderRadius:"6px" }} 
                  className='datePicker-modern'
                  value={from ? moment(from) : null} 
                  onChange={(e) => setFrom(e ? e.startOf("day").toISOString() : null)} />
                </Col>
      
                <Col md={4}>
                  <label>To</label>
                  <DatePicker 
                  format={'DD-MM-YYYY'}
                  value={to ? moment(to) : null}
                  style={{ width: "100%", borderRadius:"6px" }} 
                  className='datePicker-modern'
                  onChange={(e) => setTo(e ? e.endOf("day").toISOString() : null)} />
                </Col>
      
                <Col md={4}>
                  <label>Company</label>
                  <Select
                    
                    style={{ width: "100%" }}
                    className='select-modern'
                    value={company}
                    onChange={(e) => setCompany(e)}
                    options={[
                      { value: 1, label: "Sea Net Shipping & Logistics" },
                      { value: 2, label: "Cargo Linkers" },
                      { value: 3, label: "Air Cargo Services" },
                      { value: 4, label: "SNS & ACS" },
                    ]}
                  />
                </Col>
      
                <Col md={4}>
                  <label>Pay Type</label>
                  <Select
                    // size="small"
                    style={{width: '100%'}}
                    className='select-modern'
                    value={payType}
                    onChange={(e) => setPayType(e)}
                    options={[
                      { value: "Recievable", label: "Recievable" },
                      { value: "Payble", label: "Payble" },
                      { value: "All", label: "All" },
                    ]}
                  />
                </Col>
      
                {/* <Col md={4}>
                  <label>Party Specific</label>
                  <Select
                    // size="small"
                    style={{width: '100%'}}
                    showSearch
                    allowClear
                    className='select-modern'
                    filterOption={filterOption}
                    onChange={(e) => setParty(e)}
                    options={[
                      ...values?.party?.client?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.localVendor?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.airLine?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.chaChb?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.forwarder?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.sLine?.map((x) => ({ value: x.id, label: x.name })),
                      ...values?.vendor?.transporter?.map((x) => ({ value: x.id, label: x.name })),
                    ]}
                  />
                </Col> */}
      
                <Col md={4}>
                  <label>Overseas Agent</label>
                  <Select
                    
                    style={{width: '100%'}}
                    showSearch
                    allowClear
                    className='select-modern'
                    filterOption={filterOption}
                    onChange={(e) => setOverseasAgent(e)}
                    options={values?.vendor?.overseasAgent?.map((x) => ({
                      value: x.id,
                      label: x.name,
                    }))}
                  />
                </Col>
              </Row>
            </div>
            <div className="filter-section">
              <Row gutter={16}>
                <Col md={4}>
                  <label>Sales Representor</label> 
                  <Select defaultValue="" 
                  style={{width:'100%'}}
                  className='select-modern' 
                  onChange={(e)=>{setRepresentator(e) }} 
                  showSearch filterOption={filterOption} 
                  options={values?.sr?.map((x)=>{ return { value:x.id, label:x.name }})} />
                </Col>
      
                <Col md={4}> 
                <label>Job # </label>
                <Input 
                style={{width:'100%', borderRadius: '6px', height: '35px', border: '1px solid #ccc'}}
                className='select-modern'
                /> 
                </Col>
      
                <Col md={4}>
                  <label>File # </label>
                  <Input 
                  style={{width:'100%', borderRadius: '6px', height: '35px', border: '1px solid #ccc'}}
                  className='select-modern'
                   />
                </Col>
      
                <Col md={4}>
                    <label>Currency </label>
                    <Select 
                    defaultValue="" 
                    style={{width:'100%'}}
                    className='select-modern'
                    onChange={(e)=>{setCurrency(e) }} 
                    options={[ { value:"PKR", label:"PKR"}, { value:"USD", label:"USD"}, { value:"EUR", label:"EUR"}, { value:"GBP", label:"GBP"}, { value:"AED", label:"AED"}, { value:"OMR", label:"OMR"}, { value:"BDT", label:"BDT"}, { value:"CHF", label:"CHF"}, ]} 
                    /> 
                </Col>
      
                <Col md={4}>
                <label>Flight #</label> 
                <Input 
                style={{width:'100%', borderRadius: '6px', height: '35px', border: '1px solid #ccc'}}
                className='input-modern'
                /> 
                </Col> 
                <Col md={4}> 
                <label>Voyage # </label>
                <Input 
                style={{width:'100%', borderRadius: '6px', height: '35px', border: '1px solid #ccc'}}
                className='input-modern'
                /> 
                </Col>
              </Row>
            </div>
            {/* ================= REPORT + TYPE SECTION ================= */}
            <div className='last'> <Row className="mt-3">
              <Col md={4}>
                <div className="filter-section">
                  <h6 className="section-title">Report Type</h6>
                  <Radio.Group
                    onChange={(e) => setReportType(e.target.value)}
                    value={reportType}
                  >
                    <Radio value={"viewer"}>Viewer</Radio>
                    <Radio value={"grid"}>Grid</Radio>
                  </Radio.Group>
                </div>
              </Col>
              
              <Col md={4}>
              <div className="filter-section1"> 
                <h6 className="section-title">Operation Types</h6>
                <Checkbox.Group
                  options={plainOptions}
                  defaultValue={['SE', 'SI', 'AE', 'AI']}
                  onChange={(e) => setJobTypes(e)}
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="filter-section">
                <h6 className="section-title">Balance</h6>
                <Radio.Group
                  onChange={(e) => setBalance(e.target.value)}
                  value={balance}
                >
                  <Radio value={"exclude0"}>Exclude 0</Radio>
                  <Radio value={"showall"}>Show All</Radio>
                </Radio.Group>
              </div>
            </Col>
            </Row>
            </div>
          </div>
      
     
  };
  </div>
  );
}
export default React.memo(InvoiceBalaincing);