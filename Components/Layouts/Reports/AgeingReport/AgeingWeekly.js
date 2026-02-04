import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";

const Weekly = ({ query, result }) => {
        return(
            <>
                <PrintTopHeader company={query.company} query={query} /> 
                        
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
                        Ageing Weekly
                      </span>
                    </div>
                      </div>
                      
                                <Row style={{  marginTop: '15px', justifyContent: 'right' }}>
                                
                                  <Col md={4}>
                                    <div style={{ display: 'flex', justifyContent: 'space-evenly  ' }}>
                                      <span style={{ fontWeight: 'bold' }}>As On :</span>
                                      <span style={{ borderBottom: '1px solid #000', minWidth: '120px', marginLeft: '10px' }}>30-06-2026</span>
                                    </div>
                                  </Col>
                                </Row>
                            
    <div style={{ marginTop: "20px" }}>
      
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr>
            {[
              "A/C Code",
              "A/C Title",
              "Curr",
              "Settlement",
              "Current Inv",
              "1-7 Days",
              "8-14 Days",
              "15-21 Days",
              "22-28 Days",
              "29-35 Days",
              "Above Thirtyfive",
              "Total",
            ].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #000",
                  padding: "6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  background: "#d9d9d9",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          
          <tr>
            <td >P100</td>
            <td >MEHRAN MARBLE INDUSTRIES.</td>
            <td >PKR</td>
            <td >3,594,346.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>3,594,346.00</td>
          </tr>

          <tr>
            <td>P1005</td>
            <td >QUICE FOOD INDUSTRIES LIMITED</td>
            <td >PKR</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>1,681,478.00</td>
            <td>1,681,478.00</td>
          </tr>

         
        </tbody>
      </table>
    </div>


            </>
        );
    
       };
       
       export default React.memo(Weekly);