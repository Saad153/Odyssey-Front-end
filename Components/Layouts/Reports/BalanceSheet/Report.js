import React, { useEffect, useState } from 'react';
import axiosClient from 'apis/axiosClient';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Select, Radio, Modal } from 'antd';
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

const Report = () => {

  const [company, setCompany] = useState(1);
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [assets, setAssets] = useState([{ total:0.00, children:[{}] }]);
  const [liabilities, setLiabilities] = useState([{ total:0.00, children:[{}] }]);
  const [capital, setCapital] = useState([{ total:0.00, children:[{}] }]);
  const [drawings, setDrawings] = useState([{ total:0.00, children:[{}] }]);
  const [earnings, setEarnings] = useState(0.00);
  const [effect, setEffect] = useState(0.00);
  const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ")}
  async function handleSubmit(){
    setLoad(true);
    await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL+"/accounts/balanceSheetOld",{
      headers:{
        companyid:company
      }
    })
    .then((x)=>{
      console.log("Balance Sheet", x.data)
      setAccounts(x.data.result.accounts);
    })
    setLoad(false);
    setVisible(true);
  }
  const lineHeight = 1.1;

  useEffect(()=>{
    handleSubmit()
  }, [])

  const exportToExcel = () => {
  if (!accounts || accounts.length === 0) return;

  const sheetData = [];

  // Recursively flatten accounts into rows for Excel
  const pushRows = (account, level = 0) => {
    if (!account.total || account.total === 0) return; // skip zero balances

    const indent = "    ".repeat(level);

    const isLeaf = !account.children || account.children.length === 0;

    // Push the main row
    sheetData.push({
      Account: indent + account.title,
      Amount: account.total,
    });

    // Children
    if (!isLeaf) {
      account.children.forEach(child => pushRows(child, level + 1));

      // Total row after children
      sheetData.push({
        Account: indent + "  Total for " + account.title,
        Amount: account.total,
      });
    }
  };

  // Apply recursive push to each root category
  accounts.forEach(acc => pushRows(acc));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sheetData);

  // Format numeric column
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    const cellRef = XLSX.utils.encode_cell({ r: R, c: 1 }); // Amount col = index 1
    if (worksheet[cellRef]) {
      worksheet[cellRef].t = "n"; // number type
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Balance Sheet");

  // Download file
  XLSX.writeFile(workbook, `BalanceSheet_${Date.now()}.xlsx`);
};

  // Calculate total recursively
const calculateTotals = (account) => {
  let total = (account.Voucher_Heads || []).reduce((sum, vh) => {
    return vh.type === "debit"
      ? sum + Number(vh.defaultAmount || 0)
      : sum - Number(vh.defaultAmount || 0);
  }, 0);

  if (account.children && account.children.length > 0) {
    const childrenTotal = account.children.reduce(
      (sum, child) => sum + calculateTotals(child),
      0
    );
    total += childrenTotal;
  }

  account.total = total; // store total for rendering
  return total;
};

// Recursive row renderer (skip accounts with 0 total)
const renderAccountRows = (account, level = 0) => {
  if (!account.total || account.total === 0) return []; // skip zero balances

  const rows = [];
  const isLeaf = !account.children || account.children.length === 0;

  // Render the account row itself
  rows.push(
    <tr key={account.id}>
      <td style={{ paddingLeft: `${level * 20}px`, fontWeight: isLeaf ? "normal" : "bold" }}>
        {account.title}
      </td>
      <td style={{ textAlign: "right" }}>
        {account.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );

  // Render children recursively
  if (!isLeaf) {
    account.children.forEach(child => {
      rows.push(...renderAccountRows(child, level + 1));
    });

    // Render total row for this parent (after all children)
    rows.push(
      <tr key={`${account.id}-total`}>
        <td style={{ paddingLeft: `${(level + 1) * 20}px`, fontStyle: "italic", fontWeight: "bold"  }}>
          Total for {account.title}
        </td>
        <td style={{ textAlign: "right", fontStyle: "italic", borderTop: "2px solid #000" }}>
          {account.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    );
  }

  return rows;
};

const BalanceSheet = ({ accounts }) => {
  // Calculate totals for all roots
  accounts.forEach(calculateTotals);

  // Only include accounts with active balance
  const activeAccounts = accounts.filter(account => account.total && account.total !== 0);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Account</th>
          <th style={{ textAlign: "right" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {activeAccounts.flatMap(account => renderAccountRows(account))}
      </tbody>
    </table>
  );
};

  return (
  <div className='base-page-layout p-4'>
    <Row>
      <h4 className='fw-7'>Balance Sheet</h4>
      <button onClick={exportToExcel} className="text-black btn btn-light border mt-2">
        Export Balance Sheet to Excel
      </button>
    </Row>
    <hr/>
    <BalanceSheet accounts={accounts.slice(0, 3)} />
    {load && <div style={{textAlign:"center", paddingTop:'30%'}}><Spinner /></div>}
  </div>
  )
}

export default Report