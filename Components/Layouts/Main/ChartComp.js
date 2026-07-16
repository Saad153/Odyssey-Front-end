"use client"
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import moment from "moment";
import axiosClient from 'apis/axiosClient';

// Validated against scripts/validate_palette.js (light mode): all checks pass.
const COLOR_INCOME = '#1D90C5';
const COLOR_EXPENSE = '#D4442E';
const COLOR_CASHFLOW = '#0696AC';

const baseOptions = (title, colors) => ({
  chart: {
    height: 320,
    type: 'line',
    toolbar: { show: false },
  },
  colors,
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  title: { text: title, align: 'left' },
  grid: {
    borderColor: '#e7e7e7',
    row: { colors: ['#f8f8f8', 'transparent'], opacity: 0.5 },
  },
  markers: { size: 0, hover: { size: 5 } },
  tooltip: { shared: true, intersect: false, y: { formatter: (v) => (v || 0).toLocaleString() } },
  xaxis: { categories: [], title: { text: 'Month' }, labels: { rotate: -45 } },
  yaxis: { title: { text: 'Amount' }, labels: { formatter: (v) => (v || 0).toLocaleString() } },
});

const ChartComp = ({ type }) => {

  const [incomeExpense, setIncomeExpense] = useState({
    series: [{ name: 'Income', data: [] }, { name: 'Expense', data: [] }],
    options: baseOptions('Income & Expense', [COLOR_INCOME, COLOR_EXPENSE]),
  });
  const [cashFlow, setCashFlow] = useState({
    series: [{ name: 'Cash Flow', data: [] }],
    options: baseOptions('Cash Flow', [COLOR_CASHFLOW]),
  });

  useEffect(() => { getCashFlow() }, [])

  async function getCashFlow() {
    await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CASH_FLOW_TWO, {}).then((res) => {
      if (res.data.status !== 'success') {
        console.error('getCashFlowTwo returned an error:', res.data.result);
        return;
      }
      const rows = res.data.result || [];

      // Bucket by month (key = YYYY-MM so it sorts chronologically across
      // year boundaries).
      const buckets = {};
      rows.forEach((x) => {
        const key = moment(x.createdAt).format('YYYY-MM');
        const rawAmount = parseFloat(x['Invoice_Transactions.amount']) || 0;
        // Invoice_Transactions.amount is stored in the voucher's original
        // currency, not PKR (unlike Voucher_Heads, which also stores a
        // PKR-converted defaultAmount) - convert here using the voucher's
        // own exRate so a non-PKR transaction (e.g. a USD Agent Invoice
        // settlement) isn't summed as if its raw number were PKR.
        const rate = (!x.currency || x.currency === 'PKR') ? 1 : (parseFloat(x.exRate) || 1);
        const amount = rawAmount * rate;
        if (!buckets[key]) {
          buckets[key] = { income: 0, expense: 0 };
        }
        if (x.type === 'Job Reciept') {
          buckets[key].income += amount;
        } else if (x.type === 'Job Payment') {
          buckets[key].expense += amount;
        }
      });

      // Anchor the 12-month window to the most recent transaction date
      // rather than today's wall-clock date - otherwise, against a demo/
      // restored copy with no very recent activity, "last 12 months" would
      // overlap none of the actual data and render an empty chart.
      const latest = rows.reduce(
        (max, x) => (moment(x.createdAt).isAfter(max) ? moment(x.createdAt) : max),
        rows.length ? moment(rows[0].createdAt) : moment()
      );

      // Always show exactly the last 12 calendar months (relative to the
      // latest activity), even ones with no activity (shown as 0), rather
      // than only whatever months had data.
      const last12 = [];
      for (let i = 11; i >= 0; i--) {
        const m = moment(latest).subtract(i, 'months');
        last12.push({ key: m.format('YYYY-MM'), label: m.format('MMM-YY') });
      }

      const labels = last12.map((m) => m.label);
      const income = last12.map((m) => Math.round(buckets[m.key]?.income || 0));
      const expense = last12.map((m) => Math.round(buckets[m.key]?.expense || 0));
      const net = last12.map((m) => Math.round((buckets[m.key]?.income || 0) - (buckets[m.key]?.expense || 0)));

      setIncomeExpense({
        series: [{ name: 'Income', data: income }, { name: 'Expense', data: expense }],
        options: {
          ...baseOptions('Income & Expense', [COLOR_INCOME, COLOR_EXPENSE]),
          xaxis: { categories: labels, title: { text: 'Month' }, labels: { rotate: -45 } },
        },
      });
      setCashFlow({
        series: [{ name: 'Cash Flow', data: net }],
        options: {
          ...baseOptions('Cash Flow', [COLOR_CASHFLOW]),
          xaxis: { categories: labels, title: { text: 'Month' }, labels: { rotate: -45 } },
        },
      });
    }).catch((err) => {
      console.error('getCashFlowTwo request failed:', err);
    })
  }

  return (
    <div>
      {type === "One" && <Chart options={incomeExpense.options} series={incomeExpense.series} type="line" width="100%" height={320} />}
      {type === "Two" && <Chart options={cashFlow.options} series={cashFlow.series} type="line" width="100%" height={320} />}
    </div>
  )
}

export default ChartComp;
