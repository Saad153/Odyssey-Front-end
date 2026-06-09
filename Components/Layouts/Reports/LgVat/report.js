import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const LGReport = ({ query, result }) => { 
    const router = useRouter();
    const [ records, setRecords ] = useState([]);


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
                LG VAT
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
            <div className="table-box">
              <div className="table-scroll">
                <table className="summary">
                  <thead className="sticky-header">
                  <tr>
                    <th class="col-sno">S #</th>
                    <th class="col-ntn">NTN</th>
                    <th class="col-cnic">CNIC</th>
                    <th class="col-buyer">Buyer</th>
                    <th class="col-ntnname">NTNName</th>
                    <th class="col-dist">District</th>
                    <th class="col-buyerType">BuyerType</th>
                    <th class="col-docType">DocumentType</th>
                    <th class="col-docNo">DocumentNo</th>
                    <th class="col-docData">DocumentData</th>
                    <th class="col-hsc">HSCode</th>
                    <th class="col-sType">SaleType</th>
                    <th class="col-rate">Rate</th>
                    <th class="col-valSales">ValueofSalesExcludingSalesTax</th>
                    <th class="col-saleTax">SalesTaxInvolved</th>
                    <th class="col-stw">STWithheldatSource</th>
                    <th class="col-total">Total</th>
                    <th class="col-shipName">ShipperName</th>
                    <th class="col-jNo">JobNumber</th>
                    <th class="col-polName">POLName</th>
                    <th class="col-podName">PODName</th>
                    <th class="col-jobRef">JobRefNo</th>
                    <th class="col-invTitle">InvoiceTitle</th>
                    <th class="col-type">Type</th>
                    <th class="col-salSupp">SaleOriginationProvinceofSupplier</th>
                    <th class="col-docType">DocumentType</th>
                    <th class="col-quantity">Quantity</th>
                    <th class="col-uom">UOM</th>
                    <th class="col-sro">SRONo</th>
                    <th class="col-item">ItemSNo</th>
                    <th class="col-gdNo">GDNumber</th>
                    <th class="col-invNo">InvoiceNo</th>
                    <th class="col-custName">CustomerName</th>
                    <th class="col-revShare">RevenueShareAmount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {result.result.map((r, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{r.ntn}</td>
                      <td>{r.cnic}</td>
                      <td>{r.buyer}</td>
                      <td>{r.ntnname}</td>
                      <td>{r.dist}</td>
                      <td>{r.buyerType}</td>
                      <td>{r.docType}</td>
                      <td>{r.docNo}</td>
                      <td>{r.docData}</td>
                      <td>{r.hsc}</td>
                      <td>{r.sType}</td>
                      <td>{r.rate}</td>
                      <td>{r.valSales}</td>
                      <td>{r.saleTax}</td>
                      <td>{r.stw}</td>
                      <td>{r.total}</td>
                      <td>{r.shipName}</td>
                      <td>{r.jNo}</td>
                      <td>{r.polName}</td>
                      <td>{r.podName}</td>
                      <td>{r.jobRef}</td>
                      <td>{r.invTitle}</td>
                      <td>{r.type}</td>
                      <td>{r.salSupp}</td>
                      <td>{r.docType}</td>
                      <td>{r.quantity}</td>
                      <td>{r.uom}</td>
                      <td>{r.sro}</td>
                      <td>{r.item}</td>
                      <td>{r.gdNo}</td>
                      <td>{r.invNo}</td>
                      <td>{r.custName}</td>
                      <td>{r.revShare}</td> 
                    </tr>
                  ))}*/}
                </tbody>
                {/* <tbody>
                  {currentRecords.map((r, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{moment(r.createdAt).format('DD-MM-YYYY')}</td>
                      <td>{r.Employee?.name}</td>
                      <td>{r.formName}</td>
                      <td>{r.type}</td>
                      <td>{r.docNo}</td>
                      {/* <td>{r.remarks}</td> 
                    </tr>
                  ))}
                  
                </tbody> */}
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

export default LGReport;