import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";

const Report = ({ query, result }) => {
  
console.log("Ageing Result", result)
const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

useEffect(() => {
  const temp = []
  console.log("Ageing Result:", result)

  
  console.log("Temp:", temp)
}, [result])

  // main render
  return (
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
        Ageing Detail Report
      </span>
    </div>

        
        
          <Row style={{ marginBottom: '10px', marginTop: '15px' }}>
            <Col md={4}>
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <span style={{ fontWeight: 'bold' }}>Account Code :</span>
                <span style={{ borderBottom: '1px solid #000', minWidth: '150px', marginLeft: '10px' }}>P100</span>
              </div>
            </Col>
            <Col md={4}>
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <span style={{ fontWeight: 'bold' }}>Account Title :</span>
                <span style={{ borderBottom: '1px solid #000', minWidth: '200px', marginLeft: '10px' }}>MEHRAN MARBLE INDUSTRIES.</span>
              </div>
            </Col>
            <Col md={4}>
              <div style={{ display: 'flex', justifyContent: 'space-evenly  ' }}>
                <span style={{ fontWeight: 'bold' }}>As On :</span>
                <span style={{ borderBottom: '1px solid #000', minWidth: '120px', marginLeft: '10px' }}>30-06-2026</span>
              </div>
            </Col>
          </Row>
        </div>

      <div className="report-table" style={{ marginTop: '30px' }}>
            <Table bordered
        pagination={false}
        style={{
          width: '100%',
          fontSize: '12px',
          fontWeight: 'bold',
          border: '2px solid #000'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#9a9a9a', borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'center', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Due Date</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Voucher No</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Code</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Invoice No</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Particular</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Cur</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Receivable</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Received</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Balance</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>D.Day</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px' }}>30-06-2022</td>
              <td style={{ padding: '8px' }}>30-06-2022</td>
              <td style={{ padding: '8px' }}>SNS-OP-0017/23</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>SN</td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px', textAlign: 'center' }}>PKR</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>5,026,727.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>0.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>5,026,727.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>1313</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>30-06-2022</td>
              <td style={{ padding: '8px' }}>30-06-2022</td>
              <td style={{ padding: '8px' }}>SNS-OP-0017/23</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>SN</td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px', textAlign: 'center' }}>PKR</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>840,104.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>0.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>840,104.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>1313</td>
            </tr>
           
            <tr>
              <td style={{ padding: '8px' }}>03-09-2024</td>
              <td style={{ padding: '8px' }}>03-09-2024</td>
              <td style={{ padding: '8px' }}>SNS-BRV-0012/25</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>SN</td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}>
                CHEQUE RECEIVED FROM MEHRAN MARBLE{'\n'}
                CARGO LINKERS 312.852/- + SEANET 14.87; 148-TOTAL 1800.000/-
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>PKR</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>(2,136,726.00)</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>0.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>(2,136,726.00)</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>517</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>24-10-2024</td>
              <td style={{ padding: '8px' }}>24-10-2024</td>
              <td style={{ padding: '8px' }}>SNS-BRV-0022/25</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>SN</td>
              <td style={{ padding: '8px' }}></td>
              <td style={{ padding: '8px' }}>CHEQUE RECEIVED FROM MEHRAN MARBLE 23.00.000/-. SNSL (1,867,753) Cargo Linkers (412,247)</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>PKR</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>(135,759.00)</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>0.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>(135,759.00)</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>466</td>
            </tr>
            <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <td colSpan="6" style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>PKR</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>3,594,346.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>0.00</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>3,594,346.00</td>
              <td style={{ padding: '8px' }}></td>
            </tr>
          </tbody>
        </Table>
      </div>
      {/* <div className="report-table income-statement-report" style={{fontSize: "14px"}}>
        <div style={{ fontWeight: "bold" }}>Revenue</div>
        {revenue.length > 0 ? revenue.map(account => (
          <Row key={account.id} style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
            <div className="account-title">{account.title}</div>
            <div style={{ float: 'right' }} className="account-amount">{commas(Math.abs(account.total))}</div>
          </Row>
        )) : <div>No Revenue Data</div>}
        <Row style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
          <div style={{ fontWeight: "bold" }} className="account-title">Total for Revenue</div>
          <div style={{ float: 'right', fontWeight: "bold" }} className="account-amount">{commas(Math.abs(revenueTotal))}</div>
        </Row>
        <div style={{ fontWeight: "bold", marginTop: '15px' }}>COGS / Selling Expense</div>
        {expense.length > 0 ? expense.map(account => (
          <Row key={account.id} style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
            <div className="account-title">{account.title}</div>
            <div style={{ float: 'right' }} className="account-amount">{commas(Math.abs(account.total))}</div>
          </Row>
        )) : <div>No Expense Data</div>}
        <Row style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
          <div style={{ fontWeight: "bold" }} className="account-title">Total for COGS / Selling Expense</div>
          <div style={{ float: 'right', fontWeight: "bold" }} className="account-amount">{commas(Math.abs(expenseTotal))}</div>
        </Row>
        <Row style={{ marginTop: '15px' }} className="report-row w-100 d-flex justify-content-between">
          <div style={{ fontWeight: "bold" }} className="account-title">Gross Profit</div>
          <div style={{ float: 'right', fontWeight: "bold" }} className="account-amount">{commas(Math.abs(revenueTotal) - Math.abs(expenseTotal))}</div>
        </Row>
        <div style={{ fontWeight: "bold", marginTop: '15px' }}>Admin Expense</div>
        {admin.length > 0 ? admin.map(account => (
          <Row key={account.id} style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
            <div className="account-title">{account.title}</div>
            <div style={{ float: 'right' }} className="account-amount">{commas(Math.abs(account.total))}</div>
          </Row>
        )) : <div>No Admin Data</div>}
        <Row style={{ marginTop: '5px' }} className="report-row w-100 d-flex justify-content-between">
          <div style={{ fontWeight: "bold" }} className="account-title">Total for Admin Expense</div>
          <div style={{ float: 'right', fontWeight: "bold" }} className="account-amount">{commas(Math.abs(adminTotal))}</div>
        </Row>
        <Row style={{ marginTop: '15px' }} className="report-row w-100 d-flex justify-content-between">
          <div style={{ fontWeight: "bold" }} className="account-title">Profit/(Loss)</div>
          <div style={{ float: 'right', fontWeight: "bold" }} className="account-amount">{commas((Math.abs(revenueTotal) - Math.abs(expenseTotal)) - Math.abs(adminTotal))}</div>
        </Row>
        
      </div> */}
    </>
  );
};

export default React.memo(Report);
