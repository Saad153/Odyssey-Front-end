import { recordsReducer, initialState, plainOptions,typeOptions } from './states';
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { Select, Checkbox, Modal, Radio, DatePicker } from 'antd';
import React, {useState, useEffect, useReducer } from 'react';
import moment from "moment";
// import Search from './Search';
import Sheet from './Sheet';
// import AdvanceSearch from './AdvanceSearch';
import { incrementTab } from '/redux/tabs/tabSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import Router from "next/router";
import { setFilterValues } from '/redux/filters/filterSlice';
import { setFrom, setTo, setCompany, setClient,setJobType,setOverSeasagent,setReportType,setSalesRepresentative,setSubType } from '../../../../redux/profitLoss/profitLossSlice';
import Search from 'antd/lib/input/Search';
import axios from 'axios';

const JobPL = () => {
  const dispatchNew = useDispatch();

  const [state, dispatch] = useReducer(recordsReducer, initialState);
  const set = (obj) => dispatch({ type: 'set', payload: obj });

  const { from, to, jobType,company,subType,salesRepresentative,overSeasagent,client,reportType  } = useSelector((state) => state.profitloss);



  //getting selected Filter values from state by filter name
  const filterValues = useSelector((state) => state.filterValues);
  const filters = filterValues.find(page=>page.pageName==="jobPLreport");
  const values = filters ? filters.values : null;

  const getClients = async(type) => {
    console.log("Getting:", type)
    const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/clientRoutes/getClientsbyType`, { headers: { type: type } });
    console.log("Res:", res)
    const { data } = res;
    const { result } = data;
    return result
  }

  const getSR = async(type) => {
    console.log("Getting Sales Representative")
    const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/employeeRoutes/getRepresentativeEmployees`);
    const { data } = res;
    const { result } = data;
    return result.Sr
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (state.clients.length === 0) {

          const [clients, shipper, overseas, sales] = await Promise.all([
            getClients('Consignee'),
            getClients('Shipper'),
            getClients('Overseas Agent'),
            getSR()
          ]);

          console.log("Clients:", clients);
          console.log("Shipper:", shipper);
          console.log("Overseas:", overseas);
          console.log("Sales:", sales);
          const uniqueClients = [
            ...new Map(
              [...clients, ...shipper].map((item) => [item.id, item])
            ).values()
          ];
          console.log("Unique Clients:", uniqueClients);

          dispatch({
            type: 'set',
            payload: {
              clients: uniqueClients,
              overseas: overseas,
              salesRepresentative: sales
            }
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);   // IMPORTANT: empty dependency array

  useEffect(() => {
     
    // setting default values from Redux state when component remounts
    if (filters) {
      set({
        from: values ? values.from : '',
        to: moment().format("YYYY-MM-DD"),
        jobType: values ? values.jobType : [],
        company: values? values.company : '',
        subType: values? values.subType : [],
        salesrepresentative: values ? values.salesRepresentative : undefined,
        overseasagent: values ? values.overSeasagent : undefined,
        client: values? values.client : undefined,
        reportType: values ? values.reportType : 'viewer',
      });



    }
    else {
      set({ jobType: plainOptions }); // Automatically check all job types if no filters
    }
  }, [filters]);

  const handleChange = (event) => {
   dispatchNew(setCompany(event)) ;
  };

  return (
    <>
      <div className="base-page-layout">
        <div className="page-header">
            <h4 className='fw-7 m-0'>Job Profit & Loss</h4>
            <button className='btn-custom my-1 px-4'
          onClick={() => {
            Router.push({
              pathname: `/reports/jobPLReport/report`,
              query: {
                to: moment(to).toString(),
                from: moment(from).toString(),
                client: client,
                company: company,
                subtype:subType,
                jobtype: jobType,
                overseasagent: overSeasagent,
                salesrepresentative: salesRepresentative,
                report: reportType
              }
            });
            let url = `?to=${to}&from=${from}`;
            client? url = url + `&client=${client}`: null;
            company? url = url + `&company=${company}`: null;
            subType? url = url + `&subtype=${subType}`: null;
            jobType? url = url + `&jobtype=${jobType}`: null;
            salesRepresentative? url = url + `&salesrepresentative=${salesRepresentative}`: null;
            reportType? url = url + `&report=${reportType}`: null;
            overSeasagent? url = url + `&overseasagent=${overSeasagent}`: null;
            
            dispatchNew(incrementTab({
              "label": "Job Profit & Loss", "key": "5-4-1",
              "id": url 
            }));
          }}
          disabled={state.load}
        >
          {state.load ? <Spinner size='sm' /> : "Go"}
        </button>
        </div>
        <div className="form-card">
            <Col gutter={1} className=" mt-3">
            <div className="card-section">
            <Row gutter={16} className='form-row'>
            <Col md={4}>
            <label>From</label>
            <DatePicker 
              allowClear={false} 
              style={{width:"100%", borderRadius:"6px"}}
              className='datePicker-modern' 
              format="DD-MM-YYYY" 
              value={moment(from)} 
              onChange={(e)=>{dispatchNew(setFrom(moment(e).toString()))}}/>
          </Col>
          <Col md={4}>
            <label>To</label>
            <DatePicker 
              allowClear={false} 
              style={{width:"100%", borderRadius:"6px"}}
              className='datePicker-modern' 
              format="DD-MM-YYYY" 
              value={moment(to)} 
              onChange={(e)=>{dispatchNew(setTo(moment(e).toISOString()))}}/>
          </Col>

          <Col md={4}>
            <label>Company</label>
            <Select style={{ width: "100%" }}
             value={company} onChange={handleChange}
             className='select-modern'
             allowClear
             options={[
              {value:1,label:"Sea Net Shipping & Logistics"},
              {value:2,label:"Cargo Linkers"},
              {value:3,label:"Air Cargo Services"},
              {value:4,label:"SNS & ACS"},
            ]}
            />
          </Col>
        </Row>
        <Row gutter={16} className="form-row mt-3" >

          <Col md={4}>
            <label>Sales Representative</label>
            <Select
              showSearch
              placeholder={"Sales Representative"} 
              style={{ width: "100%" }}
              className='select-modern' 
              type={"representative"}
              options={state.salesRepresentative.map((item) => ({ value: item.id, label: item.name }))}
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              onChange={(e) => {
                dispatchNew(setSalesRepresentative(e));
              }}
            />
            {/* <Search 
            getChild={(value) => dispatchNew(setSalesRepresentative(value))}
            allowSearch
            placeholder={"Search"} 
            style={{ width: "100%" }}
            // className='select-modern' 
            type={"representative"} /> */}
          </Col>
        
          <Col md={4}>
            <label>Overseas Agent</label>
            <Select
              showSearch
            placeholder={"Overseas Agent"} 
            style={{ width: "100%" }}
            className='select-modern' 
            type={"agent"}
            options={state.overseas.map((item)=> ({value: item.id, label: `(${item.code}) ${item.name}`}))}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            onChange={(e) => {
                dispatchNew(setOverSeasagent(e));
              }}
            />
            {/* <Search 
            getChild={(value) => dispatchNew(setOverSeasagent(value))}
            placeholder={"Search"} 
            allowSearch
            // className='select-modern'
            style={{ width: "100%" }} 
            type={"agent"} /> */}
          </Col>
        
          <Col md={4}>
            <label>Client</label>
            <Select
            showSearch
            placeholder={"Client"} 
            style={{ width: "100%" }}
            className='select-modern' 
            options={state.clients.map((item)=> ({value: item.id, label: `(${item.code}) ${item.name}`}))}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            onChange={(e) => {
                dispatchNew(setClient(e));
              }}
            />
            {/* <AdvanceSearch 
            getChild={(value) => dispatchNew(setClient(value))}
            placeholder={"Search"} 
            allowSearch
            value={client} 
            style={{ width: "100%" }} 
            type={"client"} /> */}
          </Col>
          
        </Row>
        </div></Col>
        
       <Row className="mt-3">
          <Col md={3}>
            <div className="card-section">
            <h5 className="form-label">Report Types</h5>
            <Radio.Group onChange={(e) => dispatchNew(setReportType(e.target.value))} value={reportType}>
              <Radio value={"viewer"}>Viewer</Radio>
              <Radio value={"grid"}>Grid</Radio>
            </Radio.Group>
            </div>
          </Col>

          <Col md={6}>
          <div className="card-section">
            <h5>Job Types</h5>
            <Checkbox.Group options={plainOptions} value={jobType} onChange={(e) => dispatchNew(setJobType(e))} />
              </div>
          </Col>
          <Col md={3}>
          <div className="card-section">
            <h5>Sub Types</h5>
            <Checkbox.Group options={typeOptions} value={subType} onChange={(e) => dispatchNew(setSubType(e)) } />
              </div>
          </Col>
        </Row>
        
      </div>
      <Modal title={"Job Profit & Loss Report"}
        open={state.visible}
        onOk={() => set({ visible: false })}
        onCancel={() => set({ visible: false })}
        footer={false} maskClosable={false}
        width={'100%'}
      >
        {state.records.length > 0 && <Sheet state={state} />}
      </Modal>
      </div>
    </>
  )
}

export default JobPL