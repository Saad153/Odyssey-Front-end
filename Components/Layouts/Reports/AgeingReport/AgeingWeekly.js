import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import ExcelJS from "exceljs";


const Weekly = ({ query, result }) => {

  const router = useRouter();
  const hasExported = useRef(false);
  const [ records, setRecords ] = useState([]);

          useEffect(() => {
                      if (
              router.isReady &&
              router.query.autoExport === "true" &&
              records.length > 0 &&
              !hasExported.current
            ) {
              hasExported.current = true;
              exportToExcel();
            }
          }, [router.isReady, router.query, records]);
        
            const ImageToBlob = (imageUrl) => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // Enable CORS if required
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  canvas.toBlob(resolve);
                };
                img.onerror = reject;
                img.src = imageUrl;
              });
            };
          
            const exportToExcel = async () => {
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Invoice Report');
            
              worksheet.columns = [
                { header: 'A/C Code', key: 'AccountCode', width: 15 },
                { header: 'A/C Title', key: 'AccountTitle', width: 30  },
                { header: 'Curr', key: 'Currency', width: 10  },
                { header: 'Settlement', key: 0, width: 20  },
                { header: 'Current Invoice', key: 'Current', width: 20 },
                { header: '1 - 7 Days', key: 'oneSeven', width: 20  },
                { header: '8 - 14 Days', key: 'eightForteen', width: 20 },
                { header: '15 - 21 Days', key: 'fTwentyOne', width: 20  },
                { header: '22 - 28 Days', key: 'tTwentyEight', width: 20  },
                { header: '29 - 35 Days', key: 'tThirtyFive', width: 20  },
                { header: 'Above 35 Days', key: 'aThirtyFive', width: 20  },
                { header: 'Total', key: 'total', width: 20 },
              ];
          
              const headerRow = worksheet.getRow(1);
              headerRow.eachCell((cell) => {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'D3D3D3' } 
                };
                cell.border = {
                  right: { style: 'thin', color: { argb: '000000' } },
                  left: { style: 'thin', color: { argb: '000000' } },
                  top: { style: 'thin', color: { argb: '000000' } },
                  bottom: { style: 'thin', color: { argb: '000000' } },
                }
                cell.font = {
                  size: 14,
                  bold: true,
                };
              
                cell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle'
                };
              });
              // console.log(records)
              const data = records.map((x, i) => ({
                
                AccountCode: x.AccountCode,
                AccountTitle: x.AccountTitle,
                Currency: x.Currency,
                Settlement: 0,           
                oneSeven: x.oneSeven,
                CurrentInvoice: x.Current,
                eightForteen: x.eightForteen,
                fTwentyOne: x.fTwentyOne,
                tTwentyEight: x.tTwentyEight,
                tThirtyFive: x.tThirtyFive,
                aThirtyFive: x.aThirtyFive,
                total: x.total,
              }));
              
          
            
                worksheet.addRows(data);
        
                records.forEach((x, i) => {
                  if (x.type === "parent") {
                    const row = worksheet.getRow(i + 2); // Account for header row (index starts from 1)
                    row.eachCell((cell) => {
                      cell.font = { bold: true };
                      cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'd7d7d7' } 
                      }; // Set font to bold
                    });
                  }
                });
        
                worksheet.insertRow(1, ['', '', '', '', '', '', '', '']);
                worksheet.insertRow(1, ['']);
                worksheet.insertRow(1, ['', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
                worksheet.insertRow(1, ['', '', '', 'House# A230, PECHS, Block 2,  Karachi']);
                query.company=='1' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics']);
                query.company=='2' && worksheet.insertRow(1, ['', '', '', 'Air Cargo Services']);
                query.company!='1' && query.company!='2' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics & Air Cargo Services']);
                worksheet.insertRow(1, ['']);
                worksheet.insertRow(1, ['']);
          
              worksheet.getCell('D3').font = {
                size: 16,  
                bold: true  
              };
              worksheet.getCell('D4').font = {
                size: 16,  // Increase font size
                bold: true  // Make the text bold
              };
              worksheet.getCell('D5').font = {
                size: 14,  // Increase font size
                bold: true  // Make the text bold
              };
    
              
              const imageUrl = query.ageing_company=='1' ? '/seanet-colored.png' : query.ageing_company=='2' ? '/acs-colored.png' : '/sns-acs.png';
          
              // const imageUrl = '/public/seanet-logo-complete.png'
              const imageBlob = await ImageToBlob(imageUrl);
          
              const imageId = workbook.addImage({
                buffer: await imageBlob.arrayBuffer(), // Convert Blob to ArrayBuffer
                extension: 'png', // Image extension
              });
          
              worksheet.addImage(imageId, {
                tl: { col: 1, row: 1 }, // Top-left position (column, row)
                ext: { width: 150, height: 100 }, // Image width and height
              });
          
              try{
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'AgeingReport.xlsx';
                link.click();
                window.URL.revokeObjectURL(url);
              }catch(e){
                // console.log(e)
                console.error(e)
              }
            
              
            };
  
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
            oneSeven: 0,   // 1–7
            eightForteen: 0,   // 8–14
            fTwentyOne: 0,  // 15–21
            tTwentyEight: 0,  // 22–28
            tThirtyFive: 0,  // 29–35
            aThirtyFive:0,  // 35+
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
                            
    <div className="table-box">
          <div className="table-scroll">
            <table className="weekly">
              <thead className="sticky-header">
                <tr>
                  <th rowSpan={2}>A/C Code</th>
                  <th rowSpan={2} style={{ textAlign: "left" }}>A/C Title</th>
                  <th rowSpan={2}>Curr</th>
                  <th colSpan={8} style={{ textAlign: "center" }}>Ageing</th>
                  <th rowSpan={2}>Total</th>
                </tr>

                <tr>
                  <th>Settlement</th>
                  <th>Current Inv</th>
                  <th>1-7 Days</th>
                  <th>8-14 Days</th>
                  <th>15-21 Days</th>
                  <th>22-28 Days</th>
                  <th>29-35 Days</th>
                  <th>Above 35</th>
                </tr>
              </thead>

              <tbody>
                    {records.map((r) => (
                      <tr key={`${r.AccountCode}-${r.Currency}`}>
                        <td className="cell-code">{r.AccountCode}</td>
                        <td className="cell-title">{r.AccountTitle}</td>
                        <td className="cell-center">{r.Currency}</td>

                        <td className="cell-num">{0.0}</td>
                        <td className="cell-num">{commas(r.Current)}</td>
                        <td className="cell-num">{commas(r.oneSeven)}</td>
                        <td className="cell-num">{commas(r.eightForteen)}</td>
                        <td className="cell-num">{commas(r.fTwentyOne)}</td>
                        <td className="cell-num">{commas(r.tTwentyEight)}</td>
                        <td className="cell-num">{commas(r.tThirtyFive)}</td>
                        <td className="cell-num">{commas(r.aThirtyFive)}</td>

                        <td className="cell-num cell-total">{commas(r.total)}</td>
                      </tr>
                    ))}
            </tbody>
      </table>
    
      </div>
      </div>
        
    </>
  );
};

export default React.memo(Weekly);
