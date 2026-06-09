import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table } from "react-bootstrap";
import Pagination from "Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { Row } from "antd";

const Report = ({ query, result }) => {
  const report = query?.reportType;
  const accountlevel = query?.accountLevel;
  const [ revenue, setRevenue ] = useState([]);
  const [ revenueTotal, setRevenueTotal ] = useState(0);
  const [ expense, setExpense ] = useState([]);
  const [ expenseTotal, setExpenseTotal ] = useState(0);
  const [ admin, setAdmin ] = useState([]);
  const [ adminTotal, setAdminTotal ] = useState(0);

  useEffect(() => {
    console.log("Income Statement", result)
    console.log("Income Statement", query)
  }, [query, result]);

  const totalVoucherDefaultAmount = async (account) => {
    let total = 0;
    account.Voucher_Heads.forEach(voucher => {
      if(voucher.type == 'debit'){
        total += parseFloat(voucher.defaultAmount || 0);
      }else{
        total -= parseFloat(voucher.defaultAmount || 0);
      }
    });
    // console.log(">>>totalVoucherDefaultAmount: ", account.title, total);
    return total;
  }

  const totalVoucherAmount = async (account) => {
    let total = 0;
    account.Voucher_Heads.forEach(voucher => {
      total += parseFloat(voucher.amount || 0);
    });
    return total;
  }

  useEffect(() => {
  async function run() {

    async function computeForRoot(root) {
      let Data = [];
      let Total = 0;

      async function processTree(account) {
        const isLeaf = account.children.length === 0;

        if (!isLeaf) {
          for (const child of account.children) {
            await processTree(child);
          }
        } else {
          account.total = await totalVoucherDefaultAmount(account);
          if (account.total !== 0) {
            Total += account.total;
            Data.push(account);
          }
        }
      }

      await processTree(root);
      return { Data, Total };
    }

    // First run
    const rev = await computeForRoot(result.result[3]);
    console.log(">>>Revenue Data:", rev.Data);
    console.log(">>>Revenue Total:", rev.Total);
    setRevenue(rev.Data);
    setRevenueTotal(rev.Total);

    // Second run
    const exp = await computeForRoot(result.result[4].children[1]);
    console.log(">>>Expense Data:", exp.Data);
    console.log(">>>Expense Total:", exp.Total);
    setExpense(exp.Data); // if you need a separate state
    setExpenseTotal(exp.Total); // if you need a separate state

    // Third run
    const filteredChildren = result.result[4].children.filter((_, index) => index !== 1);
    const adm = await computeForRoot({...result.result[4], children: filteredChildren});
    console.log(">>>Admin Data:", adm.Data);
    console.log(">>>Admin Total:", adm.Total);
    setAdmin(adm.Data); // if you need a separate state
    setAdminTotal(adm.Total); // if you need a separate state
  }

  if (result) run();
}, [result]);

const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}


  // main render
  return (
    <>
      <PrintTopHeader company={query.company} report={report} query={query} from={moment(query.from).format('DD-MM-YYYY')} to={moment(query.to).format('DD-MM-YYYY')}/>
      <div className="report-table income-statement-report" style={{fontSize: "14px"}}>
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
        
      </div>
    </>
  );
};

export default React.memo(Report);
