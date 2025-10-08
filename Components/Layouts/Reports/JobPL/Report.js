import { recordsReducer, initialState, companies, fetchData, plainOptions, excelDataFormatter } from './states';
import React, { useReducer, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Sheet from './Sheet';
import PrintTopHeader from '../../../Shared/PrintTopHeader';
import Cookies from "js-cookie";
import ReactToPrint from 'react-to-print';
import { AiFillPrinter } from "react-icons/ai";
import moment from 'moment';
import { Spinner } from "react-bootstrap";
import { AgGridReact } from 'ag-grid-react';
import { CSVLink } from "react-csv";
import ExcelJS from "exceljs";


const Report = ({ query }) => {

  let inputRef = useRef(null);
  const [username, setUserName] = useState("");

  const setCommas = (val) => val? val.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", "):'0'
  
  const set = (obj) => dispatch({ type: 'set', payload: obj });
  const [state, dispatch] = useReducer(recordsReducer, initialState);

  useEffect(() => {
    getValues();
  }, []);

  console.log(state)

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
      { header: 'Job. #', key: 'jobNo', width: 20  },
      { header: 'Job Date', key: 'jobDate', width: 15  },
      { header: 'HBL.No/HAWB', key: 'hbl', width: 20  },
      { header: 'Client', key: 'client', width: 35 },
      { header: 'Shipper', key: 'shipper', width: 35  },
      { header: 'Local Agent', key: 'localAgent', width: 35  },
      { header: 'Final Dest.', key: 'finalDestination', width: 20  },
      { header: 'Type', key: 'type', width: 10  },
      { header: 'Cnts', key: 'containers', width: 25  },
      { header: 'WT', key: 'weight', width: 10  },
      { header: 'Vol', key: 'volume', width: 10  },
      { header: 'Revenue', key: 'revenue', width: 15  },
      { header: 'Cost', key: 'cost', width: 15  },
      { header: 'Profit / Loss', key: 'profitLoss', width: 15  },
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
        horizontal: 'center',
        vertical: 'middle'
      };
    });
    const data = state?.records
      .map((x, i) => ({
        index: i + 1,
        jobNo: x.jobNo,
        jobDate: moment(x.createdAt).format("MM/DD/YY"),
        hbl: x.Bl?.hbl,
        client: x.Client.name,
        shipper: x.shipper.name,
        localAgent: x.local_vendor.name,
        finalDestination: x.fd,
        type: x.jobType,
        containers: x?.SE_Job?.operation,
        weight: x.weight,
        volume: x.vol,
        revenue: x.revenue,
        cost: x.cost,
        profitLoss: x.pnl
      }));

  
      worksheet.addRows(data);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
      worksheet.insertRow(1, ['', '', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
      query.company=='1' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics']);
      query.company=='2' && worksheet.insertRow(1, ['', '', '', 'Air Cargo Services']);
      query.company!='1' && query.company!='2' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics & Air Cargo Services']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);

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
      link.download = 'JobP&L.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    }catch(e){
      console.log(e)
      console.error(e)
    }
  
    
  };

  async function getValues() {
    await set({
      from:query.from,
      to:query.to
    });
    let name = await Cookies.get("username");
    setUserName(name);
    await fetchData(set, query)
  }
  
  const TableComponent = ({ overflow, fontSize }) => {
    return (
      <>
        <PrintTopHeader company={query.company} />
        <hr className='mb-2' />
        <Sheet state={state} overflow={overflow} fontSize={fontSize} />
      </>
    )
  }

  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState([
    { headerName: 'Job No', field: 'jobNo', width: 120, filter: true },
    {
      headerName: 'Date', field: 'createdAt', width: 70, filter: true,
      cellRenderer: params => {
        return <>
          {moment(params.value).format("MM/DD/YY")}
        </>;
      }
    },
    {
      headerName: 'HBL / HAWB', field: 'Bl.hbl', width: 120, filter: true,
   
    },
    {
      headerName: 'Client', field: 'hbl',width: 70, filter: true,
      cellRenderer: params => {
        return <>
          {params.data.Client.name}
        </>;
      }
    },
    {
      headerName: 'SubType', field: 'subType', width: 120, filter: true,
   
    },
    { headerName: 'F. Dest', field: 'fd', width: 100, filter: true },
    { headerName: 'Shipper', field: 'shipper.name', width: 100, filter: true },

    { headerName: 'Local Agent', field: 'local_vendor.name', width: 100, filter: true },
    { headerName: 'Type', field: 'jobType', width: 100, filter: true },
    { headerName: 'Weight', field: 'weight', width: 100, filter: true },

    {
      headerName: 'Revenue', field: 'revenue',width: 70, filter: true,
      cellRenderer: params => {
        return <>
          {setCommas(params.value)}
        </>;
      }
    },
    {
      headerName: 'Cost', field: 'cost', width: 70,filter: true,
      cellRenderer: params => {
        return <>
          {setCommas(params.value)}
        </>;
      }
    },
    {
      headerName: 'P/L', field: 'actual', fiwidth: 70,lter: true,
      cellRenderer: params => {
        return <span>
          {setCommas(params.value)}
        </span>;
      }
    },
    {
      headerName: 'Gain/Loss', field: 'gainLoss',width: 70, filter: true,
      cellRenderer: params => {
        return <span style={{ color: params.data.gainLoss < 0 ? 'crimson' : 'green' }}>
          {setCommas(params.value < 0 ? params.value * -1 : params.value)}
        </span>;
      }
    },
    {
      headerName: 'After Gain/Loss', field: 'after', width: 70,filter: true,
      cellRenderer: params => {
        return <span>
          {setCommas(params.value)}
        </span>;
      }
    }

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
      {/* <---- Reports View only , setting overflow to true ----> */}
      {query.report == "viewer" && <>
        <ReactToPrint content={() => inputRef} trigger={() => <AiFillPrinter className="blue-txt cur fl-r" size={30} />} />
        {/* {state.csvData.length > 0 && <div className="d-flex justify-content-end " >
          <CSVLink data={state.csvData}  className="btn-custom mx-2 fs-11 text-center" style={{ width: "110px", float: 'left' }}>
            Excel
          </CSVLink>
        </div>} */}
        <div className="d-flex justify-content-end " >
          <button className="btn-custom-green px-3 mx-2" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
        {!state.load &&
          <>
            <PrintTopHeader company={query.company} />
            <hr className='mb-2' />
            <Sheet state={state} overflow={true} />
          </>
        }
        {state.load && <Spinner />}
      </>
      }
      {/* <---- list View only with filteration ----> */}
      {query.report != "viewer" &&
        <div className="ag-theme-alpine" style={{ width: "100%", height: '72vh' }}>
          <AgGridReact
            ref={gridRef} // Ref for accessing Grid's API
            rowData={state.records} // Row Data for Rows
            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties
            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
            rowSelection='multiple' // Options - allows click selection of rows
            getRowHeight={getRowHeight}
          />
        </div>
      }
      {/* <---- Component that will be displaying in print mode  ----> */}
      <div style={{ display: 'none' }}>
        <div className="pt-5 px-3" ref={(response) => (inputRef = response)}>
          {/* <---- Setting overflow true while in printing ----> */}
          <TableComponent overflow={false} fontSize={10} />
          {/* <---- footer ----> */}
          <div style={{ position: 'absolute', bottom: 10 }}>Printed On: {`${moment().format("YYYY-MM-DD")}`}</div>
          <div style={{ position: 'absolute', bottom: 10, right: 10 }}>Printed By: {username}</div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Report)