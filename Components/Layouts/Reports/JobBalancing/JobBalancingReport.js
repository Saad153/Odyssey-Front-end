import { Spinner, Table } from "react-bootstrap";
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import PrintTopHeader from '/Components/Shared/PrintTopHeader';
import { AiFillPrinter } from "react-icons/ai";
import ReactToPrint from 'react-to-print';
import Cookies from "js-cookie";
import moment from 'moment';
import { AgGridReact } from 'ag-grid-react';
import { CSVLink } from "react-csv";
import { incrementTab } from '/redux/tabs/tabSlice';
import { useDispatch } from 'react-redux';
import Router from 'next/router';
import Pagination from "/Components/Shared/Pagination";
import exportExcelFile from "/functions/exportExcelFile";
import ExcelJS from "exceljs";

const JobBalancingReport = ({ result, query }) => {

  let inputRef = useRef(null);
  const [load, setLoad] = useState(true);
  const [records, setRecords] = useState([]);
  const [username, setUserName] = useState("");
  const [aging, setAging] = useState(true)
  const dispatch = useDispatch();
  const commas = (a) => a ? parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.0';
  console.log("Result:", result)
  const getTotal = (type, list) => {
    //console.log(list)
    let values = 0.00;
    list.filter((x) => {
      //console.log("X..", x)
      //console.log("QUERY..", query)
        if (query.options == 'exclude0') {
          //console.log("ASD")
          //console.log(x.total, x.paid, x.recieved)
          //console.log(x.total - x.paid, x.total - x.recieved)
          // const balance = x.payType !== "Recievable" ? (x.total - x.paid) : (x.total - x.recieved);
          return x.total -  x.paid != 0 && x.total - x.recieved != 0; // Directly check if balance is not zero
        }
        return true; // Keep all items if `query.options` is not 'exclude0'
      }).forEach((x) => {
      //console.log(x)
      //console.log(type, x.payType)
      if (type.trim() == x.payType.trim()) {
        //console.log(x.total)
        values = values + parseFloat(x.total)
      }
    })
    //console.log(values)
    return commas(values);
  }

  const paidReceivedTotal = (list) => {
    let paid = 0.00, Received = 0.00, total = 0.00;
    list.filter((x) => {
      //console.log("X..", x)
      //console.log("QUERY..", query)
        if (query.options == 'exclude0') {
          //console.log("ASD")
          //console.log(x.total, x.paid, x.recieved)
          //console.log(x.total - x.paid, x.total - x.recieved)
          // const balance = x.payType !== "Recievable" ? (x.total - x.paid) : (x.total - x.recieved);
          return x.total -  x.paid != 0 && x.total - x.recieved != 0; // Directly check if balance is not zero
        }
        return true; // Keep all items if `query.options` is not 'exclude0'
      }).forEach((x) => {
        if (x.payType == "Payble") {
            paid = paid + parseFloat(x.paid)
        } else {
            Received = Received + parseFloat(x.recieved)
        }
    })
    total = Received - paid
    return total >= 0 ? commas(total) : (`${commas(total * -1)}`);
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
      { header: '#', key: 'index', width: 2 },
      { header: 'Inv/Bill#', key: 'invoiceNo', width: 12  },
      { header: 'Job. No', key: 'jobNo', width: 12  },
      { header: 'Inv/Bill Date', key: 'invoiceDate', width: 12  },
      { header: 'DO Date', key: 'doDate', width: 12  },
      { header: 'HBL #', key: 'hbl', width: 10  },
      { header: 'Client', key: 'party', width: 15 },
      { header: 'FD', key: 'finalDestination', width: 10  },
      { header: 'J/Type', key: 'jType', width: 7  },
      { header: 'F/Type', key: 'fType', width: 7  },
      { header: 'Cntrs', key: 'containers', width: 10  },
      { header: 'WT', key: 'weight', width: 5  },
      { header: 'Vol', key: 'volume', width: 5  },
      { header: 'Curr', key: 'currency', width: 5  },
      { header: 'Receivable', key: 'recievable', width: 12  },
      { header: 'Adjust', key: 'adjust', width: 12  },
      { header: 'Received', key: 'recieved', width: 12  },
      { header: 'Balance', key: 'balance', width: 12  },
      { header: 'Age', key: 'agingDays', width: 5  },
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
    //console.log(result.result)
    const data = result.result
    .filter((x) => {
      //console.log("Paid:", parseFloat(x.total) - parseFloat(x.paid))
      //console.log("Received: ", parseFloat(x.total) - parseFloat(x.recieved))
      if (query.options === 'exclude0') {
        const balance = x.payType !== "Recievable" ? (parseFloat(x.total) - parseFloat(x.paid)) : (parseFloat(x.total) - parseFloat(x.recieved));
        return balance !== 0; // Directly check if balance is not zero
      }
      return true; // Keep all items if `query.options` is not 'exclude0'
    }).map((x, i) => ({
        index: i + 1,
        jobNo: x.SE_Job?.jobNo,
        // jobDate: moment(x.SE_Job?.createdAt).format('DD-MM-YYYY'),
        invoiceNo: x.invoice_No,
        invoiceDate: moment(x.createdAt).format('DD-MM-YYYY'),
        doDate: "",
        hbl: x?.SE_Job?.Bl?.hbl,
        // mbl: x?.SE_Job?.Bl?.mbl,
        // sailingDate: x?.SE_Job?.shipDate?moment(x?.SE_Job?.shipDate).format('DD-MM-YYYY'):null,
        // arrivalDate: x?.SE_Job?.arrivalDate?moment(x?.SE_Job?.arrivalDate).format('DD-MM-YYYY'):null,
        // opCode: x?.SE_Job?.operation,
        // voyageNo: x?.SE_Job?.Voyage.voyage,
        party: x.party_Name,
        // clientCode: x?.SE_Job?.Client.code,
        // shipper: x?.SE_Job?.shipper?.name,
        // consignee: x?.SE_Job?.consignee?.name,
        // salesRep: x?.SE_Job?.sales_representator?.name,
        // shippingLine: x?.SE_Job?.shipping_line?.name,
        // vessel: x?.SE_Job?.vessel?.name,
        finalDestination: x.SE_Job?.fd,
        jType: x.SE_Job?.subType,
        fType: x.Charge_Heads.length>0?x.Charge_Heads[0].pp_cc:"-",
        containers: x.SE_Job?.SE_Equipments?x.SE_Job.SE_Equipments.map((x) => x.size).join(","):"-",
        weight: x.SE_Job?.weight,
        volume: x.SE_Job?.vol,
        currency: x.currency,
        recievable: commas(x.total),
        adjust: "0.00",
        payable: x.payType != "Recievable" ?commas(x.total):'-',
        recieved: x.payType == "Recievable" ?commas(x.recieved):commas(x.paid),
        paid: x.paid,
        balance: x.payType != "Recievable" ?commas(x.total-x.paid):commas(x.total-x.recieved),
        agingDays: getAge(x.createdAt)+1,
      }));

      worksheet.addRows(data);
      worksheet.addRow({
        balance: balanceTotal(result.result),
        recieved: paidReceivedTotal(result.result),
        adjust: "0.00",
        recievable: getTotal("Recievable", result.result),
        volume: "Total"
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

      worksheet.insertRow(1, ['', '', '', '', '','Job Balancing Report', '', '', '', '', '', '', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['', '', '', '', '','House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
      Cookies.get('companyId')=='1' && worksheet.insertRow(1, ['', '', '', '', '','Seanet Shipping & Logistics']);
      Cookies.get('companyId')=='2' && worksheet.insertRow(1, ['', '', '', '', '','Air Cargo Services']);
      Cookies.get('companyId')!='1' && Cookies.get('companyId')!='2' && worksheet.insertRow(1, ['', '', '', '', '','Seanet Shipping & Logistics & Air Cargo Services']);
      

      // <td colSpan={8} style={{ textAlign: 'right' }}><b>Total</b></td>
      // <td style={{ textAlign: 'right' }}>{getTotal("Recievable", result.result)}</td>
      // <td style={{ textAlign: 'right' }}>{getTotal("Payble", result.result)}</td>
      // <td style={{ textAlign: 'right' }}>{paidReceivedTotal(result.result)}</td>
      // <td style={{ textAlign: 'right' }}>{paidReceivedTotal(result.result)}</td>
      // <td style={{ textAlign: 'right' }}>{balanceTotal(result.result)}</td>
      // <td style={{ textAlign: 'center' }}>-</td>

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
      cell = worksheet.getCell('O7');
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
      worksheet.mergeCells('O7:S7')
      worksheet.mergeCells('F7:K7')

      
      const lastRowIndex = worksheet.rowCount;

      // Merge cells in columns L and M for the last row
      const lastRow = worksheet.getRow(lastRowIndex);
      worksheet.mergeCells(lastRowIndex, 12, lastRowIndex, 13)
      lastRow.font={
        bold: true
      }

      if(aging){worksheet.addRow({
        invoiceNo: "Aging",
        jobNo: "0-30 Days",
        invoiceDate: "31-60 Days",
        doDate: "61-90 Days",
        hbl: "91-120 Days",
        party: "120-Above Days",
      })

      let lastlastRowIndex = worksheet.rowCount;
      // lastlastRowIndex++
      let lastlastRow = worksheet.getRow(lastlastRowIndex);
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
      result.result.filter((x) => (query.options === 'exclude0' ? Math.floor(x.balance.slice(1, -1)) !== 0 : x)).forEach((x)=>{
        //console.log("Total>>",x.total)
        //console.log("payType>>",x.payType)
        if((getAge(x.createdAt)+1)>=0 && (getAge(x.createdAt)+1) <=30){
          x.payType == "Recievable"?
          balance1 += x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved):
          balance1 -= x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved)
        }
        if((getAge(x.createdAt)+1)>=31 && (getAge(x.createdAt)+1) <=60){
          x.payType == "Recievable"?
          balance2 += x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved):
          balance2 -= x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved)
        }
        if((getAge(x.createdAt)+1)>=61 && (getAge(x.createdAt)+1) <=90){
          x.payType == "Recievable"?
          balance3 += x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved):
          balance3 -= x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved)
        }
        if((getAge(x.createdAt)+1)>=91 && (getAge(x.createdAt)+1) <=120){
          x.payType == "Recievable"?
          balance4 += x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved):
          balance4 -= x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved)
        }
        if((getAge(x.createdAt)+1)>=120){
          x.payType == "Recievable"?
          balance5 += x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved):
          balance5 -= x.payType != "Recievable" ?parseFloat(x.total-x.paid):parseFloat(x.total-x.recieved)
        }
      })

      worksheet.insertRow(lastlastRowIndex+1, {
        jobNo: commas(balance1),
        invoiceDate: commas(balance2),
        doDate: commas(balance3),
        hbl: commas(balance4),
        party: commas(balance5),
      })
      lastlastRow = worksheet.getRow(lastlastRowIndex+1);
      worksheet.mergeCells(lastlastRowIndex, 2, lastlastRowIndex+1, 2)
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
    });}

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
        link.download = 'JobBalancing.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }catch(e){
        //console.log(e)
        console.error(e)
      }
  
    
    };

    const exportToExcelGrid = async () => {
      const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice Report');
      // //console.log(columnDefs)

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
        'SE_Job.jobNo': x.SE_Job?.jobNo,
        'SE_Job.jobDate': x.SE_Job?.jobDate,
        createdAt: x.createdAt,
        // doDate: x.doDate,
        'SE_Job.Bl.hbl': x.SE_Job?.Bl.hbl,
        'SE_Job.Bl.mbl': x.SE_Job?.Bl.mbl,
        'SE_Job.shipDate': x.SE_Job?.shipDate,
        'SE_Job.fd': x.SE_Job?.fd,
        'SE_Job.freightType': x.SE_Job?.freightType,
        'SE_Job.subType': x.SE_Job?.subType,
        'SE_Job.shipper.name': x.SE_Job?.shipper.name,
        'SE_Job.consignee.name': x.SE_Job?.consignee.name,
        'SE_Job.sales_representator.name': x.SE_Job?.sales_representator.name,
        'SE_Job.shippingLine.name': x.SE_Job?.shipping_line.name,
        'SE_Job.weight': x.SE_Job?.weight,
        'SE_Job.vol': x.SE_Job?.vol,
        'SE_Job.payType': x.SE_Job?.payType,
        'SE_Job.customerRef': x.SE_Job?.customerRef,
        'SE_Job.fileNo': x.SE_Job?.fileNo,
        'SE_Job.arrivalDate': x.SE_Job?.arrivalDate,
        'SE_Job.Voyage.voyage': x.SE_Job?.Voyage.voyage,
        'SE_Job.Client.code': x.SE_Job?.Client.code,
        'SE_Job.vessel.name': x.SE_Job?.vessel.name,
        customerRef: x.SE_Job?.customerRef,
        company: x.company,
        paid: x.paid,
        age: x.age,
        containers: x.containers,
        ppcc: x.ppcc,
        currency: x.currency,
        party_Name: x.party_Name,
        balance: x.payType == "Recievable" ? commas(x.balance) : `(${commas(x.balance)})`,
        total: x.payType == "Recievable" ? commas(x.total):"0",
        total1: x.payType != "Recievable" ? commas(x.total):"0",
        paidRcvd: x.payType != "Recievable" ?commas(x.paid):commas(x.recieved),
        // total: commas(x.total),
      };
    });

    //console.log(flattenedData)
  

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

      worksheet.insertRow(1, ['', '', '', '', '','Job Balancing Grid']);
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
        //console.log(e)
        console.error(e)
      }
    }

  const balanceTotal = (list) => {
    let balance = 0.00;
    //console.log(list)
    list.filter((x) => {
      //console.log("X..", x)
      //console.log("QUERY..", query)
        if (query.options == 'exclude0') {
          //console.log("ASD")
          //console.log(x.total, x.paid, x.recieved)
          //console.log(x.total - x.paid, x.total - x.recieved)
          // const balance = x.payType !== "Recievable" ? (x.total - x.paid) : (x.total - x.recieved);
          return x.total -  x.paid != 0 && x.total - x.recieved != 0; // Directly check if balance is not zero
        }
        return true; // Keep all items if `query.options` is not 'exclude0'
      }).forEach((x) => {
      //console.log(x)
      if (x.payType == "Payble") {
        balance = balance - parseFloat(x.total-x.paid)
      } else {
        balance = balance + parseFloat(x.total-x.recieved)
      }
      //console.log(balance)
    })
    return balance >= 0 ? commas(balance) : (`(${commas(balance * -1)})`);
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
    setLoad(false)

  }, [])

  async function getValues(value) {
    if (value.status == "success") {
    let newArray = [...value.result];
    await newArray.forEach((y, i) => {
      y.no = i + 1;
      //console.log(y)
      y.balance = y.total!="0"?y.payType=="Recievable" ?
        (parseFloat(y.total) - parseFloat(y.recieved)) :
        (parseFloat(y.total) - parseFloat(y.paid)):(y.recieved*-1)
      y.total = (parseFloat(y.total)) + parseFloat(y.roundOff)
      y.total1 = (parseFloat(y.total)) + parseFloat(y.roundOff)
      y.paid = (parseFloat(y.paid)) + parseFloat(y.roundOff)
      y.recieved = (parseFloat(y.recieved)) + parseFloat(y.roundOff)
      y.age = getAge(y.createdAt);
      y.freightType = y?.SE_Job?.freightType == "Prepaid" ? "PP" : "CC"
      y.fd = y?.SE_Job?.fd;
      y.createdAt = moment(y.createdAt).format("DD-MMM-YY")
      y.hbl = y?.SE_Job?.Bl?.hbl
      y.ppcc = y.Charge_Heads.length>0?y.Charge_Heads[0].pp_cc?y.Charge_Heads[0].pp_cc:"-":"-"
      y.Receivable = y.payType == "Recievable" ? commas(y.total) : "-";
      y.payble = y.payType != "Recievable" ? commas(y.total) : "-";
      y.balanced = y.payType == "Recievable" ? commas(y.recieved) : y.paid;
      y.finalBalance = y.payType != "Recievable" ? (`${commas(y.balance)}`) : commas(y.balance)
      y.containers = y?.SE_Job?.SE_Equipments.map((x) => x.size).join(", ")
      y.company = y.companyId == "1"? "Sea Net Shipping & Logistics Ltd.": y.companyId == "3"? "Air Cargo Services": "Invalid"
      y.customerRef = y?.SE_Job?.customerRef
    })
    if(query.options!="showall"){
      newArray = await newArray.filter((x)=>{
        return x.balance!=0
      })

    }
    console.log(">>>", newArray)
    setRecords(newArray);
    } else {}
  }

  // Pagination Variables
  const [currentPage,setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  let indexOfLast = currentPage * recordsPerPage ;
  let indexOfFirst = indexOfLast - recordsPerPage;
  let currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];

  useEffect(() => {
    indexOfFirst = currentPage * recordsPerPage;
    indexOfLast = indexOfFirst + recordsPerPage;
    console.log(result.result)
    currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
    console.log(currentRecords)
  },[currentPage])
  const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;
  // Pagination Variables
  
  const TableComponent = ({overflow}) => {
    return (
    <>
    {!load &&
      <>
      {result.result?.length > 0 &&
        <>
          <PrintTopHeader company={query.company} />
          <hr className='mb-2' />
          <div className='table-sm-1' style={{ maxHeight: overflow ? 530 : "50%", overflowY: 'auto' }}>
          <Table className='tableFixHead' bordered style={{ fontSize: 11 }}>
            <thead>
              <tr>
                <th className='text-center'>#</th>
                <th className='text-center' style={{ minWidth: 110 }}>Inv. No</th>
                <th className='text-center' style={{ minWidth: 110 }}>Job. No</th>
                <th className='text-center' style={{ minWidth: 90 }}>Job. Date</th>
                <th className='text-center' style={{ minWidth: 90 }}>Date</th>
                <th className='text-center' style={{ minWidth: 100 }}>HBL/HAWB</th>
                <th className='text-center' style={{ minWidth: 100 }}>MBL/MAWB</th>

                <th className='text-center' style={{ minWidth: 100 }}>Sailing Date</th>
                <th className='text-center'style={{ minWidth: 100 }}>Arrival Date</th>
                <th className='text-center'style={{ minWidth: 200 }}>Name</th>
                <th className='text-center'style={{ minWidth: 100 }}>Client Code</th>
                <th className='text-center'style={{ minWidth: 100 }}>Shipper</th>
                <th className='text-center' style={{ minWidth: 100 }}>Consignee</th>
                <th className='text-center'style={{ minWidth: 100 }}>Sales Representator</th>
                <th className='text-center'style={{ minWidth: 100 }}>Shipping Line</th>
                <th className='text-center' style={{ minWidth: 100 }}>Vessel</th>
                <th className='text-center'style={{ minWidth: 100 }}>F. Dest</th>
                <th className='text-center'>J/Tp</th>
                <th className='text-center'>F/Tp</th>
                <th className='text-center'>Weight</th>
                <th className='text-center'>Volume</th>
                <th className='text-center'>Currency</th>
                <th className='text-center' style={{ minWidth: 100 }}>Receivable</th>
                <th className='text-center'style={{ minWidth: 100 }}>Payable</th>
                <th className='text-center'style={{ minWidth: 100 }}>Paid/Recieved</th>
                {/* <th className='text-center'style={{ minWidth: 100 }}>Paid</th> */}
                <th className='text-center'style={{ minWidth: 100 }}>Balance</th>
                <th className='text-center'>Age</th>
              </tr>
            </thead>
            <tbody>
              {/* without print  */}
              {console.log("Length: ", currentRecords.length)}
              {overflow ? currentRecords.map((x,i)=>{
                const date = x.SE_Job?.jobDate;
                const formattedDate = moment(date).format('DD-MMM-YYYY');
                const sailDate = x.SE_Job?.shipDate;
                const formattedSailDate = moment(sailDate).format('DD-MMM-YYYY');
                const arrivalDate = x.SE_Job?.arrivalDate;
                let formattedArrivalDate;
                if(arrivalDate)
                {
                 formattedArrivalDate = moment(arrivalDate).format('DD-MMM-YYYY');

                }

              return (
                <tr key={i}>
                  <td style={{ maxWidth: 10 }}>{i + 1}</td>
                  <td 
                    className="blue-txt"
                    style={{ width: 90, cursor:"pointer"}}
                    onClick={async ()=>{
                      await Router.push(`/reports/invoice/${x.id}`)
                      dispatch(incrementTab({ "label": "Invoice Details", "key": "2-11", "id":`${x.id}`}))
                    }}
                  >{x.invoice_No}</td>
                  <td 
                    style={{ width: 90, cursor:"pointer"}} 
                    className="blue-txt"
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
                  }>
                    {x?.SE_Job?.jobNo}
                  </td>
                  <td style={{width:150}}>{moment(x.SE_Job?.createdAt).format('DD-MMM-YYYY')}</td>
                  <td style={{}}>{moment(x.createdAt).format('DD-MMM-YYYY')}</td>
                  <td style={{width:50}}>{x.SE_Job?.Bl?.hbl}</td>
                  <td style={{width:50}}>{x.SE_Job?.Bl?.mbl}</td>
                  <td style={{width:50}}>{moment(x.SE_Job?.shipDate).format('DD-MMM-YYYY')}</td>
                  <td style={{width:50}}>{x.SE_Job?.arrivalDate?moment(x.SE_Job?.arrivalDate).format('DD-MMM-YYYY'):null}</td> 
                  <td style={{width:150}}><b>{x.party_Name}</b></td>
                  <td style={{width:150}}><b>{x.SE_Job?.Client?.code}</b></td>
                  <td style={{width:150}}><b>{x.SE_Job?.shipper?.name}</b></td>
                  <td style={{width:150}}><b>{x.SE_Job?.consignee?.name}</b></td>
                  <td style={{width:150}}><b>{x.SE_Job?.sales_representator?.name}</b></td>
                  <td style={{ maxWidth: 70 }}>{x.SE_Job?.shipping_line?.name}</td>
                  <td style={{ maxWidth: 70 }}>{x.SE_Job?.vessel?.name}</td>
                  <td style={{ maxWidth: 70 }}>{x.SE_Job?.fd}</td>
                  <td style={{width:20}}>{x.SE_Job?.subType}</td>
                  <td style={{width:20}}>{x.freightType}</td>
                  <td style={{width:20}}>{x.SE_Job?.weight}</td>
                  <td style={{width:20}}>{x.SE_Job?.vol}</td>
                  <td style={{width:20}}>{x.currency}</td>
                  <td style={{ textAlign: 'right' }} >{x.payType == "Recievable" ?commas(x.total):'-'}</td>
                  <td style={{ textAlign: 'right' }} >{x.payType != "Recievable" ?commas(x.total):'-'}</td>
                  <td style={{ textAlign: 'right' }} >{x.payType == "Recievable" ?commas(x.recieved):commas(x.paid)}</td>
                  <td style={{ textAlign: 'right' }} >{commas(x.balance)}</td>
                  <td style={{ width: 1 }}>{getAge(x.createdAt)+1}</td>
                </tr>
              )}) : 
              // print mode 
              currentRecords.map((x, i) => {
                  return (
                  <tr key={i}>
                    <td style={{ maxWidth: 30 }}>{i + 1}</td>
                    <td style={{ maxWidth: 90, paddingLeft: 3, paddingRight: 3, cursor:"pointer"}} className="blue-txt"
                      onClick={async ()=>{
                        await Router.push(`/reports/invoice/${x.id}`)
                        dispatch(incrementTab({ "label": "Invoice Details", "key": "2-11", "id":`${x.id}` }))
                      }}
                    >{x.invoice_No}</td>
                    <td style={{}}>{x.createdAt}</td>
                    <td style={{}}>{x.hbl}</td>
                    <td style={{}}>{x.party_Name}</td>
                    <td style={{ maxWidth: 90 }}>{x.fd}</td>
                    <td style={{}}>{x.freightType}</td>
                    <td style={{}}>{x.currency}</td>
                    <td style={{ textAlign: 'right' }} >{x.payType == "Recievable" ? x.total : "-"}</td>
                    <td style={{ textAlign: 'right' }} >{x.payType != "Recievable" ? x.total : "-"}</td>
                    <td style={{ textAlign: 'right' }} >{x.payType == "Recievable" ? x.recieved : x.paid}</td>
                    <td style={{ textAlign: 'right' }} >{x.payType != "Recievable" ? (`${x.balance}`) : x.balance}</td>
                    <td style={{ textAlign: 'center' }}>{x.age}</td>
                  </tr>
                  )
              })}
              {/* in print */}
              {!overflow && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'right' }}><b>Total</b></td>
                  <td style={{ textAlign: 'right' }}>{getTotal("Recievable", result.result)}</td>
                  <td style={{ textAlign: 'right' }}>{getTotal("Payble", result.result)}</td>
                  <td style={{ textAlign: 'right' }}>{paidReceivedTotal(result.result)}</td>
                  <td style={{ textAlign: 'right' }}>{balanceTotal(result.result)}</td>
                  <td style={{ textAlign: 'center' }}>-</td>
                </tr>
              )}
              {/* showing total in the last page  */}
              {/* {//console.log(overflow, currentPage, noOfPages)} */}
              {overflow && currentPage === noOfPages && (
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td colSpan={8} style={{ textAlign: 'right' }}><b>Total</b></td>
                  {/* {//console.log(getTotal("Recievable", result.result), getTotal("Payble", result.result))} */}
                  <td style={{ textAlign: 'right' }}>{getTotal("Recievable", result.result)}</td>
                  <td style={{ textAlign: 'right' }}>{getTotal("Payble", result.result)}</td>
                  {/* <td style={{ textAlign: 'right' }}>{paidReceivedTotal(result.result)}</td> */}
                  <td style={{ textAlign: 'right' }}>{paidReceivedTotal(result.result)}</td>
                  <td style={{ textAlign: 'right' }}>{balanceTotal(result.result)}</td>
                  <td style={{ textAlign: 'center' }}>-</td>
                </tr>
              )}
            </tbody>
          </Table>
          </div>
          {overflow && <div className="d-flex justify-content-end mt-4">
            <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
          </div>
          }
        </>
      }
      {result.result.length == 0 && <>No Similar Record</>}
      </>
    }
    {load && <div className='text-center py-5 my-5'> <Spinner /> </div>}
    </>
  )}

  function dateCellFormatter(params) {
    const date = moment(params.value);
    return date.isValid() ? date.format('DD-MMM-YYYY') : null;
}

  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState([
    { headerName: '#', field: 'no' },
    { headerName: 'Inv. No', field: 'invoice_No', filter: true,
          cellRenderer: params => {
              return <span style={{cursor:"pointer"}} onClick={ async()=>{
                  await Router.push(`/reports/invoice/${params.data.id}`)
                  dispatch(incrementTab({ "label": "Invoice Details", "key": "2-11", "id":`${params.data.id}` }))
              }}>{params.data.invoice_No}</span>;
          }
        },
    { headerName: 'Invoice Date', field: 'createdAt', filter: true },
    { headerName: 'Job. No', field: 'SE_Job.jobNo', filter: true},
    { headerName: 'Job Date', field: 'SE_Job.jobDate', filter: true,
      cellRenderer: dateCellFormatter
    },
    { headerName: 'HBL/HAWB', field: 'SE_Job.Bl.hbl', filter: true },
    { headerName: 'MBL/MAWB', field: 'SE_Job.Bl.mbl', filter: true },
    { headerName: 'Sailing Date', field: 'SE_Job.shipDate', filter: true ,
      cellRenderer: dateCellFormatter
    },
    { headerName: 'Arrival Date', field: 'SE_Job.arrivalDate', filter: true ,
      cellRenderer: dateCellFormatter
    },
    { headerName: 'Voyage/Flight', field: 'SE_Job.Voyage.voyage', filter: true },
    { headerName: 'Client', field: 'party_Name', filter: true },
    { headerName: 'Client Code', field: 'SE_Job.Client.code', filter: true },
    { headerName: 'Shipper', field: 'SE_Job.shipper.name', filter: true },
    { headerName: 'Consignee', field: 'SE_Job.consignee.name', filter: true },
    { headerName: 'Sales Representator', field: 'SE_Job.sales_representator.name', filter: true },
    { headerName: 'Shipping Line', field: 'SE_Job.shipping_line.name', filter: true },
    { headerName: 'Vessel', field: 'SE_Job.vessel.name', filter: true },
    { headerName: 'F. Dest', field: 'SE_Job.fd', filter: true },
    { headerName: 'J/Tp', field: 'SE_Job.subType', filter: true },
    { headerName: 'F/Tp', field: 'ppcc', filter: true },
    { headerName: 'Containers', field: 'containers', filter: true },
    { headerName: 'Weight', field: 'SE_Job.weight', filter: true },
    { headerName: 'Vol', field: 'SE_Job.vol', filter: true },
    { headerName: 'Curr', field: 'currency', filter: true },
    { headerName: 'File No', field: 'SE_Job.fileNo', filter: true },
    {headerName: 'Debit', field: 'total', filter: true,
      cellRenderer: params => {
        return <>{params.data.payType != "Payble" ? commas(params.value) : "0"}</>;
      }
    },
    {
      headerName: 'Credit', field: 'total1', filter: true,
      cellRenderer: params => {
        return <>{params.data.payType == "Payble" ? commas(params.value) : "0"}</>;
      }
    },
    // {
    //   headerName: 'Paid/Rcvd', field: 'paid', filter: true,
    //   cellRenderer: params => {
    //     return <>{commas(params.data.payType == "Payble" ? params.data.paid : params.data.recieved)}</>;
    //   }
    // },
    {
      headerName: 'Paid/Rcvd', field: 'recieved', filter: true,
      cellRenderer: params => {
        return <>{commas(params.data.payType == "Payble" ? params.data.paid : params.data.recieved)}</>;
      }
    },
    {
      headerName: 'Balance', field: 'balance', filter: true,
      cellRenderer: params => {
        return <>{commas(params.value)}</>;
      }
    },
    { headerName: 'Age', field: 'age', filter: true },
    { headerName: 'Company Name', field: 'company', filter: true },
    { headerName: 'Customer Ref #', field: 'customerRef', filter: true },
  ]);
  
  const defaultColDef = useMemo(() => ({ 
    sortable: true,
    resizable: true,
    filter: "agTextColumnFilter",
    floatingFilter: true,
  }));
  const getRowHeight = 38;


  return (
  <div className='base-page-layout'>
    {query.report == "viewer" && (
      <>
        <ReactToPrint content={() => inputRef} trigger={() => <AiFillPrinter className="blue-txt cur fl-r" size={30} />} />
        {/* <---- Excel Download button ----> */}
        <div className="d-flex justify-content-end " >
          <label style={{display:"flex", alignItems:"center"}}>
            <span style={{marginRight:5}}>Show Aging</span>
            <input type="checkbox" checked={aging} onChange={(e) => setAging(e.target.checked)}></input>
          </label>
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </>
    )}
    {query.report != "viewer" && (
      <>
        {/* <ReactToPrint content={() => inputRef} trigger={() => <AiFillPrinter className="blue-txt cur fl-r" size={30} />} /> */}
        {/* <---- Excel Download button ----> */}
        <div className="d-flex justify-content-end " style={{paddingBottom: 10}}>
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcelGrid}>
            Export to Excel
          </button>
        </div>
      </>
    )}
    {/* <---- Reports View only ----> */}
    {query.report == "viewer" && <TableComponent overflow={true}/>}
    {/* <---- list View only with filteration ----> */}
    {query.report != "viewer" &&
    <div className="ag-theme-alpine" style={{ width: "100%", height: '72vh' }}>
      {/* {//console.log(records)} */}
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
        <TableComponent overflow={true}/>
        <div style={{ position: 'absolute', bottom: 10 }}>Printed On: {`${moment().format("YYYY-MM-DD")}`}</div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>Printed By: {username}</div>
      </div>
    </div>
  </div>
  )
};

export default React.memo(JobBalancingReport)