import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table } from "react-bootstrap";
// import exportExcelFile from "/functions/exportExcelFile";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";

const Report = ({query, result}) => {
  const reportView = query.reportType;
  const option = query.options;
  // console.log(result)
    const [ records, setRecords ] = useState([]);
    const [ total, setTotal ] = useState({
      opDebit:0,
      opCredit:0,
      trDebit:0,
      trCredit:0,
      clDebit:0,
      clCredit:0,
    });
    const commas = (a) => { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ") };

    const makeParentTransaction = (data) => {
      let transactions  = {
        opDebit:0,
        opCredit:0,
        trDebit:0,
        trCredit:0,
        clDebit:0,
        clCredit:0,
      }
      data.forEach((x)=>{
        x.Voucher_Heads.forEach((y)=>{
          const createdAtDate = moment(y.createdAt);
          if (createdAtDate.isBetween(moment(query.from), moment(query.to), "day", "[]") || createdAtDate.isSame(moment(query.to), "day") ){
            y.type=="debit"?
              transactions.trDebit += parseFloat(y.defaultAmount):
              transactions.trCredit += parseFloat(y.defaultAmount)
          } else {
            y.type=="debit"?
              transactions.opDebit += parseFloat(y.defaultAmount):
              transactions.opCredit += parseFloat(y.defaultAmount)
          }

        });
      });

      let amount = transactions.trDebit + transactions.opDebit - transactions.opCredit - transactions.trCredit
      amount>0?
        transactions.clDebit = parseFloat(amount):
        transactions.clCredit = parseFloat(amount)*-1

        return transactions

    }

    const makeTransaction = (data, type) => {
      // console.log("Make Transaction", data, type)
      let transactions  = {
        opDebit:0,
        opCredit:0,
        trDebit:0,
        trCredit:0,
        clDebit:0,
        clCredit:0,
      }
      data.forEach((x)=>{
        // console.log("Query: ",query)
        const createdAtDate = moment(x.createdAt);
        if (createdAtDate.isBetween(moment(query.from), moment(query.to), "day", "[]") || createdAtDate.isSame(moment(query.to), "day") ){
          if(query.currency=="PKR"){
            x.type=="debit"?
              transactions.trDebit += parseFloat(x.defaultAmount):
              transactions.trCredit += parseFloat(x.defaultAmount)
            }else{
            x.type=="debit"?
              transactions.trDebit += parseFloat(x.amount):
              transactions.trCredit += parseFloat(x.amount)
          }
        } else {
          if(query.currency=="PKR"){
            x.type=="debit"?
              transactions.opDebit += parseFloat(x.defaultAmount):
              transactions.opCredit += parseFloat(x.defaultAmount)
            }else{
            x.type=="debit"?
              transactions.opDebit += parseFloat(x.amount):
              transactions.opCredit += parseFloat(x.amount)
          }
        }

      });

      let amount = transactions.trDebit + transactions.opDebit - transactions.opCredit - transactions.trCredit
      amount>0?
        transactions.clDebit = parseFloat(amount):
        transactions.clCredit = parseFloat(amount)*-1

        return transactions
    }

    useEffect(() => {
      let temp = [];
      // console.log(result)
      if(result.result.length>0){

        result?.result?.forEach((x)=>{
          if(x?.Child_Accounts?.length>0){
            temp.push({
              title:x.title, type:'parent', code:x.code,
              ...makeParentTransaction(x?.Child_Accounts)
            });
            let type = "Non-EX"
            x.Child_Accounts.forEach((y)=>{
              // console.log("Accounts", y)
              y.title.includes("EX-CHANGE RATE GAIN / LOSS")?type = "EX":null
              temp.push({
                title:y.title,
                type:'child',
                code:y.code,
                ...makeTransaction(y.Voucher_Heads, type)
              });
            })
          }
        })
      }
      makeTotal(temp)
      setRecords(temp)
    }, []);

    const makeTotal = (data) => {
      let temp = {
        opDebit:0,
        opCredit:0,
        trDebit:0,
        trCredit:0,
        clDebit:0,
        clCredit:0,
      }
      data.forEach((x)=>{
        if(x.type=="child"){
          temp.opDebit = temp.opDebit + x.opDebit
          temp.opCredit = temp.opCredit + x.opCredit
          temp.trDebit = temp.trDebit + x.trDebit
          temp.trCredit = temp.trCredit + x.trCredit
          temp.clDebit = temp.clDebit + x.clDebit
          temp.clCredit = temp.clCredit + x.clCredit
        }
      });
      setTotal(temp);
    }

    const exportData = () => {
      let temp = [...records];
      temp.push({title:'', ...total})
      exportExcelFile(
        temp,
        [
          { header: "Account", key: "title", width: 25, height:10 },
          { header: "Opening Dr.", key: "opDebit", width: 25, height:10 },
          { header: "Opening Cr.", key: "opCredit", width: 25, height:10 },
          { header: "Transaction Dr.", key: "trDebit", width: 25, height:10 },
          { header: "Transaction Cr.p", key: "trCredit", width: 25, height:10 },
          { header: "Closing Dr.", key: "clDebit", width: 25, height:10 },
          { header: "Closing Cr.", key: "clCredit", width: 25, height:10 },
        ]
      )
    }

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
    
      // Column definitions
      worksheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'Code', key: 'code', width: 15  },
        { header: 'Title of Account', key: 'title', width: 35  },
        { header: 'Debit', key: 'Odebit', width: 20  },
        { header: 'Credit', key: 'Ocredit', width: 20 },
        { header: 'Debit', key: 'Tdebit', width: 20  },
        { header: 'Credit', key: 'Tcredit', width: 20 },
        { header: 'Debit', key: 'Cdebit', width: 20  },
        { header: 'Credit', key: 'Ccredit', width: 20 },
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
        index: i + 1,
        code: x.code,
        title: x.title,
        Odebit: x.opDebit,
        Ocredit: x.opCredit,
        Tdebit: x.trDebit,
        Tcredit: x.trCredit,
        Cdebit: x.clDebit,
        Ccredit: x.clCredit,
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

        worksheet.insertRow(1, ['', '', '', 'Opening', '',  'Transactions', '', 'Closing']);
        worksheet.insertRow(1, ['']);
        worksheet.insertRow(1, ['', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
        worksheet.insertRow(1, ['', '', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
        query.company=='1' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics']);
        query.company=='2' && worksheet.insertRow(1, ['', '', '', 'Air Cargo Services']);
        query.company!='1' && query.company!='2' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics & Air Cargo Services']);
        worksheet.insertRow(1, ['']);
        worksheet.insertRow(1, ['']);

        worksheet.mergeCells('D7:E7');
        worksheet.mergeCells('F7:G7');
        worksheet.mergeCells('H7:I7');
  
      worksheet.getCell('D3').font = {
        size: 16,  // Increase font size
        bold: true  // Make the text bold
      };
      worksheet.getCell('D4').font = {
        size: 16,  // Increase font size
        bold: true  // Make the text bold
      };
      worksheet.getCell('D5').font = {
        size: 14,  // Increase font size
        bold: true  // Make the text bold
      };

      worksheet.getCell('D7').alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      worksheet.getCell('F7').alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      worksheet.getCell('H7').alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      worksheet.getCell('D7').font = {
        size: 14,
        bold: true
      };
      worksheet.getCell('F7').font = {
        size: 14,
        bold: true
      };
      worksheet.getCell('H7').font = {
        size: 14,
        bold: true
      };
      worksheet.getCell('D7').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' } 
      };
      worksheet.getCell('F7').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' } 
      };
      worksheet.getCell('H7').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' } 
      };
      worksheet.getCell('E7').border = {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }
      worksheet.getCell('G7').border = {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }
      worksheet.getCell('I7').border = {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }
  
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
        link.download = 'TrialBalance.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }catch(e){
        // console.log(e)
        console.error(e)
      }
    
      
    };

    const [currentPage,setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(20);
    const indexOfLast = currentPage * recordsPerPage ;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
    const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;

  const TableComponent = ({overFlow}) => {
    return (
      <div className="">
        <div className="d-flex justify-content-end " >
            {/* <button className="btn-custom mx-2 px-3 fs-11 text-center" onClick={exportData}>To Excel</button> */}
            <button className="btn-custom-green px-3 mx-2" onClick={exportToExcel}>
              Export to Excel
            </button>
        </div>
        <PrintTopHeader company={query.company} from={query.from} to={query.to} />
        {/* <hr className="" /> */}
        <div className="printDiv mt-2" style={{ maxHeight: overFlow ? "60vh" : "100%", overflowY: "auto", overflowX: "hidden" , height:"auto" }}>
          <div className="table-sm-1 mt-2">
            <Table className="tableFixHead" bordered>
              <thead>
                <tr className="custom-width">
                  <th className="class-1"></th>

                 {reportView =="6- Columns Simplified View" && option =="showall"?
                  <th className="class-1" colSpan={2}>Opening</th> 
                  :null} 
                 {reportView =="6- Columns Simplified View"? 
                 <th className="class-1" colSpan={2}>Transaction</th>
                 :null}
                  <th className="class-1" colSpan={2}>Closing</th>
                </tr>
                <tr className="custom-width">
                  <th className="class-1">Account Title</th>
           
                  {reportView =="6- Columns Simplified View" && option =="showall"? <th className="class-1">Debit </th>
                   :null}
                      {reportView =="6- Columns Simplified View" && option =="showall"?  <th className="class-1">Credit</th>
                       :null}
                      {reportView =="6- Columns Simplified View"?  <th className="class-1">Debit </th>:null}
                      {reportView =="6- Columns Simplified View"?  <th className="class-1">Credit</th>:null}
                  <th className="class-1">Debit </th>
                  <th className="class-1">Credit</th>
                </tr>
              </thead>
              <tbody>
                {/* exclude 0 */}
               {reportView =="6- Columns Simplified View"  && option =="exclude" && <>
                {                 
                currentRecords.map((x, i) => {
             
                  if(x.type=="parent"){
                    return(
                    <tr key={i}>
                      <td colSpan={7}><b>{x.title}</b></td>
                    </tr>
                    )
                  } else {
                    return (
                      <tr key={i}>
                        <td className="blue-txt fs-12 px-5">{x.title}</td>
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trDebit)}</td>}
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trCredit)}</td>}
                        <td className="fs-12">{commas(x.clDebit)}</td>
                        <td className="fs-12">{commas(x.clCredit)}</td>
                      </tr>
                    )
                }})}
                </>
              }
                {/* showall view */}
              {reportView =="6- Columns Simplified View"  && option =="showall" && <>
                {                 
                currentRecords.map((x, i) => {
             
                  if(x.type=="parent"){
                    return(
                    <tr key={i}>
                      <td colSpan={7}><b>{x.title}</b></td>
                    </tr>
                    )
                  } else {
                    return (
                      <tr key={i}>
                        {/* {console.log(x)} */}
                        <td className="blue-txt fs-12 px-5">{x.title}</td>
                        {reportView =="6- Columns Simplified View" && <td className="fs-12">{commas(x.opDebit)}</td> }
                        {reportView =="6- Columns Simplified View" && <td className="fs-12">{commas(x.opCredit)}</td>}
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trDebit)}</td>}
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trCredit)}</td>}
                        <td className="fs-12">{commas(x.clDebit)}</td>
                        <td className="fs-12">{commas(x.clCredit)}</td>
                      </tr>
                    )
                }})}
                </>
              }
                {/* showall view */}
                {reportView =="6- Columns Simplified View"  && option =="excludeOpening" && <>
                {                 
                currentRecords.map((x, i) => {
             
                  if(x.type=="parent"){
                    return(
                    <tr key={i}>
                      <td colSpan={7}><b>{x.title}</b></td>
                    </tr>
                    )
                  } else {
                    return (
                      <tr key={i}>
                        <td className="blue-txt fs-12 px-5">{x.title}</td>
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trDebit)}</td>}
                        {reportView =="6- Columns Simplified View" &&<td className="fs-12">{commas(x.trCredit)}</td>}
                        <td className="fs-12">{commas(x.clDebit)}</td>
                        <td className="fs-12">{commas(x.clCredit)}</td>
                      </tr>
                    )
                }})}
                </>
              }

                  {/* 2-column */}
                {/* exclude 0 */}
                {reportView =="2- Columns Simplified View" && option == "exclude" &&<>
                {                 
                currentRecords.filter(x => x.clDebit !== 0 && x.clCredit !== 0)
                .map((x, i) => {
                  // console.log("executed")
                  if(x.type=="parent"){
                    return(
                    <tr key={i}>
                      {/* <td colSpan={7}><b>{x.title}</b></td> */}
                    </tr>
                    )
                  } else {
                  return (

                      <tr key={i}>
                        <td className="blue-txt fs-12 px-5">{x.title}</td>
                       
                        <td className="fs-12">{commas(x.clDebit)}</td>
                        <td className="fs-12">{commas(x.clCredit)}</td>
                      </tr>
                    )
                }})}
                </>
              }
                {/* showall view */}
              {reportView =="2- Columns Simplified View"&& <>
                {                 
                currentRecords.map((x, i) => {
             
                  if(x.type=="parent"){
                    return(
                    <tr key={i}>
                      <td colSpan={7}><b>{x.title}</b></td>
                    </tr>
                    )
                  } else {
                    return (
                      <tr key={i}>
                        <td className="blue-txt fs-12 px-5">{x.title}</td>
                        <td className="fs-12">{commas(x.clDebit)}</td>
                        <td className="fs-12">{commas(x.clCredit)}</td>
                      </tr>
                    )
                }})}
                </>
              }

                              

                  {/* 2-column */}

                {
                  reportView =="Debitors List" && <>
                   {currentRecords.filter(x => x.clDebit !== 0).map((x, i) => {
                    // console.log("x",x)
    if (x.type === "parent") {
        return (
            <tr key={i}>
                <td colSpan={7}><b>{x.title}</b></td>
            </tr>
        );
    } else {
        return (
            <tr key={i}>
              <td className="blue-txt fs-12 px-5">{x.title}</td> 
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.opDebit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.opCredit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.trDebit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.trCredit)}</td> : null}
                <td className="fs-12">{commas(x.clDebit)}</td>
                <td className="fs-12">{commas(x.clCredit)}</td> 
            </tr>
        );
    }
})}
                  
                  </>
                }
                               {
                  reportView =="Creditors List" && <>
                   {currentRecords.filter(x => x.clCredit !== 0).map((x, i) => {
                   
    if (x.type === "parent") {
        return (
            <tr key={i}>
                <td colSpan={7}><b>{x.title}</b></td>
            </tr>
        );
    } else {
        return (
            <tr key={i}>
              <td className="blue-txt fs-12 px-5">{x.title}</td> 
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.opDebit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.opCredit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.trDebit)}</td> : null}
                {reportView === "6- Columns Simplified View" ? <td className="fs-12">{commas(x.trCredit)}</td> : null}
                <td className="fs-12">{commas(x.clDebit)}</td>
                <td className="fs-12">{commas(x.clCredit)}</td> 
            </tr>
        );
    }
})}
                  
                  </>
                }
                { reportView =="Debitors List" && <> 
                  <tr>
                      <td className='text-end'><b>Grand Total:</b></td>
                      {reportView =="6- Columns Simplified View"?     <td className='fs-12'>{commas(total.opDebit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?    <td className='fs-12'>{commas(total.opCredit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?   <td className='fs-12'>{commas(total.trDebit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?   <td className='fs-12'>{commas(total.trCredit)}</td>:null}
                      <td className='fs-12'>{commas(total.clDebit)}</td>
                      <td className='fs-12'>{commas(total.clCredit)}</td>
                    </tr>
                </>
                     
                }
                 { currentPage == noOfPages && <> 
                  <tr>
                      <td className='text-end'><b>Grand Total:</b></td>
                      {reportView =="6- Columns Simplified View"?     <td className='fs-12'>{commas(total.opDebit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?    <td className='fs-12'>{commas(total.opCredit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?   <td className='fs-12'>{commas(total.trDebit)}</td>:null}
                      {reportView =="6- Columns Simplified View"?   <td className='fs-12'>{commas(total.trCredit)}</td>:null}
                      <td className='fs-12'>{commas(total.clDebit)}</td>
                      <td className='fs-12'>{commas(total.clCredit)}</td>
                    </tr>
                </>
                     
                }
              
              {/* { reportView == "6- Columns Simplified View" || reportView == "2- Columns Simplified View" &&
              <>
                <tr>
                    <td className='text-end'><b>Grand Total:</b></td>
                    {reportView == "6- Columns Simplified View" ? <td className='fs-12'>{commas(total.opDebit)}</td> : null}
                    {reportView == "6- Columns Simplified View" ? <td className='fs-12'>{commas(total.opCredit)}</td> : null}
                    {reportView == "6- Columns Simplified View" ? <td className='fs-12'>{commas(total.trDebit)}</td> : null}
                    {reportView == "6- Columns Simplified View" ? <td className='fs-12'>{commas(total.trCredit)}</td> : null}
                    <td className='fs-12'>{commas(total.clDebit)}</td>
                    <td className='fs-12'>{commas(total.clCredit)}</td>
              </tr> 
              </>
              } */}
                  
               
              </tbody>
            </Table>
          </div>
          {overFlow && 
          <div className="d-flex justify-content-end mt-4">
            <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
          </div>
          }
        </div>
      </div>
    )
  }
    
  return (
    <div className='p-3'>
      <TableComponent overFlow={true}/>
    </div>
  )
}

export default Report