import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col, Form } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";


const AuditReport = ({ query, result }) => { 
  console.log("Result:", result.result)
    const router = useRouter();
    const [ records, setRecords ] = useState([]);

    useEffect(() => {
  if (result && Array.isArray(result.result)) {
    setRecords(result.result);
    return;
  }
  setRecords(result.temp);
}, [result]);
const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

    const [currentPage,setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(30);
    const indexOfLast = currentPage * recordsPerPage ;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
    const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;
    const groupedRecords = currentRecords.reduce((acc, item) => {
    const group = item.groupName || "OTHERS";

    if (!acc[group]) acc[group] = [];
  acc[group].push(item);

  return acc;
}, {});
    return (
        <>  
            <PrintTopHeader company={query.company} query={query} from={moment(query.from).format('DD-MM-YYYY')} to={moment(query.to).format('DD-MM-YYYY')} /> 
                
            <div className="report-header" style={{ marginTop: '20px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div style={{
                borderTop: '3px solid #000'
            }} />
            
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '0 14px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                Audit Log Report
              </span>
            </div>
              </div>
              
            <Row style={{  marginTop: '15px', justifyContent: 'right' }}>
            
                <Col md={4}>  
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 'bold' }}>As On :</span>
                    <span style={{ borderBottom: '1px solid #3f0202', minWidth: '150px', marginLeft: '10px', textAlign: 'center' }}>{moment(query.to).format('DD-MM-YYYY')}</span>
                </div>
                </Col>
            </Row>
            <div>
            {/* <div class="audit-container" style={{marginTop: '10px'}}>
              <table class="audit-table" style={{overflow: 'auto'}}>
                <thead>
                  <tr>
                    <th class="col-sno">S #</th>
                    <th class="col-datetime">Date Time</th>
                    <th class="col-user">User Log</th>
                    <th class="col-form">Form</th>
                    <th class="col-action">Action</th>
                    <th class="col-doc">Doc #</th>
                    {/* <th class="col-remarks">Remarks</th> 
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((r, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{moment(r.createdAt).format('DD-MM-YYYY')}</td>
                      <td>{r.Employee?.name}</td>
                      <td>{r.formName}</td>
                      <td>{r.type}</td>
                      <td>{r.docNo}</td>
                       <td>{r.remarks}</td> 
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}

            <div className="table-box">
                      <div className="table-scroll">
                        <table className="summary">
                          <thead className="sticky-header">
                            <tr>
                              <th rowSpan={2}>S #</th>
                              <th rowSpan={2} style={{ textAlign: "left" }}>Date Time</th>
                              <th rowSpan={5}>User Log</th>
                              <th colSpan={6} style={{ textAlign: "center" }}>Audit</th>
                              {/* <th rowSpan={2}>Total</th> */}
                            </tr>
            
                            <tr>
                              <th>Form</th>
                              <th>Action</th>
                              <th>Doc #</th>
                          
                            </tr>
                          </thead>
            
                        <tbody>
                          {Object.entries(groupedRecords).map(([groupName, groupRows]) => (
                            <React.Fragment key={groupName}>
                              
                              {/* GROUP HEADER ROW */}
                              <tr className="group-row">
                                <td colSpan={15} className="group-title">
                                  
                                </td>
                              </tr>
                              {groupRows.map((r, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td className="cell-code">{moment(r.createdAt).format('DD-MM-YYYY')}</td>
                                  <td className="cell-title indent">
                                    {r.Employee?.name}
                                  </td>
                                  <td className="cell-center">{r.formName}</td>
                                  <td className="cell-num">{r.type}</td>
                                  <td className="cell-center">{r.docNo}</td>
                                  
                                  
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                  </table>
                  </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
            </div>
            </>
    );
};

export default AuditReport;