import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import { Table, Row, Col } from "react-bootstrap";
import Pagination from "/Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";

const Summary = ({ query, result }) => {

  const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
  return (                          
    <>
          {/* <PrintTopHeader company={query.company} query={query} /> */}
          
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
   </>
     );
   };
   
   export default React.memo(Summary);