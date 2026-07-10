import React, { useEffect, useState } from "react";
import moment from "moment";
import MainTable from "./MainTable";
import { Spinner } from "react-bootstrap";

const LedgerReport = ({ voucherData, from, to, name, company, currency }) => {
  const [ledger, setLedger] = useState([]);
  const [opening, setOpening] = useState(0.0);
  const [closing, setClosing] = useState(0.0);
  const [openingVoucher, setOpeningVoucher] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setOpening(0.0);
    setClosing(0.0);
    setOpeningVoucher({});
    setLedger([]);

    const result = Array.isArray(voucherData?.result) ? voucherData.result : [];

    if (!name || voucherData?.status !== "success" || result.length === 0) {
      setLoading(false);
      return;
    }

    const isPKR = currency === "PKR";

    // For foreign-currency ledgers, exclude system accounts
    const rows = isPKR
      ? result
      : result.filter(
          (x) =>
            x.accountType !== "Gain/Loss Account" && x.accountType !== "General"
        );

    const fromDate = moment(from, "DD-MM-YYYY");
    const toDate = moment(to, "DD-MM-YYYY");

    const getAmount = (y) => {
      const raw = isPKR ? y.defaultAmount : y.amount;
      const parsed = parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const signedAmount = (y) =>
      y.type === "debit" ? getAmount(y) : -getAmount(y);
    const isExRateEntry = (y) => !isPKR && y.narration?.includes("Ex-Rate");

    // Pass 1: split rows into opening (before `from`) and in-range (from..to inclusive)
    let openingBalance = 0;
    let openingVoucherEntry = null;
    const inRange = [];

    rows.forEach((y) => {
      const createdAt = moment(y.createdAt);
      if (createdAt.isBetween(fromDate, toDate, "day", "[]")) {
        inRange.push(y);
      } else if (createdAt.isBefore(fromDate, "day")) {
        if (y["Voucher.vType"] === "OP") {
          openingVoucherEntry = y;
        }
        openingBalance += signedAmount(y);
      }
      // Entries after `to` are ignored entirely — they belong to neither
      // the opening balance nor the report period.
    });

    // Pass 2: build ledger rows with a running balance seeded from the opening
    let runningBalance = openingBalance;
    const ledgerRows = [];

    inRange.forEach((y) => {
      if (isExRateEntry(y)) return;

      runningBalance += signedAmount(y);

      const chequeTemp =
        y["Voucher.chequeNo"] +
        " | " +
        moment(y["Voucher.chequeDate"]).format("DD-MM-YYYY");

      ledgerRows.push({
        date: y.createdAt,
        voucherType: y["Voucher.type"],
        vouchervType: y["Voucher.vType"],
        voucherId: y["Voucher.id"],
        amount: getAmount(y),
        checkDets:
          chequeTemp.includes("null") || chequeTemp.includes("Invalid")
            ? ""
            : chequeTemp,
        balance: runningBalance,
        voucher: y["Voucher.voucher_Id"],
        type: y.type,
        narration: y.narration,
      });
    });

    setOpening(openingBalance);
    setClosing(ledgerRows.length > 0 ? runningBalance : 0);
    if (openingVoucherEntry) setOpeningVoucher(openingVoucherEntry);
    setLedger(ledgerRows);
    setLoading(false);
  }, [voucherData, from, to, name, company, currency]);

  return (
    <div className="base-page-layout">
      {!loading && ledger.length > 0 && (
        <MainTable
          ledger={ledger}
          closing={closing}
          opening={opening}
          openingVoucher={openingVoucher}
          name={name}
          company={company}
          currency={currency}
          from={from}
          to={to}
        />
      )}
      {loading && (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spinner animation="border" role="status" />
        </div>
      )}
    </div>
  );
};

export default React.memo(LedgerReport);
