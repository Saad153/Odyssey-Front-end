import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table } from "react-bootstrap";
import exportExcelFile from "/functions/exportExcelFile";
import Pagination from "/Components/Shared/Pagination";
import { Row, Col } from 'react-bootstrap';
import ExcelJS from "exceljs";
import Cookies from "js-cookie";

const Report = ({query, result}) => {
  // console.log(result)
const report = query.reportType;  
const accountlevel = query.accountLevel;
  const [ records, setRecords ] = useState([]);
  const [accLevelOneArray, setaAcLevelOneArray] = useState([]);
  const [ total, setTotal ] = useState({
    opDebit:0,
    opCredit:0,
    trDebit:0,
    trCredit:0,
    clDebit:0,
    clCredit:0,
  });
  const [ totalCogs, setTotalCogs ] = useState({
    opDebit:0,
    opCredit:0,
    trDebit:0,
    trCredit:0,
    clDebit:0,
    clCredit:0,
  });
 
  
  const [ totalAdminExp, setTotalAdminExp ] = useState({
    opDebit:0,
    opCredit:0,
    trDebit:0,
    trCredit:0,
    clDebit:0,
    clCredit:0,
  });

  const [filteredTempData, setfilteredTempData] = useState([]);
  const[AdminExpArray,setAdminExpArray] = useState([]);
  const[cogsArray,setCogsArray]= useState([]);

  const commas = (a) => { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") };

  const makeTransaction = (data) => {
    console.log("Data", data)
    let transactions  = {
      debit:0,
      credit:0,
    }
    let gainLoss = false
    data.forEach((x)=>{
      x.type=="debit"?
        transactions.debit += parseFloat(x.defaultAmount):
        transactions.credit += parseFloat(x.defaultAmount)
      if(x.accountType=="Gain/Loss Account"){
        gainLoss = true
      }
    });

    if(gainLoss){
      transactions.debit = transactions.credit-transactions.debit
      transactions.credit = 0

    }
    
    // let amount = transactions.debit - transactions.credit
    // amount>0?
    //   transactions.debit += parseFloat(amount):
    //   transactions.credit += parseFloat(amount)*-1;
    // console.log(transactions)
    return transactions

  }
  useEffect(() => {
    let temp = [];
    // let cogsArray=[];
    // let AdminExpArray=[];
  

    let tempArray = [result.result[0], result.result[1]]
    tempArray.forEach((x)=>{
      let i = 0
      if(query.expense != null && x.title == query.expense){
        temp.push({
          title:x.title, type:'parent'
        });
        x.Parent_Accounts.forEach((y)=>{
          if(y.Child_Accounts?.length>0){
            y.Child_Accounts.forEach((z)=>{
              i = i + 1
              if(query.expense != null){
                temp.push({
                title:z.title,
                index:i,
                type:'child',
                ...makeTransaction(z.Voucher_Heads)
                });
              }
            })
          }
        })
    
      }else if(query.revenue != null && x.title == query.revenue){
        temp.push({
          title:x.title, type:'parent'
        });
        x.Parent_Accounts.forEach((y)=>{
          // console.log("y",y)
          if(y.Child_Accounts?.length>0){
            y.Child_Accounts.forEach((z)=>{
              // console.log("Revenue",z)
              i = i + 1
              if(query.revenue != null){
                temp.push({
                title:z.title,
                index:i,
                type:'child',
                ...makeTransaction(z.Voucher_Heads)
                });
              }
            })
          }
        })
      } else if (report == "pnl" && x.title == "Expense") {
        temp.push({
          title: x.title, type: 'parent'
        });
        // console.log("temp", temp)
        const idsToFilter = [
          "FCL FREIGHT EXPENSE",
          "LCL FREIGHT EXPENSE",
          "IMPORT EXPENSES",
          "AIR FREIGHT EXPENSE"
        ];
        x.Parent_Accounts.forEach((y) => {
          if (y.Child_Accounts?.length > 0) {

            // for "COGS/ Selling Exp"
            const filteredCogsAccounts = y.Child_Accounts.filter(c => idsToFilter.includes(c.title));
            // console.log("filteredChildAccounts",filteredCogsAccounts)
            filteredCogsAccounts.forEach(cogs => {
              i = i + 1;
              cogsArray.push({
                title: cogs.title,
                index: i,
                ...makeTransaction(cogs.Voucher_Heads)
              });
            });
            //For Admin Expense
            const filteredAdminExpAccounts = y.Child_Accounts.filter(c => !idsToFilter.includes(c.title));
            // console.log("filteredAdminExpAccounts",filteredAdminExpAccounts)
            filteredAdminExpAccounts.forEach(exp => {
              i = i + 1;
              AdminExpArray.push({
                title: exp.title,
                index: i,
                ...makeTransaction(exp.Voucher_Heads)
              })

                // console.log("AdminExpArray",AdminExpArray)
               

            })
      
          }
        })
      
      }    
      else{

        temp.push({
          title:x.title, type:'parent'
        });
        x.Parent_Accounts.forEach((y)=>{
          if(y.Child_Accounts?.length>0){
            y.Child_Accounts.forEach((z)=>{
              // console.log("z",z)
              i = i + 1
              if(query.revenue != null){
                // console.log(query.revenue, z.title)
                if(query.revenue == z.title){
                  temp.push({
                    title:z.title,
                    index: 1,
                    type:'child',
                    ...makeTransaction(z.Voucher_Heads)
                  })
                }
              }else if(query.expense != null){
                if(query.expense == z.title){
                  // console.log(query.expense, z.title)
                  temp.push({
                    title:z.title,
                    index: 1,
                    type:'child',
                    ...makeTransaction(z.Voucher_Heads)
                  })
                }
              }
              else{
                temp.push({
                title:z.title,
                index:i,
                type:'child',
                ...makeTransaction(z.Voucher_Heads)
                });

                 let tempFilter =[];
                 let ex = temp.filter(item => item.title == "EX-CHANGE RATE GAIN / LOSS")
                 tempFilter =  temp.filter(item => item.type !== 'parent' && item.title != "EX-CHANGE RATE GAIN / LOSS");
                 tempFilter.push(...ex)
                 setfilteredTempData(tempFilter)
              }
            })
          }
        })
      }
    })


    let listWithTotals = [];
    let parentCount = 0;
    let incomeTotal = {credit:0, debit:0};
    let expenseTotal = {credit:0, debit:0};
    temp.forEach((x, i)=>{
      
      if(x.type == "parent" & parentCount == 0){
        parentCount = parentCount + 1
        listWithTotals.push(x)
      } else if (x.type != "parent" && parentCount==1){
        incomeTotal.credit = incomeTotal.credit + x.credit  
        incomeTotal.debit = incomeTotal.debit + x.debit
        listWithTotals.push(x)
      } else if(x.type == "parent" & parentCount == 1){
        parentCount = parentCount + 1
        listWithTotals.push({
          type:'total',
          credit:incomeTotal.credit,
          debit:incomeTotal.debit,
        })
        listWithTotals.push(x)
      } else {
        expenseTotal.credit = expenseTotal.credit + x.credit  
        expenseTotal.debit = expenseTotal.debit + x.debit
        listWithTotals.push(x)
        if(i+1==temp.length){
          listWithTotals.push({
            type:'total',
            credit:expenseTotal.credit,
            debit:expenseTotal.debit,
          })
        }
      }
    })
    // console.log(expenseTotal)
    // console.log(incomeTotal)
    
    // monthWise(result)
    makeTotal(temp)
    makeCogsTotal(cogsArray)
    makeAdminExpTotal(AdminExpArray)
    setRecords(listWithTotals)
    let accLevelOne = [
      listWithTotals.find(item => item.title === 'Expense' && item.type === 'parent'),
      listWithTotals.find(item => item.type === 'total'),
      listWithTotals.find(item => item.title === 'Income/Sales' && item.type === 'parent'),
      listWithTotals.filter(item => item.type === 'total')[0],
  ];

  setaAcLevelOneArray(accLevelOne)
  
  // const profitLoss = (revenue - (totalCogs?.debit || 0) - (totalAdminExp?.debit || 0)).toFixed(2);
  // const formattedProfitLoss = profitLoss < 0 ? `(${Math.abs(profitLoss)})` : profitLoss;

  }, []);

const revenue = accLevelOneArray?.[3]?.credit.toFixed(2);
  const checkMonth = (date) => {
    return moment(date).format("MMM, YYYY")
  }

  const monthWise = (data) => {
    let dates = [];
    data.result.forEach((account)=>{
      account.Parent_Accounts.forEach((pAccount)=>{
        pAccount.Child_Accounts.forEach((cAccount)=>{
          cAccount.Voucher_Heads.forEach((voucher)=>{
            let tempDate = checkMonth(voucher.createdAt)
            dates.includes(tempDate)?
              null:
              dates.push(tempDate);
          })
        })
      })
    })
  }

  const makeTotal = (data) => {
    let temp = {
      debit:0,
      credit:0
    }
    let Exp = false
    data.forEach((x)=>{
      if(x.type=="parent"){
        if(x.title == "Expense"){
          Exp = true
        }else if(x.title == "Income/Sales"){
          Exp = false
        }
      }
      if(x.type=="child" && Exp){
        temp.debit += x.debit
        temp.credit = temp.credit - x.credit
      }else if(x.type=="child" && !Exp){
        temp.debit = temp.debit - x.debit
        temp.credit += x.credit
      }
    });
    setTotal(temp)
    setTotalCogs(temp)
  }

  const makeCogsTotal =(data)=> {
    let temp = {
      debit:0,
      credit:0
    }
    data.forEach((x)=>{
      temp.debit = temp.debit + x.debit
      temp.credit = temp.credit + x.credit
    });
    setTotalCogs(temp)
  }

  const makeAdminExpTotal =(data)=> {
    let temp = {
      debit:0,
      credit:0
    }
    data?.forEach((x)=>{
      temp.debit = temp.debit + x.debit
      temp.credit = temp.credit + x.credit
    });
    setTotalAdminExp(temp)
  }

  // const exportData = () => {
  //   let temp = [...records];
  //   temp.push({title:'', ...total})
  //   exportExcelFile(
  //     temp,
  //     [
  //       { header: "Account", key: "title", width: 30, height:10 },
  //       { header: "Opening Dr.", key: "opDebit", width: 25, height:10 },
  //       { header: "Opening Cr.", key: "opCredit", width: 25, height:10 },
  //       { header: "Transaction Dr.", key: "trDebit", width: 25, height:10 },
  //       { header: "Transaction Cr.p", key: "trCredit", width: 25, height:10 },
  //       { header: "Closing Dr.", key: "clDebit", width: 25, height:10 },
  //       { header: "Closing Cr.", key: "clCredit", width: 25, height:10 },
  //     ]
  //   )
  // }

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

  function generateString(data) {
    const dateFrom = new Date(data.from).toLocaleDateString('en-GB'); // Format to DD/MM/YYYY
    const dateTo = new Date(data.to).toLocaleDateString('en-GB'); // Format to DD/MM/YYYY
    
    return `Date From = ${dateFrom},Date Till = ${dateTo},Company = ${data.company},Currency = ${data.currency},Account Level = ${data.accountLevel},Report Type = ${data.reportType}`;
}


  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice Report');
  
    // Column definitions
    worksheet.columns = [
      // { header: '#', key: 'index', width: 2 },
      { header: 'Account Name', key: 'title', width: 20  },
      { header: '', key: 'index', width: 30 },
      { header: 'Balance', key: 'balance', width: 50  },
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
        bold: true,
      };
    
      cell.alignment = {
        wrapText: true,
        horizontal: 'center',
        vertical: 'middle'
      };
    });
    console.log(filteredTempData)
    console.log(cogsArray)
    console.log(query)
    const data = []
    data.push({
      title: 'Revenue',
      index: "-"
    })
    data.push(
      ...filteredTempData.map((x) => ({
        title: x.title,
        balance: parseFloat(x.debit || x.credit),
      index: "-"
      }))
    )
    data.push({
      title: 'Total for Revenue',
      balance: parseFloat(total?.credit - total?.debit),
      index: "-"
    })
    data.push({
      title: 'COGS / Selling Expense',
      index: "-"
    })
    data.push(
      ...cogsArray.map((x) => ({
        title: x.title,
        balance: parseFloat(x.debit || x.credit),
      index: "-"
      }))
    )
    data.push({
      title: 'Total for COGS / Selling Expense',
      balance: parseFloat(totalCogs?.debit?.toFixed(2)),
      index: "-"
    })
    data.push({
      title: 'Gross Profit',
      balance: parseFloat((total?.credit - total?.debit)-totalCogs?.debit),
      index: "-"
    })
    data.push({
      title: 'Admin Expenses',
      index: "-"
    })
    data.push(
      ...AdminExpArray.map((x) => ({
      title: x.title,
      balance: parseFloat(x.debit || x.credit),
      index: "-"
    }))
  )
    data.push({
      title: 'Total for Admin Expenses',
      balance: parseFloat(totalAdminExp?.debit?.toFixed(2)),
      index: "-"
    })
    data.push({
      title: 'Profit/(Loss)',
      balance: parseFloat((total?.credit - total?.debit)-totalCogs?.debit-totalAdminExp?.debit),
      index: "-"
    })


    worksheet.addRows(data);

    // worksheet.columns.forEach((column) => {
    //   let maxWidth = 10; // Set a minimum width for each column
    //   column.eachCell({ includeEmpty: true }, (cell) => {
    //     if (cell.value) {
    //       const cellValueLength = cell.value.toString().length;
    //       if (cellValueLength > maxWidth) {
    //         maxWidth = cellValueLength + 2; // Add padding for better spacing
    //       }
    //     }
    //   });
    //   column.width = maxWidth;
    // });
    let string = generateString(query)
    console.log(string)
    worksheet.insertRow(1, ['Profit & Loss Income Statement'])
    worksheet.insertRow(1, [string])
    worksheet.insertRow(1)
    worksheet.insertRow(1)
    worksheet.insertRow(1, ['', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
    Cookies.get('companyId')=='1' && worksheet.insertRow(1, ['', 'Seanet Shipping & Logistics']);
    Cookies.get('companyId')=='2' && worksheet.insertRow(1, ['', 'Air Cargo Services']);
    Cookies.get('companyId')!='1' && Cookies.get('companyId')!='2' && worksheet.insertRow(1, ['', 'Seanet Shipping & Logistics & Air Cargo Services']);
    const totalColumns = worksheet.columns.length; // Total columns based on column definitions

    worksheet.eachRow((row, rowIndex) => {
      // Iterate through cells only up to the total number of columns
      rowIndex==1?worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`):null
      rowIndex==2?worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`):null
      rowIndex==3?worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`):null
      rowIndex==4?worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`):null
      rowIndex==5?worksheet.mergeCells(`A${rowIndex}:C${rowIndex}`):null
      rowIndex==6?worksheet.mergeCells(`A${rowIndex}:C${rowIndex}`):null
      rowIndex>6?worksheet.mergeCells(row._cells[0].address, row._cells[1].address):null
      for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
        const cell = row.getCell(colIndex);
        if(rowIndex>6){
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
        if(rowIndex<=6){
          cell.font = {
            bold: true
          }
        }
        if(rowIndex==1){
          row.font = {
            size: 18,
            bold: true
          }
        }
        if(rowIndex==6){
          row.font = {
            size: 14,
            bold: true
          }
        }
        colIndex==3&&rowIndex>6?
          cell.alignment = {
            horizontal: 'right',
          }:
          cell.alignment = {
            horizontal: 'left',
          }
          cell.numFmt = '#,##0.00'
        // console.log("row Index>", rowIndex, row.getCell(1).value)
        rowIndex==8?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+9?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+10?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+cogsArray.length+11?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+cogsArray.length+12?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+cogsArray.length+13?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+cogsArray.length+AdminExpArray.length+14?cell.font = { bold: true}:null
        rowIndex==filteredTempData.length+cogsArray.length+AdminExpArray.length+15?cell.font = { bold: true}:null
      }
    }); 
    worksheet.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.pageSetup.orientation = 'landscape';

    // Optionally, set other page setup options
    worksheet.pageSetup = {
      orientation: 'portrait', // portrait mode
      paperSize: 9, // A4 size
      fitToPage: true, // Enable fitting to a single page
      fitToWidth: 1, // Fit columns to one page
      fitToHeight: 0, // Allow rows to spill onto multiple pages
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.25,
        bottom: 0.25,
        header: 0,
        footer: 0,
      },
    };

    const imageUrl = Cookies.get('companyId')=='1' ? '/seanet-colored.png' : Cookies.get('companyId')=='2' ? '/acs-colored.png' : '/sns-acs.png';

    const imageBlob = await ImageToBlob(imageUrl);

    const imageId = workbook.addImage({
      buffer: await imageBlob.arrayBuffer(), // Convert Blob to ArrayBuffer
      extension: 'png', // Image extension
    });

    worksheet.addImage(imageId, {
      tl: { col: 0.2, row: 0 }, // Top-left position (column, row)
      ext: { width: 135, height: 90 }, // Image width and height
    });

      try{
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'IncomeStatementPnL.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }catch(e){
        console.log(e)
        console.error(e)
      }
  
    
    };

    const exportToExcelGrid = async () => {
      const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice Report');
      // console.log(columnDefs)

    worksheet.columns = columnDefs.map((col) => ({
      header: col.headerName,
      key: col.field,
      width: col.width
    }))

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
        bold: true,
      };
    
      cell.alignment = {
        wrapText: true,
        horizontal: 'center',
        vertical: 'middle'
      };
    });
    const data = [...records]

    const flattenedData = records.map((x) => {
      return {
        invoice_No: x.invoice_No,
        'SE_Job.jobNo': x.SE_Job.jobNo,
        'SE_Job.jobDate': x.SE_Job.jobDate,
        createdAt: x.createdAt,
        // doDate: x.doDate,
        'SE_Job.Bl.hbl': x.SE_Job.Bl.hbl,
        'SE_Job.Bl.mbl': x.SE_Job.Bl.mbl,
        'SE_Job.shipDate': x.SE_Job.shipDate,
        'SE_Job.fd': x.SE_Job.fd,
        'SE_Job.freightType': x.SE_Job.freightType,
        'SE_Job.subType': x.SE_Job.subType,
        'SE_Job.shipper.name': x.SE_Job.shipper.name,
        'SE_Job.consignee.name': x.SE_Job.consignee.name,
        'SE_Job.sales_representator.name': x.SE_Job.sales_representator.name,
        'SE_Job.shippingLine.name': x.SE_Job.shipping_line.name,
        'SE_Job.weight': x.SE_Job.weight,
        'SE_Job.vol': x.SE_Job.vol,
        'SE_Job.payType': x.SE_Job.payType,
        'SE_Job.customerRef': x.SE_Job.customerRef,
        'SE_Job.fileNo': x.SE_Job.fileNo,
        'SE_Job.arrivalDate': x.SE_Job.arrivalDate,
        'SE_Job.Voyage.voyage': x.SE_Job.Voyage.voyage,
        'SE_Job.Client.code': x.SE_Job.Client.code,
        'SE_Job.vessel.name': x.SE_Job.vessel.name,
        customerRef: x.SE_Job.customerRef,
        company: x.company,
        paid: x.paid,
        age: x.age,
        containers: x.containers,
        ppcc: x.ppcc,
        currency: x.currency,
        party_Name: x.party_Name,
        balance: x.payType == "Recievable" ? commas(x.balance) : `(${commas(x.balance)})`,
        total: x.payType != "Recievable" ? commas(x.total):"0",
        total: x.payType == "Recievable" ? commas(x.total):"0",
        paidRcvd: x.payType != "Recievable" ?commas(x.paid):commas(x.recieved),
        // total: commas(x.total),
      };
    });

    console.log(flattenedData)
  

      worksheet.addRows(flattenedData);
      const totalColumns = columnDefs.length; // Total columns based on column definitions

      worksheet.eachRow((row, rowIndex) => {
        // Iterate through cells only up to the total number of columns
        for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
          const cell = row.getCell(colIndex);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
      });

      worksheet.columns.forEach((column) => {
        let maxWidth = 10; // Set a minimum width for each column
        column.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.value) {
            const cellValueLength = cell.value.toString().length;
            if (cellValueLength > maxWidth) {
              maxWidth = cellValueLength + 2; // Add padding for better spacing
            }
          }
        });
        column.width = maxWidth;
      });

      const fieldNamesToFormat = ['Balance', 'Credit', 'Debit', 'Paid/Rcvd']; // Fields to apply formatting

      worksheet.insertRow(1, ['', '', '', '', '','Agent Invoice Balancing Grid']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['', '', '', '', '','Date: From: ' + query.from + ' To: ' + query.to,]);
      worksheet.insertRow(1, ['', '', '', '', '','House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
      Cookies.get('companyId')=='1' && worksheet.insertRow(1, ['', '', '', '', '','Seanet Shipping & Logistics']);
      Cookies.get('companyId')=='2' && worksheet.insertRow(1, ['', '', '', '', '','Air Cargo Services']);
      Cookies.get('companyId')!='1' && Cookies.get('companyId')!='2' && worksheet.insertRow(1, ['', '', '', '', '','Seanet Shipping & Logistics & Air Cargo Services']);

      let cell = worksheet.getCell('F1');
      cell.font = {
        size: 18,  // Increase font size
        bold: true  // Make the text bold
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };    
      cell = worksheet.getCell('F2');
      cell.font = {
        size: 13,  // Increase font size
        bold: true  // Make the text bold
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }; 
      cell = worksheet.getCell('F3');
      cell.font = {
        size: 13,  // Increase font size
        bold: true  // Make the text bold
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }; 
      cell = worksheet.getCell('F7');
      cell.font = {
        size: 16,  // Increase font size
        bold: true  // Make the text bold
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }; 

      worksheet.mergeCells("F1:J1")
      worksheet.mergeCells("F2:J2")
      worksheet.mergeCells("F3:J3")
      worksheet.mergeCells("F7:J7")

      worksheet.pageSetup.orientation = 'landscape';

      // Optionally, set other page setup options
      worksheet.pageSetup = {
        orientation: 'landscape', // Landscape mode
        paperSize: 9, // A4 size
        fitToPage: true, // Enable fitting to a single page
        fitToWidth: 1, // Fit columns to one page
        fitToHeight: 0, // Allow rows to spill onto multiple pages
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.25,
          bottom: 0.25,
          header: 0,
          footer: 0,
        },
      };

      const imageUrl = Cookies.get('companyId')=='1' ? '/seanet-colored.png' : Cookies.get('companyId')=='2' ? '/acs-colored.png' : '/sns-acs.png';

      // const imageUrl = '/public/seanet-logo-complete.png'
      const imageBlob = await ImageToBlob(imageUrl);

      const imageId = workbook.addImage({
        buffer: await imageBlob.arrayBuffer(), // Convert Blob to ArrayBuffer
        extension: 'png', // Image extension
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left position (column, row)
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
        link.download = 'JobBalancingGrid.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }catch(e){
        console.log(e)
        console.error(e)
      }
    }

  const profitLoss = (revenue - (totalCogs?.debit || 0) - (totalAdminExp?.debit || 0)).toFixed(2);
  const formattedProfitLoss = profitLoss < 0 ? `(${Math.abs(profitLoss)})` : profitLoss;
  const ProfitLossReport = ({ accountLevel, report, overFlow }) => {
    if ((accountLevel === "6" || accountLevel === "1") && report === "pnl") {
      return (
        <div className="">
        <div className="d-flex justify-content-end">
        {/* <button 
          className="btn-custom mx-2 px-3 fs-11 text-center" 
          onClick={exportData}
        >
          To Excel
        </button> */}
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcel}>
            Export to Excel
          </button>
      </div>
      <PrintTopHeader company={query.company} from={query.from} to={query.to} />
        
        <div className='printDiv mt-2' style={{ maxHeight: overFlow ? "60vh" : "100%", overflowY: "auto", overflowX: "hidden", height: "auto"}}>
          <div style={{borderBottom:"1px solid black"}}>
            <b>Revenue</b>
          </div>
          {accountLevel == "6" &&
            <div>
              {filteredTempData.map((item)=>{
                return(
                  <div key={item.id} style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
                    <div>
                      {item.title}
                    </div>
                    <div>
                      {commas(item.debit || item.credit)}
                    </div>
                  </div>
                  
                )
              })}
            </div>
          }
          <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
            <div><b>Total for Revenue</b></div>
            <div><b>{commas(total?.credit - total?.debit)}</b></div>
          </div>
        </div>
        <div style={{borderBottom:"1px solid black"}}>
          <b>COGS / Selling Expense</b>
        </div>
        {accountLevel == "6" &&
          <div>
            {cogsArray.map((item)=>{
              // console.log("Admin Expenses",item)
              return(
                <div key={item.id} style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
                  <div>
                    {item.title}
                  </div>
                  <div>
                    {commas(item.debit)}
                  </div>
                </div>
                
              )
            })}
          </div>
        }
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
            <div><b>Total for COGS / Selling Expense</b></div>
            <div><b>{commas(totalCogs?.debit?.toFixed(2))}</b></div>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
          <b>Gross Profit</b>
          <b>{commas((total?.credit - total?.debit)-totalCogs?.debit)}</b>
        </div>
        <div style={{borderBottom:"1px solid black"}}>
          <b>Admin Expenses</b>
        </div>
        {accountLevel == "6" &&
          <div>
            {AdminExpArray.map((item)=>{
              // console.log("Admin Expenses",item)
              return(
                <div key={item.id} style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
                  <div>
                    {item.title}
                  </div>
                  <div>
                    {commas(item.debit || item.credit)}
                  </div>
                </div>
                
              )
            })}
          </div>
        }
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
          <div><b>Total for Admin Expenses</b></div>
          <div><b>{commas(totalAdminExp?.debit?.toFixed(2))}</b></div>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px solid black"}}>
          <b>Profit/(Loss)</b>
          <b>{commas(((total?.credit - total?.debit)-totalCogs?.debit)-totalAdminExp?.debit)}</b>
        </div>
      </div>
      );
    } else {
      return null;
    }
  };
  

  const [currentPage,setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const indexOfLast = currentPage * recordsPerPage ;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
  const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;



  const TableComponent = ({ overFlow }) => {
    // Determine if we should render the alternative content
    const shouldRenderAlternative = accountlevel && report=='pnl' && <ProfitLossReport accountLevel={accountlevel} report={report} overFlow={overFlow} />;
  
    if (shouldRenderAlternative) {
      return shouldRenderAlternative;
    }
  
    return (
      <div className="">
        <div className="d-flex justify-content-end">
          <button 
            //onClick={exportData}
            className="btn-custom mx-2 px-3 fs-11 text-center" 
          >
            To Excel
          </button>
        </div>
        <PrintTopHeader company={query.company} from={query.from} to={query.to} />
        
        {accountlevel === "6" ? (
          <div className="printDiv mt-2" style={{ maxHeight: overFlow ? "60vh" : "100%", overflowY: "auto", overflowX: "hidden", height: "auto" }}>
            <div className="table-sm-1 mt-2">
              <Table className="tableFixHead" bordered>
                <thead>
                  <tr className="custom-width">
                    <th className='text-center'>#</th>
                    <th>Account Title</th>
                    <th>Debit </th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((x, i) => {
                    if (x.type === "parent") {
                      return (
                        <tr key={i}>
                          <td></td>
                          <td colSpan={7}><b>{x.title}</b></td>
                        </tr>
                      );
                    } else if (x.type === "total") {
                      return (
                        <tr key={i}>
                          <td></td>
                          <td colSpan={1} className='text-end'><b>Total</b></td>
                          <td className="fs-12"><b>{commas(x.debit)}</b></td>
                          <td className="fs-12"><b>{commas(x.credit)}</b></td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={i}>
                          <td className="fs-12 text-center">{x.index}</td>
                          <td className="blue-txt fs-12 px-5">{x.title}</td>
                          <td className="fs-12">{commas(x.debit)}</td>
                          <td className="fs-12">{commas(x.credit)}</td>
                        </tr>
                      );
                    }
                  })}
  
                  <tr>
                    <td></td>
                    <td className='text-end'><b>Profit & Loss {"( Total )"}:</b></td>
                    <td className='fs-12'><b>{commas(total.debit) || '0.00'}</b></td>
                    <td className='fs-12'><b>{commas(total.credit >= 0 ? total.credit : total.credit * -1) || '0.00'}</b></td>
                  </tr>
                </tbody>
              </Table>
            </div>
            {overFlow && 
            <div className="d-flex justify-content-end mt-4">
              <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
            }
          </div>
        ) : (
          <div className="printDiv mt-2" style={{ maxHeight: overFlow ? "60vh" : "100%", overflowY: "auto", overflowX: "hidden", height: "auto" }}>
            <div className="table-sm-1 mt-2">
              <Table className="tableFixHead" bordered>
                <thead>
                  <tr className="custom-width">
                    <th className='text-center'>#</th>
                    <th>Account Title</th>
                    <th>Debit </th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {accLevelOneArray.map((x, i) => {
                    if (x.type === "parent") {
                      return (
                        <tr key={i}>
                          <td></td>
                          <td colSpan={7}><b>{x.title}</b></td>
                        </tr>
                      );
                    } else if (x.type === "total") {
                      return (
                        <tr key={i}>
                          <td></td>
                          <td colSpan={1} className='text-end'><b>Total</b></td>
                          <td className="fs-12"><b>{commas(x.debit)}</b></td>
                          <td className="fs-12"><b>{commas(x.credit)}</b></td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={i}>
                          <td className="fs-12 text-center">{x.index}</td>
                          <td className="blue-txt fs-12 px-5">{x.title}</td>
                          <td className="fs-12">{commas(x.debit)}</td>
                          <td className="fs-12">{commas(x.credit)}</td>
                        </tr>
                      );
                    }
                  })}
  
                  <tr>
                    <td></td>
                    <td className='text-end'><b>Profit & Loss {"( Total )"}:</b></td>
                    <td className='fs-12'><b>{commas(total.debit) || '0.00'}</b></td>
                    <td className='fs-12'><b>{commas(total.credit) || '0.00'}</b></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  };
  

  return (
  <div className='p-3'>
    <TableComponent overFlow={true}/>
  </div>
  )
}

export default React.memo(Report)