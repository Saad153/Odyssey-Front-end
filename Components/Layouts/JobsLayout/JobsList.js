import { addValues } from 'redux/persistValues/persistValuesSlice';
import { useSelector, useDispatch } from 'react-redux';
import { incrementTab } from 'redux/tabs/tabSlice';
import React, { useEffect, useState } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import Router from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import Pagination from '../../Shared/Pagination';
import { Input } from 'antd';
import moment from 'moment';
// import JobsBackupData from './Backup/BackupModal';
import { delay } from "functions/delay"
import axiosClient from 'apis/axiosClient';
import axiosInstance from 'apis/axiosClient';
import Cookies from 'js-cookie';

const SEJobList = ({ jobsData, sessionData, type }) => {
  const queryClient = useQueryClient();
  const changedValues = useSelector((state) => state.persistValues);
  const companyId = useSelector((state) => state.company.value);
  const dispatch = useDispatch();
  const [isOpen,setIsOpen] = useState(false);

  

const [jobs, setJobs] = useState([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [loading, setLoading] = useState(false);

const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");


useEffect(() => {
  const t = setTimeout(() => {
    setSearch(searchInput);
    setPage(1);
  }, 500);

  return () => clearTimeout(t);
}, [searchInput]);

const fetchJobs = async (pageNo = 1) => {
  if (loading) return;
  setLoading(true);
  try {
    const res = await axiosInstance.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_SEAJOB, {
      params:{ companyid: `${Cookies.get('companyId')}`, operation: type, page: pageNo, limit: 20, search }
    })
    // console.log("Jobs fetched: ", res.data);
    setJobs(res.data.result);
    setTotalPages(res.data.totalPages);
    setPage(pageNo);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchJobs(1);
}, []);

useEffect(() => {
  fetchJobs(1);
}, [search]);

useEffect(() => {
  fetchJobs(page);
}, [page]);

  return (
    <>
      {companyId != '' &&
        <div className='base-page-layout'>
          <Row>
            <Col md={4}>
              <h5>
                {type == "SE" ? "SEA Export" : type == "SI" ? "SEA Import" : type == "AE" ? "AIR Export" : type == "AI" ? "AIR Import" : ""} Job List
              </h5>
            </Col>
            <Col md={4}>
              <Input
                placeholder="Enter client, weight or Job No"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </Col>
            <Col md={2} className='text-end'>
            </Col>
            <Col md={1}>
            </Col>
            <Col md={1}>
              <button className='btn-custom left'
                onClick={() => {
                  queryClient.removeQueries({ queryKey: ['jobData', { type }] })
                  let obj = { ...changedValues.value }
                  obj[type] = ""
                  dispatch(addValues(obj));
                  dispatch(incrementTab({
                    "label": type == "SE" ? "SE JOB" : type == "SI" ? "SI JOB" : type == "AE" ? "AE JOB" : "AI JOB",
                    "key": type == "SE" ? "4-3" : type == "SI" ? "4-6" : type == "AE" ? "7-2" : "7-5",
                    "id": "new"
                  }));
                  Router.push(
                    type == "SE" ? `/seaJobs/export/new` :
                      type == "SI" ? `/seaJobs/import/new` :
                        type == "AE" ? `/airJobs/export/new` :
                          `/airJobs/import/new`
                  )
                }}
              >Create</button>
            </Col>
          </Row>
          <hr className='my-2' />
          <div className='mt-3' style={{ maxHeight: "63vh", overflowY: 'auto' }}>
            <Table className='tableFixHead'>
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Basic Info</th>
                  <th>Shipment Info</th>
                  <th>Weight Info</th>
                  <th>Other Info</th>
                  <th>Status</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {
                  jobs?.map((x, index) => {
                    return (
                      <tr key={index} className='f row-hov'
                        onClick={() => {
                          queryClient.removeQueries({ queryKey: ['jobData', { type }] })
                          let obj = { ...changedValues.value }
                          obj[type] = ""
                          dispatch(addValues(obj));
                          dispatch(incrementTab({
                            "label": type == "SE" ? "SE JOB" : type == "SI" ? "SI JOB" : type == "AE" ? "AE JOB" : "AI JOB",
                            "key": type == "SE" ? "4-3" : type == "SI" ? "4-6" : type == "AE" ? "7-2" : "7-5",
                            "id": x.id
                          }))
                          Router.push(
                            type == "SE" ? `/seaJobs/export/${x.id}` :
                              type == "SI" ? `/seaJobs/import/${x.id}` :
                                type == "AE" ? `/airJobs/export/${x.id}` :
                                  `/airJobs/import/${x.id}`
                          )
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <span className='blue-txt fw-7'>{x.jobNo}</span>
                          <br />{(type=="SE"||type=="SI")?'HBL:':'AWBL'} <span className='blue-txt'>{x?.Bl?.hbl}</span>
                          <br />{(type=="SE"||type=="SI")?'MBL:':'MWBL'}<span className='blue-txt'>{x?.Bl?.mbl}</span>
                          <br />Nomination: <span className='grey-txt'>{x.nomination}</span>
                          <br />Freight Type: <span className='grey-txt'>{x.freightType}</span>
                        </td>
                        <td>
                          POL: <span className='grey-txt'>{x.pol}</span><br />
                          POD: <span className='grey-txt'>{x.pod}</span><br />
                          FLD: <span className='grey-txt'> {x.fd}</span>
                        </td>
                        <td>
                          {/* Container: <span className='grey-txt'>{x.container}</span><br/> */}
                          Weight: <span className='grey-txt'>{x.weight}</span>
                        </td>
                        <td>
                          Party:<span className='blue-txt fw-5'> {x.Client === null ? "" : x.Client.name}</span><br />
                          Transportion: <span className='blue-txt fw-5'>{x.transportCheck != '' ? 'Yes' : 'No'}</span>
                          <br />
                          Custom Clearance: <span className='blue-txt fw-5'>{x.customCheck != '' ? 'Yes' : 'No'}</span>
                        </td>
                        <td>
                        { x.approved === 'true' ? (
                            x.iLength > 0 || x.bLength > 0 ? (
                              <>
                                <img src='/approve.png' height={70} />
                              </>
                            ) : (
                              <span>Approved, Invoices pending</span>
                            )
                          ) : (
                            <span>Not Approved</span>
                          )
                        }
                        </td>
                        <td>
                          <span className='blue-txt fw-6'>
                            {x.created_by?.name}
                          </span>
                          <br/>
                          Created at:{" "} 
                          <span className='grey-txt '>
                            {x.createdAt ? moment(x.createdAt).format("DD-MM-YY") : "-"}
                          </span>
                          <br/>
                          Invoices:{" "} 
                          <span className='grey-txt '>
                            {x.iLength ? x.iLength : "0"}
                          </span>
                          <br/>
                          Bills:{" "} 
                          <span className='grey-txt '>
                            {x.bLength ? x.bLength : "0"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </Table>
          </div>
          <div className='d-flex justify-content-end items-end mt-4'style={{maxWidth:"100%"}} >
            <Pagination noOfPages={totalPages} currentPage={page} setCurrentPage={setPage}/>
          </div>
        </div>
      }
    </>
  )
}

export default SEJobList;
