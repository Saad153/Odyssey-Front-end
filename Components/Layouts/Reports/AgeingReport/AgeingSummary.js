import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Summary = ({ query, result }) => {

  const [ records, setRecords ] = useState([]);

  const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
  console.log("summary query:", query)
  console.log("summary result:", result)

useEffect(() => {
  if (!result || !Array.isArray(result.temp)) {
    setRecords([]);
    return;
  }

  // Helper: safe number
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Helper: balance sign
  // If it's receivable, balance is positive (amount owed to you).
  // If it's payable (Payble in your DB), invert to show as negative (amount you owe).
  const signedBalance = (inv) => {
    const total = num(inv.total);
    const paid = num(inv.paid);
    const received = num(inv.recieved);
    let bal = total - paid - received;
    // Your data uses 'Payble' / 'Recievable'
    if ((inv.payType || "").toLowerCase() === "payble") {
      bal = bal * -1;
    }
    return bal;
  };

  // Helper: choose date for ageing (updatedAt in your example; you can switch to dueDate/invoiceDate)
  const daysOld = (inv, asOf = moment()) => {
    const date = moment(inv.updatedAt);
    if (!date.isValid()) return 0;
    return asOf.diff(date, "days");
  };

  // Grouping map: key = `${AccountCode}||${Currency}`
  // Each value accumulates the buckets + identity fields
  const map = new Map();

  // Optional: allow “as of” date if you later add it (today by default)
  const asOf = moment();

  // result.temp is: [{ partyName, invoices: [...] }]
  for (const party of result.temp) {
    const partyName = party.partyName ?? "";
    // You might also have partyCode in your enriched payload:
    // If not there, you can derive from invoices if consistent.
    for (const inv of (party.invoices || [])) {
      const currency = inv.currency || "PKR";
      const accountCode = inv.partyCode || "";
      const accountTitle = inv.partyName || partyName || "(Unknown)";

      const key = `${accountCode}||${currency}`;
      if (!map.has(key)) {
        map.set(key, {
          AccountCode: accountCode,
          AccountTitle: accountTitle,
          Currency: currency,
          Current: 0,
          oneThirty: 0,   // 1–30
          tOneSixty: 0,   // 31–60
          sOneNinety: 0,  // 61–90
          nOneTwenty: 0,  // 91–120
          overTwenty: 0,  // 121+
          // Optionally keep a raw list of invoices in this group
          // invoices: [],
        });
      }
      

      const grp = map.get(key);
      const bal = signedBalance(inv);
      const d = daysOld(inv, asOf);

      if (d === 0) {
        grp.Current += bal;
      } else if (d >= 1 && d <= 30) {
        grp.oneThirty += bal;
      } else if (d >= 31 && d <= 60) {
        grp.tOneSixty += bal;
      } else if (d >= 61 && d <= 90) {
        grp.sOneNinety += bal;
      } else if (d >= 91 && d <= 120) {
        grp.nOneTwenty += bal;
      } else {
        grp.overTwenty += bal;
      }

      // If you want to keep the invoices per (account, currency), uncomment:
      // grp.invoices.push(inv);
    }
  }

  // Final array + computed total
  const temp = Array.from(map.values()).map((row) => ({
    ...row,
    total:
      row.Current +
      row.oneThirty +
      row.tOneSixty +
      row.sOneNinety +
      row.nOneTwenty +
      row.overTwenty,
  }));

  // Optional: sort by AccountTitle then Currency
  temp.sort((a, b) =>
    a.AccountTitle.localeCompare(b.AccountTitle) || a.Currency.localeCompare(b.Currency)
  );

  setRecords(temp);
}, [result]);
  
  return (                          
    <>
          <PrintTopHeader company={query.company} query={query} from={query.from} to={query.to} /> 
        
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
        Ageing Summary
      </span>
    </div>
      </div>
      
                <Row style={{  marginTop: '15px', justifyContent: 'right' }}>
                
                  <Col md={4}>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly  ' }}>
                      <span style={{ fontWeight: 'bold' }}>As On :</span>
                      <span style={{ borderBottom: '1px solid #3f0202', minWidth: '120px', marginLeft: '10px' }}>{query.from}</span>
                    </div>
                  </Col>
                </Row>

     
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {"Receivable"}
            </th>
          </tr>
          <tr>
            {[
              "A/C Code",
              "A/C Title",
              "Curr",
              "Settlement",
              "Current Invoice",
              "1-30 Days",
              "31-60 Days",
              "61-90 Days",
              "91-120 Days",
              "Over 120 Days",
              "Total",
            ].map((head) => (
              <th
                key={head}
                style={{
                  border: "1px solid #000",
                  padding: "6px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>

        <tbody  style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
              }}>
          {/* Sample Row */}
          {records.map((record) => (
            <tr key={record.AccountCode}>
              <td>{record.AccountCode}</td>
              <td>{record.AccountTitle}</td>
              <td>{record.Currency}</td>
              <td>{record.AccountTitle}</td>
              <td>{record.Current}</td>
              <td>{record.oneThirty}</td>
              <td>{record.tOneSixty}</td>
              <td>{record.sOneNinety}</td>
              <td>{record.nOneTwenty}</td>
              <td>{record.overTwenty}</td>
              <td>{record.total}</td>
            </tr>
          ))}

      
        </tbody>
      </table>

    
   </>
     );
   };
   
   export default React.memo(Summary);