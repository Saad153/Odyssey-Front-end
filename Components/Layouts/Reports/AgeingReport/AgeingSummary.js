import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { FileExcelOutlined } from '@ant-design/icons';
import { setAgeingField } from '../../../../redux/ageing/ageingSlice';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const Summary = ({ query, result }) => {
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
      { header: '1 - 30 Days', key: 'oneThirty', width: 20  },
      { header: '31 - 60 Days', key: 'tOneSixty', width: 20 },
      { header: '61 - 90 Days', key: 'sOneNinety', width: 20  },
      { header: '91 - 120 Days', key: 'nOneTwenty', width: 20  },
      { header: 'Above 120 Days', key: 'overTwenty', width: 20  },
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
      Currency: x.currency,
      Settlement: 0,           
      oneThirty: x.oneThirty,
      CurrentInvoice: x.Current,
      tOneSixty: x.tOneSixty,
      sOneNinety: x.sOneNinety,
      nOneTwenty: x.nOneTwenty,
      overTwenty: x.overTwenty,
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
      worksheet.insertRow(1, ['', '', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
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

    
    const imageUrl = query.company=='1' ? '/seanet-colored.png' : query.company=='2' ? '/acs-colored.png' : '/sns-acs.png';

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
  console.log("summary query:", query)
// console.log("summary result:", result)

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
        Ageing Summary
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
      <div className="table-box">
          <div className="table-scroll">
            <table className="summary">
              <thead className="sticky-header">
                <tr>
                  <th rowSpan={2}>A/C Code</th>
                  <th rowSpan={2} style={{ textAlign: "left" }}>A/C Title</th>
                  <th rowSpan={2}>Curr</th>
                  <th colSpan={7} style={{ textAlign: "center" }}>Ageing</th>
                  <th rowSpan={2}>Total</th>
                </tr>

                <tr>
                  <th>Settlement</th>
                  <th>Current Inv</th>
                  <th>1-30 Days</th>
                  <th>31-60 Days</th>
                  <th>61-90 Days</th>
                  <th>91-120 Days</th>
                  <th>Above 120</th>
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
                  {groupRows.map((r) => (
                    <tr key={`${r.AccountCode}-${r.Currency}`}>
                      <td className="cell-code">{r.AccountCode}</td>
                      <td className="cell-title indent">
                        {r.AccountTitle}
                      </td>
                      <td className="cell-center">{r.Currency}</td>
                      <td className="cell-num">{0.0}</td>
                      <td className="cell-num">{commas(r.Current)}</td>
                      <td className="cell-num">{commas(r.oneThirty)}</td>
                      <td className="cell-num">{commas(r.tOneSixty)}</td>
                      <td className="cell-num">{commas(r.sOneNinety)}</td>
                      <td className="cell-num">{commas(r.nOneTwenty)}</td>
                      <td className="cell-num">{commas(r.overTwenty)}</td>
                      <td className="cell-num cell-total">{commas(r.total)}</td>
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
   </>
     );
   };
   
   export default React.memo(Summary);