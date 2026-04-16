import React, { useRef, useEffect, useState } from "react";
import { Table as AntTable } from "antd";
import { useDispatch } from "react-redux";
import { incrementTab } from "/redux/tabs/tabSlice";
import Router from "next/router";
import { AiFillPrinter } from "react-icons/ai";
import ReactToPrint from "react-to-print";
import moment from "moment";
import Cookies from "js-cookie";
import PrintTopHeader from "/Components/Shared/PrintTopHeader";
import * as XLSX from "xlsx";

/* -----------------------------
   UTILS
------------------------------ */
const commas = (a) =>
  parseFloat(a)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* -----------------------------
   EXCEL EXPORT
------------------------------ */
const exportLedgerToExcel = ({
  dataSource,
  opening,
  closing,
  name,
  company,
  from,
  to,
}) => {
  const rows = [];

  rows.push([company]);
  rows.push([`Ledger: ${name}`]);
  rows.push([`Period: ${from} → ${to}`]);
  rows.push([]);
  rows.push([
    "Opening Balance",
    opening >= 0 ? `${commas(opening)} Dr` : `${commas(Math.abs(opening))} Cr`,
  ]);
  rows.push([]);

  rows.push([
    "#",
    "Voucher #",
    "Date",
    "Particular",
    "Cheque No | Date",
    "Debit",
    "Credit",
    "Balance",
  ]);

  dataSource.forEach((row, i) => {
    rows.push([
      i + 1,
      row.voucher,
      moment(row.date).format("DD-MM-YYYY"),
      row.narration || "",
      row.cheque || "",
      row.debit ? commas(row.debit) : "",
      row.credit ? commas(row.credit) : "",
      row.balance >= 0
        ? `${commas(row.balance)} Dr`
        : `${commas(Math.abs(row.balance))} Cr`,
    ]);
  });

  rows.push([]);
  rows.push([
    "Closing Balance",
    closing >= 0 ? `${commas(closing)} Dr` : `${commas(Math.abs(closing))} Cr`,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 12 },
    { wch: 40 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
  XLSX.writeFile(
    workbook,
    `Ledger_${name}_${moment().format("YYYYMMDD")}.xlsx`
  );
};

/* ======================================================================
   MAIN COMPONENT
====================================================================== */
const MainTable = ({
  ledger,
  closing,
  opening,
  openingVoucher,
  name,
  company,
  currency,
  from,
  to,
}) => {
  const dispatch = useDispatch();
  const printRef = useRef(null);

  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setUsername(Cookies.get("username"));
  }, []);

  /* -----------------------------
     BUILD DATA SOURCE
  ------------------------------ */
  const dataSource = [];

  if (openingVoucher && Object.keys(openingVoucher).length > 0) {
    const amount =
      currency !== "PKR"
        ? openingVoucher.amount
        : openingVoucher.defaultAmount;

    dataSource.push({
      key: "opening",
      voucher: openingVoucher["Voucher.voucher_Id"],
      date: openingVoucher.createdAt,
      narration: openingVoucher.narration,
      cheque: "",
      debit: openingVoucher.type === "debit" ? amount : null,
      credit: openingVoucher.type === "credit" ? amount : null,
      balance: amount,
      voucherId: openingVoucher["Voucher.id"],
      voucherType: openingVoucher["Voucher.type"],
      vouchervType: openingVoucher["Voucher.vType"],
    });
  }

  ledger.forEach((x, i) =>
    dataSource.push({
      key: `${x.voucherId}-${i}`,
      voucher: x.voucher,
      date: x.date,
      narration: x.narration,
      cheque: x.checkDets,
      debit: x.type === "debit" ? x.amount : null,
      credit: x.type === "credit" ? x.amount : null,
      balance: x.balance,
      voucherId: x.voucherId,
      voucherType: x.voucherType,
      vouchervType: x.vouchervType,
    })
  );

  /* -----------------------------
     SHARED COLUMNS
  ------------------------------ */
  const makeColumns = (isPrint = false) => [
    {
      title: "#",
      width: 50,
      align: "center",
      render: (_, __, index) =>
        isPrint
          ? index + 1
          : (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Voucher #", width: 140, dataIndex: "voucher", align: "center",
      render: (text, record) =>
        (
          <span
            className="blue-txt cur"
            onClick={() => {
              if (
                record.voucherType === "Job Reciept" ||
                record.voucherType === "Job Payment"
              ) {
                dispatch(
                  incrementTab({
                    label: "Payment / Receipt",
                    key: "3-4",
                    id: record.voucherId,
                  })
                );
                Router.push(`/accounts/paymentReceipt/${record.voucherId}`);
              } else if (
                record.voucherType === "Opening Reciept" ||
                record.voucherType === "Opening Payment" ||
                record.vouchervType === "OP"
              ) {
                dispatch(
                  incrementTab({
                    label: "Opening Balance",
                    key: "3-10",
                    id: record.voucherId,
                  })
                );
                Router.push(`/accounts/openingBalance/${record.voucherId}`);
              } else {
                dispatch(
                  incrementTab({
                    label: "Voucher",
                    key: "3-5",
                    id: record.voucherId,
                  })
                );
                Router.push(`/accounts/vouchers/${record.voucherId}`);
              }
            }}
          >
            {text}
          </span>
        ),
     },
    {
      title: "Date",
      width: 90,
      dataIndex: "date",
      align: "center",
      render: (d) => moment(d).format("DD-MM-YYYY"),
    },
    { title: "Particular", dataIndex: "narration" },
    { title: "Cheque No | Date", width: 190, dataIndex: "cheque" },
    {
      title: "Debit",
      width: 120,
      align: "right",
      dataIndex: "debit",
      render: (v) => v && commas(v),
    },
    {
      title: "Credit",
      width: 120,
      align: "right",
      dataIndex: "credit",
      render: (v) => v && commas(v),
    },
    {
      title: "Balance",
      width: 150,
      align: "right",
      dataIndex: "balance",
      render: (v) =>
        v >= 0 ? `${commas(v)} Dr` : `${commas(Math.abs(v))} Cr`,
    },
  ];

  /* -----------------------------
     SCREEN TABLE
  ------------------------------ */
  const ScreenTable = () => (
    <AntTable
      columns={makeColumns(false)}
      dataSource={dataSource}
      bordered
      size="small"
      pagination={{
        current: currentPage,
        pageSize,
        showSizeChanger: true,
        pageSizeOptions: [12, 20, 50, 100],
        onChange: (p, s) => {
          setCurrentPage(p);
          setPageSize(s);
        },
      }}
      scroll={{ y: "50vh", x: "85vw" }}
    />
  );

  /* -----------------------------
     PRINT TABLE
  ------------------------------ */
  const PrintTable = () => (
    <AntTable
      columns={makeColumns(true)}
      dataSource={dataSource}
      bordered
      size="small"
      pagination={false}
    />
  );

  /* -----------------------------
     RENDER
  ------------------------------ */
  return (
    <div>
      <ReactToPrint
        content={() => printRef.current}
        pageStyle="@page { size: A4 landscape; margin: 15mm; }"
        trigger={() => (
          <AiFillPrinter className="blue-txt cur fl-r" size={30} />
        )}
      />

      <div className="d-flex justify-content-end">
        <button
          className="btn-custom mx-2 fs-11"
          style={{ width: "110px" }}
          onClick={() =>
            exportLedgerToExcel({
              dataSource,
              opening,
              closing,
              name,
              company,
              from,
              to,
            })
          }
        >
          Excel
        </button>
      </div>

      <PrintTopHeader company={company} from={from} to={to} />

      <div className="d-flex justify-content-between mt-3">
        <b>{name}</b>
        <span>
          Opening:{" "}
          {opening >= 0
            ? `${commas(opening)} Dr`
            : `${commas(Math.abs(opening))} Cr`}
        </span>
      </div>

      <ScreenTable />

      <div className="d-flex justify-content-end mt-2">
        Closing:{" "}
        {closing >= 0
          ? `${commas(closing)} Dr`
          : `${commas(Math.abs(closing))} Cr`}
      </div>

      {/* PRINT CONTENT */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="print-root">
          <PrintTopHeader company={company} from={from} to={to} />
          <PrintTable />
          <div className="print-footer">
            Printed On: {moment().format("DD-MM-YYYY")} &nbsp; | &nbsp; Printed By:{" "}
            {username}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainTable);