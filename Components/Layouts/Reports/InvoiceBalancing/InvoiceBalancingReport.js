import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { Spinner, Table } from "react-bootstrap";
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import PrintTopHeader from '/Components/Shared/PrintTopHeader';
import Cookies from "js-cookie";
import { AiFillPrinter } from "react-icons/ai";
import { useDispatch } from 'react-redux';
import { incrementTab } from '/redux/tabs/tabSlice';
import Router from 'next/router';
import { AgGridReact } from 'ag-grid-react';
import { CSVLink } from "react-csv";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";


const InvoiceBalancingReport = ({ result, query }) => {
  let inputRef = useRef(null);
  const dispatch = useDispatch();
  const [load, setLoad] = useState(true);
  const [records, setRecords] = useState([]);
  const [username, setUserName] = useState("");
  const commas = (a) => a ? parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.0';

  console.log("Result:", result)

  const getTotal = (type, list) => {
    let result = 0.00;
    list.filter((x)=>{
      // console.log(`Balance: -${x.balance}-`)
      // console.log(`Query: -${query.balance}-`)
      if(query.balance=="exclude0"){
        // console.log("Exclude Zero")
        if(x.balance!='0.0' && x.balance!='(0.0)'){
          // console.log("Balance Zero")
          return x
        }else{
          // console.log("Balance Not Zero")
        }
      }else{
        // console.log("Show All")
        return x
      }
      // return query.balance=="exclude0"?(x.balance!="0.0"&&x.balance!="(0.0)"):x
    }).forEach((x) => {
      if (type == x.payType) {
        result = result + parseFloat(x.total)
      }
    })
    // if(query.balance=="exclude0"){
    //   return 0.0;
    // }else{
    // }
    return commas(result);
  }

  const paidReceivedTotal = (list) => {
    let paid = 0.00, Received = 0.00, total = 0.00;
    list.filter((x)=>{
      // console.log(`Balance: -${x.balance}-`)
      // console.log(`Query: -${query.balance}-`)
      if(query.balance=="exclude0"){
        // console.log("Exclude Zero")
        if(x.balance!='0.0' && x.balance!='(0.0)'){
          // console.log("Balance Zero")
          return x
        }else{
          // console.log("Balance Not Zero")
        }
      }else{
        // console.log("Show All")
        return x
      }
      // return query.balance=="exclude0"?(x.balance!="0.0"&&x.balance!="(0.0)"):x
    }).forEach((x) => {
      if(query.currency!='PKR'){
        if (x.payType == "Payble") {
          paid = paid + parseFloat(x.paid)
        } else {
          Received = Received + parseFloat(x.recieved)
        }

      }else{
        if (x.payType == "Payble") {
          paid = paid + parseFloat(x.paid)*parseFloat(x.ex_rate)
        } else {
          Received = Received + parseFloat(x.recieved)*parseFloat(x.ex_rate)
        }
      }
    })
    total = Received - paid
    // if(query.balance=="exclude0"){
    //   return 0.0;
    // }else{
    // }
    return total >= 0 ? commas(total) : `(${commas(total * -1)})`;
  }

  const balanceTotal = (list) => {
    let balance = 0.00;
    list.filter((x)=>{
      // console.log(`Balance: -${x.balance}-`)
      // console.log(`Query: -${query.balance}-`)
      if(query.balance=="exclude0"){
        // console.log("Exclude Zero")
        if(x.balance!='0.0' && x.balance!='(0.0)'){
          // console.log("Balance Zero")
          return x
        }else{
          // console.log("Balance Not Zero")
        }
      }else{
        // console.log("Show All")
        return x
      }
      // return query.balance=="exclude0"?(x.balance!="0.0"&&x.balance!="(0.0)"):x
    }).forEach((x) => {
      if(x.payType == "Payble"){
        balance = balance - parseFloat(x.total-x.paid)
      }else{
        balance = balance + parseFloat(x.total-x.recieved)
      }
    })
    // if(query.balance=="exclude0"){
    //   return 0.0;
    // }else{
    // }
    return balance >= 0 ? commas(balance) : `(${commas(balance * -1)})`;
  }

  const getAge = (date) => {
    let date1 = new Date(date);
    let date2 = new Date();
    let difference = date2.getTime() - date1.getTime();
    return parseInt(difference / 86400000)
  }

  useEffect(() => {
    getValues(result);
    getUserName();
    async function getUserName() {
      let name = await Cookies.get("username");
      setUserName(name)
    }
  }, [])

  async function getValues(value) {
    // console.log(value.result)
    if (value.status == "success") {
      let newArray = [...value.result];
      if(query.currency!='PKR'){

        newArray.forEach((x, i) => {
          let invAmount = 0;
          invAmount = parseFloat(x.total);
          x.index = i + 1
          // x.total = commas(invAmount);
          x.createdAt = moment(x.createdAt).format("DD-MMM-YYYY")
          x.debit = x.payType == "Recievable" ? invAmount : 0
          x.credit = x.payType != "Recievable" ? invAmount : 0
          x.total = x.payType == "Recievable" ? invAmount : invAmount
          x.paidRec = x.payType == "Recievable" ? parseFloat(x.recieved) : parseFloat(x.paid);
          x.balance = x.payType == "Recievable" ? (invAmount - parseFloat(x.recieved)) : (invAmount - parseFloat(x.paid))
          x.age = getAge(x.createdAt);
          x.blHbl = x.SE_Job?.Bl?.hbl
          x.blMbl = x.SE_Job?.Bl?.mbl?x.SE_Job?.Bl?.mbl:"-"
          x.fd = x.SE_Job?.fd
          x.ppcc = x.Charge_Heads>0?x.Charge_Heads[0]?.pp_cc:null
          x.subType = x.SE_Job?.subType
          x.shipper = x.SE_Job?.shipper?.name
          x.salesRep = x.SE_Job?.sales_representator?.name
          x.wt = x.SE_Job?.weight
          x.vol = x.SE_Job?.vol
          x.dnCn = x.SE_Job?.payType == "Recievable"? "DN" : "CN"
          x.op = x.SE_Job?.operation
          x.company = x.companyId == "1" ? "SEA NET SHIPPING & LOGISTICS" : x.companyId == "3" ? "AIR CARGO SERVICES" : "Invalid"
          x.fileNo = x.SE_Job?.fileNo
          x.customerRef = x.SE_Job?.customerRef
          x.containers = x.SE_Job?.SE_Equipments?x.SE_Job.SE_Equipments.map((x) => x.size).join(","):"-"
          x.jobClient = x.SE_Job?.Client?.name?x.SE_Job?.Client?.name:"-"
          x.clientRecievable = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.clientRecieved = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.clientOutstanding = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.arrivalDate = x.SE_Job?.arrivalDate?x.SE_Job?.arrivalDate:"-"
          x.sailingDate = x.SE_Job?.shipDate?x.SE_Job?.shipDate:"-"
          x.vessel = x.SE_Job?.vessel?.name?x.SE_Job?.vessel?.name:"-"
          x.voyage = x.SE_Job?.Voyage?.voyage?x.SE_Job?.Voyage?.voyage:"-"
  
        })
      }else{
        newArray.forEach((x, i) => {
          let invAmount = 0;
          invAmount = parseFloat(x.total)*parseFloat(x.ex_rate);
          x.index = i + 1
          x.total = invAmount;
          x.createdAt = moment(x.createdAt).format("DD-MMM-YYYY")
          x.debit = x.payType == "Recievable" ? invAmount : 0
          x.credit = x.payType != "Recievable" ? invAmount : 0
          // x.total = x.payType == "Recievable" ? commas(invAmount) : `(${commas(invAmount)})`
          x.paidRec = x.payType == "Recievable" ? commas(parseFloat(x.recieved)*parseFloat(x.ex_rate)) : commas(parseFloat(x.paid)*parseFloat(x.ex_rate));
          x.balance = x.payType == "Recievable" ? commas(invAmount - x.paidRec) : `(${commas(invAmount - x.paidRec)})`
          x.age = getAge(x.createdAt);
          x.blHbl = x.SE_Job?.Bl?.hbl
          x.blMbl = x.SE_Job?.Bl?.mbl?x.SE_Job?.Bl?.mbl:"-"
          x.fd = x.SE_Job?.fd
          x.ppcc = x.Charge_Heads.length>0?x.Charge_Heads[0]?.pp_cc:null
          x.subType = x.SE_Job?.subType
          x.shipper = x.SE_Job?.shipper?.name
          x.salesRep = x.SE_Job?.sales_representator?.name
          x.wt = x.SE_Job?.weight
          x.vol = x.SE_Job?.vol
          x.dnCn = x.SE_Job?.payType == "Recievable"? "DN" : "CN"
          x.op = x.SE_Job?.operation
          x.company = x.companyId == "1" ? "SEA NET SHIPPING & LOGISTICS" : x.companyId == "3" ? "AIR CARGO SERVICES" : "SNS & ACS"
          x.fileNo = x.SE_Job?.fileNo
          x.customerRef = x.SE_Job?.customerRef
          x.containers = x.SE_Job?.SE_Equipments?x.SE_Job.SE_Equipments.map((x) => x.size).join(","):"-"
          x.jobClient = x.SE_Job?.Client?.name?x.SE_Job?.Client?.name:"-"
          x.clientRecievable = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.clientRecieved = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.clientOutstanding = x.SE_Job?.client?.name?x.SE_Job?.client?.name:"-"
          x.arrivalDate = x.SE_Job?.arrivalDate?x.SE_Job?.arrivalDate:"-"
          x.sailingDate = x.SE_Job?.shipDate?x.SE_Job?.shipDate:"-"
          x.vessel = x.SE_Job?.vessel?.name?x.SE_Job?.vessel?.name:"-"
          x.voyage = x.SE_Job?.Voyage?.voyage?x.SE_Job?.Voyage?.voyage:"-"
  
        })
      }
      console.log(query.balance)
      if(query.balance=="exclude0"){
        newArray = newArray.filter((x) => (query.balance === 'exclude0' ? Math.floor(x.balance) !== 0 : x))
      }
      setRecords(newArray);
    }
    setLoad(false)
  };

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
      { header: '#', key: 'index', width: 3 },
      { header: 'Inv. No', key: 'invoice_No', width: 15  },
      // { header: 'Job. No', key: 'jobNo', width: 15  },
      { header: 'Date', key: 'date', width: 12  },
      { header: 'HBL', key: 'hbl', width: 10  },
      { header: 'Agent', key: 'party_Name', width: 30  },
      { header: 'F. Dest', key: 'fd', width: 12  },
      { header: 'J/Tp', key: 'jt', width: 7 },
      { header: 'F/Tp', key: 'ft', width: 7 },
      { header: 'Cntrs', key: 'container', width: 15  },
      { header: 'WT', key: 'weight', width: 6 },
      { header: 'Vol', key: 'vol', width: 6 },
      { header: 'Curr', key: 'currency', width: 6 },
      { header: 'Debit', key: 'debit', width: 10  },
      { header: 'Credit', key: 'credit', width: 10  },
      { header: 'Paid/Rcvd', key: 'paidRec', width: 10  },
      { header: 'Balance', key: 'balance', width: 10  },
      { header: 'Age', key: 'age', width: 5  },
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
    const data = records
      .filter((x) => (query.balance === 'exclude0' ? Math.floor(x.balance) !== 0 : x))
      .map((x, i) => ({
        index: i + 1,
        invoice_No: x.invoice_No,
        jobNo: x.SE_Job?.jobNo,
        date: x.createdAt,
        hbl: x?.SE_Job?.Bl?.hbl,
        party_Name: x.party_Name,
        fd: x.SE_Job?.fd,
        jt: x.SE_Job?.subType,
        ft: x.Charge_Heads.length>0?x.Charge_Heads[0].pp_cc:null,
        container: x.containers,
        weight: x.SE_Job?.weight,
        vol: x.SE_Job?.vol,
        currency: x.currency,
        debit: x.debit,
        credit: x.credit,
        paidRec: x.paidRec,
        balance: x.balance,
        age: x.age,
      }));

      worksheet.addRows(data);
      worksheet.addRow({
        balance: balanceTotal(records),
        adjust: "0.00",
        credit: getTotal("Payble", records),
        debit: getTotal("Recievable", records),
        paidRec: paidReceivedTotal(records),
        vol: "Total"
      })

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
      
      worksheet.eachRow((row, rowIndex) => {
        row.eachCell((cell, colIndex) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
      });

      worksheet.insertRow(1, ['', '', '', '', '','Agent Invoice Balancing Report', '', '', '', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
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
      cell = worksheet.getCell('L7');
      cell.font = {
        size: 13,  // Increase font size
        bold: true  // Make the text bold
      };
      cell.alignment = {
        horizontal: 'right',
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

      worksheet.mergeCells('F1:K1')
      worksheet.mergeCells('F2:K2')
      worksheet.mergeCells('L7:P7')
      worksheet.mergeCells('F7:K7')

      
      const lastRowIndex = worksheet.rowCount;

      // Merge cells in columns L and M for the last row
      const lastRow = worksheet.getRow(lastRowIndex);
      worksheet.mergeCells(lastRowIndex, 11, lastRowIndex, 12)
      lastRow.font={
        bold: true
      }

      worksheet.addRow(['']);


      worksheet.addRow({
        invoice_No: "Aging",
        date: "0-30 Days",
        party_Name: "31-60 Days",
        fd: "61-90 Days",
        ft: "91-120 Days",
        weight: "120-Above Days",
      })

      let lastlastRowIndex = worksheet.rowCount;
      // lastlastRowIndex++
      let lastlastRow = worksheet.getRow(lastlastRowIndex);
      worksheet.mergeCells(lastlastRowIndex, 3, lastlastRowIndex, 4)
      worksheet.mergeCells(lastlastRowIndex, 6, lastlastRowIndex, 7)
      worksheet.mergeCells(lastlastRowIndex, 8, lastlastRowIndex, 9)
      worksheet.mergeCells(lastlastRowIndex, 10, lastlastRowIndex, 12)
      lastlastRow.font={
        bold: true
      }
      lastlastRow.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }; 
      lastlastRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
        };
    });

      let balance1 = 0.0;
      let balance2 = 0.0;
      let balance3 = 0.0;
      let balance4 = 0.0;
      let balance5 = 0.0;
      records.filter((x) => (query.balance === 'exclude0' ? Math.floor(x.balance.slice(1, -1)) !== 0 : x)).forEach((x)=>{
        if(x.age>=0 && x.age <=30){
          x.payType == "Recievable"?
          balance1 += parseFloat(x.balance.slice(1, -1)):
          balance1 -= parseFloat(x.balance.slice(1, -1))
        }
        if(x.age>=31 && x.age <=60){
          x.payType == "Recievable"?
          balance2 += parseFloat(x.balance.slice(1, -1)):
          balance2 -= parseFloat(x.balance.slice(1, -1))
        }
        if(x.age>=61 && x.age <=90){
          x.payType == "Recievable"?
          balance3 += parseFloat(x.balance.slice(1, -1)):
          balance3 -= parseFloat(x.balance.slice(1, -1))
        }
        if(x.age>=91 && x.age <=120){
          x.payType == "Recievable"?
          balance4 += parseFloat(x.balance.slice(1, -1)):
          balance4 -= parseFloat(x.balance.slice(1, -1))
        }
        if(x.age>=120){
          x.payType == "Recievable"?
          balance5 += parseFloat(x.balance.slice(1, -1)):
          balance5 -= parseFloat(x.balance.slice(1, -1))
        }
      })

      worksheet.insertRow(lastlastRowIndex+1, {
        // invoice_No: "Aging",
        date: balance1,
        party_Name: balance2,
        fd: balance3,
        ft: balance4,
        weight: balance5,
      })
      // lastlastRowIndex = worksheet.rowCount;
      // lastlastRowIndex++
      lastlastRow = worksheet.getRow(lastlastRowIndex+1);
      worksheet.mergeCells(lastlastRowIndex, 2, lastlastRowIndex+1, 2)
      worksheet.mergeCells(lastlastRowIndex+1, 3, lastlastRowIndex+1, 4)
      worksheet.mergeCells(lastlastRowIndex+1, 6, lastlastRowIndex+1, 7)
      worksheet.mergeCells(lastlastRowIndex+1, 8, lastlastRowIndex+1, 9)
      worksheet.mergeCells(lastlastRowIndex+1, 10, lastlastRowIndex+1, 12)
      // lastlastRow.font={
      //   bold: true
      // }
      lastlastRow.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }; 
      lastlastRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
        };
    });

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
        link.download = 'AgentInvoiceBalancingReport.xlsx';
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

      worksheet.addRows(data);
      worksheet.eachRow((row, rowIndex) => {
        row.eachCell((cell, colIndex) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
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

      worksheet.mergeCells("F1:H1")
      worksheet.mergeCells("F2:H2")
      worksheet.mergeCells("F3:H3")
      worksheet.mergeCells("F7:H7")

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
        link.download = 'AgentInvoiceBalancingGrid.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }catch(e){
        console.log(e)
        console.error(e)
      }
    }
  
  // Pagination Variables
  const [currentPage,setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const indexOfLast = currentPage * recordsPerPage ;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
  const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;
  // Pagination Variables
  const TableComponent = ({overflow}) => {
    return (
    <>
      {!load &&
        <>
          {records.length > 0 &&
            <>
              <PrintTopHeader company={query.company} />
              <hr className='mb-2' />
              <div className='table-sm-1' style={{ maxHeight: overflow ? 600 : "100%", overflowY: 'auto' }}>
                <Table className='tableFixHead' bordered style={{ fontSize: 12 }} ref={inputRef}>
                  <thead>
                    <tr>
                      <th className='text-center'>#</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Inv. No</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Job. No</th>
                      <th className='text-center' style={{ minWidth: 100 }}>Date</th>
                      <th className='text-center' >HBL/HAWB</th>
                      <th className='text-center'style={{ minWidth: 200 }}>Name</th>
                      <th className='text-center' style={{ minWidth: 100 }}>F. Dest</th>
                      <th className='text-center'>J/Tp</th>
                      <th className='text-center'>F/Tp</th>
                      <th className='text-center'>Container</th>
                      <th className='text-center'>Weight</th>
                      <th className='text-center'>Volume</th>
                      <th className='text-center'>Curr</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Debit</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Credit</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Paid/Rcvd</th>
                      <th className='text-center'style={{ minWidth: 100 }}>Balance</th>
                      <th className='text-center'>Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((x, i) => {
                      // console.log(x)
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td
                          className="blue-txt"
                          style={{ width: 90, cursor:"pointer"}} 
                          onClick={async ()=>{
                            
                            await Router.push(`/reports/invoice/${x.id}`)
                            dispatch(incrementTab({ "label": "Invoice Details", "key": "2-11", "id":`${x.id}`}))
                          }}
                        >{x.invoice_No}</td>
                        <td
                          className="blue-txt"
                          style={{ width: 90, cursor:"pointer"}} 
                          onClick={()=>{
                            let type = x?.SE_Job?.operation;
                            if(x?.SE_Job?.jobNo){
                              dispatch(incrementTab({
                              "label":type=="SE"?"SE JOB":type=="SI"?"SI JOB":type=="AE"?"AE JOB":"AI JOB",
                              "key":type=="SE"?"4-3":type=="SI"?"4-6":type=="AE"?"7-2":"7-5",
                              "id":x.SE_Job.id
                              }))
                              Router.push(type=="SE"?`/seaJobs/export/${x.SE_Job.id}`:type=="SI"?`/seaJobs/import/${x.SE_Job.id}`:
                                type=="AE"?`/airJobs/export/${x.SE_Job.id}`:`/airJobs/import/${x.SE_Job.id}`
                              )
                            }
                          }
                        }
                        >{x.SE_Job?.jobNo}</td>
                        <td>{x.createdAt}</td>
                        <td>{x?.SE_Job?.Bl?.hbl}</td>
                        <td>{x.party_Name}</td>
                        <td>{x.SE_Job?.fd}</td>
                        <td>{x.SE_Job?.subType}</td>
                        <td>{x.Charge_Heads.length>0&&x.Charge_Heads[0].pp_cc}</td>
                        <td>{x.SE_Job?.container}</td>
                        <td>{x.SE_Job?.weight}</td>
                        <td>{x.SE_Job?.vol}</td>
                        <td>{x.currency}</td>
                        <td>{commas(x.debit)}</td>
                        <td>{commas(x.credit)}</td>
                        <td>{commas(x.paidRec)}</td>
                        <td>{commas(x.balance)}</td>
                        <td>{x.age}</td>
                      </tr>
                    )})}
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'right' }}><b>Total</b></td>
                      <td style={{ textAlign: 'right' }}>{getTotal("Recievable", records)}</td>
                      <td style={{ textAlign: 'right' }}>{getTotal("Payble", records)}</td>
                      <td style={{ textAlign: 'right' }}>{paidReceivedTotal(records)}</td>
                      <td style={{ textAlign: 'right' }}>{balanceTotal(records)}</td>
                      <td style={{ textAlign: 'center' }}>-</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              {overflow && 
                <div className="d-flex justify-content-end mt-4">
                  <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
                </div>
              }
            </>
          }
          {records.length == 0 && <>No Similar Record</>}
        </>
      }
      {load && <div className='text-center py-5 my-5'> <Spinner /> </div>}
    </>
    )
  };
  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState([
    { headerName: '#', field: 'index', filter: true },
    { headerName: 'Inv. No', field: 'invoice_No', filter: true },
    { headerName: 'Date', field: 'createdAt', filter: true },
    { headerName: 'HBL/HAWB', field: 'blHbl', filter: true },
    { headerName: 'MBL/MAWB', field: 'blMbl', filter: true },
    { headerName: 'Agent', field: 'party_Name',filter: true },
    { headerName: 'Shipper', field: 'shipper', filter: true },
    { headerName: 'SalesPerson', field: 'salesRep', filter: true },
    { headerName: 'F. Dest', field: 'fd', filter: true },
    { headerName: 'J/Tp', field: 'subType', filter: true },
    { headerName: 'F/Tp', field: 'ppcc', filter: true },
    { headerName: 'WT', field: 'wt', filter: true },
    { headerName: 'Vol', field: 'vol', filter: true },
    { headerName: 'DN/CN', field: 'dnCn', filter: true },
    { headerName: 'Curr', field: 'currency', filter: true },
    { headerName: 'Invoice Amount', field: 'total', filter: true },
    // { headerName: 'Credit', field: 'credit', filter: true },
    { headerName: 'Paid/Rcvd', field: 'paidRec', filter: true },
    { headerName: 'Balance', field: 'balance', filter: true },
    { headerName: 'Operation Type', field: 'op', filter: true },
    { headerName: 'Company Name', field: 'company', filter: true },
    { headerName: 'Age', field: 'age', filter: true },
    { headerName: 'Containers', field: 'containers', filter: true },
    { headerName: 'Job Client', field: 'jobClient', filter: true },
    // { headerName: 'ClientRecievable', field: 'clientRecievable', filter: true },
    // { headerName: 'ClientRecieved', field: 'clientRecieved', filter: true },
    // { headerName: 'ClientOutstanding', field: 'clientOutstanding', filter: true },
    { headerName: 'Arrival Date', field: 'arrivalDate', filter: true },
    { headerName: 'Sailing Date', field: 'sailingDate', filter: true },
    { headerName: 'File No', field: 'fileNo', filter: true },
    { headerName: 'Vessel', field: 'vessel', filter: true },
    { headerName: 'Voyage #', field: 'voyage', filter: true },
    { headerName: 'Custsomer Ref #', field: 'customerRef', filter: true },
  ]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }));

  const getRowHeight = useCallback(() => {
    return 38;
  }, []);

  return (
  <div className='base-page-layout'>
    {query.report == "viewer" && (
      <>
        <ReactToPrint content={() => inputRef} trigger={() => <AiFillPrinter className="blue-txt cur fl-r" size={30} />} />
        {/* <---- Excel Download button ----> */}
        <div className="d-flex justify-content-end items-end" >
          {/* <CSVLink data={result.result} className="btn-custom mx-2 fs-11 text-center" style={{ width: "110px", float: 'left' }}>
            Excel
          </CSVLink> */}
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </>
    )}
    {query.report == "grid" && (
      <>
        {/* <ReactToPrint content={() => inputRef} trigger={() => <AiFillPrinter className="blue-txt cur fl-r" size={30} />} /> */}
        {/* <---- Excel Download button ----> */}
        <div className="d-flex justify-content-end items-end" style={{paddingBottom: 10}}>
          {/* <CSVLink data={result.result} className="btn-custom mx-2 fs-11 text-center" style={{ width: "110px", float: 'left' }}>
            Excel
          </CSVLink> */}
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcelGrid}>
            Export to Excel
          </button>
        </div>
      </>
    )}
    {/* <---- Reports View only  ----> */}
    {query.report == "viewer" && <TableComponent overflow={true}/>}
    {/* <---- list View only with filteration ----> */}
    {query.report != "viewer" &&
    
      <div className="ag-theme-alpine" style={{ width: "100%", height: '72vh' }}>
        {/* {console.log(records)}/ */}
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={records} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection='multiple' // Options - allows click selection of rows
          getRowHeight={getRowHeight}
          pagination={true}
          paginationPageSize={50}
        />
      </div>
    }
    {/* <---- Component that will be displaying in print mode  ----> */}
    <div style={{ display: 'none' }}>
      <div className="pt-5 px-3" ref={(response) => (inputRef = response)}>
        {/* <---- Setting overflow true while in printing ----> */}
        <TableComponent overflow={false}/>
        <div style={{ position: 'absolute', bottom: 10 }}>Printed On: {`${moment().format("YYYY-MM-DD")}`}</div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>Printed By: {username}</div>
      </div>
    </div>
  </div>
  )
}

export default React.memo(InvoiceBalancingReport)