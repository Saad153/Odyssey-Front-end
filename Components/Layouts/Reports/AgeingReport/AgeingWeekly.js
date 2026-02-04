import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";

const Weekly = ({ query, result }) => {


  const [ records, setRecords ] = useState([]);
  
    const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
    console.log("weekly query:", query)
    console.log("weekly result:", result)
  
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
            oneSeven: 0,   // 1–30
            eightForteen: 0,   // 31–60
            fTwentyOne: 0,  // 61–90
            tTwentyEight: 0,  // 91–120
            tThirtyFive: 0,
            aThirtyFive:0,  // 121+
            // Optionally keep a raw list of invoices in this group
            // invoices: [],
          });
        }
  
        const grp = map.get(key);
        const bal = signedBalance(inv);
        const d = daysOld(inv, asOf);
  
        if (d === 0) {
          grp.Current += bal;
        } else if (d >= 1 && d <= 7) {
          grp.oneSeven += bal;
        } else if (d >= 8 && d <= 14) {
          grp.eightForteen += bal;
        } else if (d >= 15 && d <= 21) {
          grp.fTwentyOne += bal;
        } else if (d >= 22 && d <= 28) {
          grp.tTwentyEight += bal;
        } else if (d >= 29 && d <= 35) {
          grp.tThirtyFive += bal;
        }else {
          grp.aThirtyFive += bal;
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
        row.oneSeven +
        row.eightForteen +
        row.fTwentyOne +
        row.tTwentyEight +
        row.tThirtyFive +
        row.aThirtyFive,
    }));
  
    // Optional: sort by AccountTitle then Currency
    temp.sort((a, b) =>
      a.AccountTitle.localeCompare(b.AccountTitle) || a.Currency.localeCompare(b.Currency)
    );
  
    setRecords(temp);
  }, [result]);
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
                                      <span style={{ borderBottom: '1px solid #000', minWidth: '120px', marginLeft: '10px' }}>{query.from}</span>
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
          
          {records.map((record) => (
            <tr key={record.AccountCode}>
              <td>{record.AccountCode}</td>
              <td>{record.AccountTitle}</td>
              <td>{record.Currency}</td>
              <td>{record.AccountTitle}</td>
              <td>{record.Current}</td>
              <td>{record.oneSeven}</td>
              <td>{record.eightForteen}</td>
              <td>{record.fTwentyOne}</td>
              <td>{record.tTwentyEight}</td>
              <td>{record.tThirtyFive}</td>
              <td>{record.aThirtyFive}</td>
              <td>{record.total}</td>
            </tr>
          ))}

          {/* <tr>
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
          </tr> */}

         
        </tbody>
      </table>
    </div>


            </>
        );
    
       };
       
       export default React.memo(Weekly);