import React, { useEffect, useMemo, useCallback, useState } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table } from "react-bootstrap";
import Pagination from "Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { Row } from "antd";

const Comparitive = ({ query, result }) => {
  const report = query?.reportType;

  useEffect(() => {
    console.log("Income Statement", result)
    console.log("Income Statement", query)
  }, [query, result]);

const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}


  // main render
  return (
    <>
      <PrintTopHeader company={query.company} report={report} query={query} from={moment(query.from).format('DD-MM-YYYY')} to={moment(query.to).format('DD-MM-YYYY')}/>
      
    </>
  );
};

export default React.memo(Comparitive);
