"use client";
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import axiosClient from 'apis/axiosClient';
import SecondaryLoader from 'Components/Shared/SecondaryLoader';

const commas = (a) => parseFloat(a || 0).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const CompanyCard = ({ title, stats }) => (
  <div className="wh-bg-round" style={{ height: '100%' }}>
    <h6 className="fw-7 top-section-heading">{title} <span className="grey-txt fs-11">(FCL/LCL: last 12 months)</span></h6>
    <div className="line" />
    <div className="mt-2">
      <span className="line-heading-blue">FCL</span>
      <span className="line-value-blue">{stats.fcl}</span>
    </div>
    <div className="mt-2">
      <span className="line-heading-blue">LCL</span>
      <span className="line-value-blue">{stats.lcl}</span>
    </div>
    <div className="mt-2">
      <span className="line-heading-red">Pending Approval <span className="grey-txt fs-11">(all-time)</span></span>
      <span className="line-value-blue">{stats.pending}</span>
    </div>
  </div>
);

const DashboardStats = () => {
  const [load, setLoad] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => { getData(); }, []);

  const getData = async () => {
    await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_DASHBOARD_DATA)
      .then((x) => {
        if (x.data.status === 'success') {
          setData(x.data.result);
        }
        setLoad(false);
      })
      .catch(() => setLoad(false));
  };

  if (load) {
    return <div className="text-center py-4"><SecondaryLoader /></div>;
  }
  if (!data) {
    return null;
  }

  // Invoice.total is stored in the invoice's own currency, not PKR - convert
  // non-PKR invoices (e.g. USD Agent Invoices) using their own ex_rate before
  // summing, same fix as the cash flow chart.
  const approvedSales = (data.invocies?.projSales || [])
    .reduce((sum, x) => {
      const rate = (!x.currency || x.currency === 'PKR') ? 1 : (parseFloat(x.ex_rate) || 1);
      return sum + (parseFloat(x.total || 0) * rate);
    }, 0);

  return (
    <>
      <Row className="timeline-container text-center">
        <Col>
          <div className="time-heading">Jobs This Week</div>
          <div className="time-value">{data.weekCount}</div>
        </Col>
        <Col>
          <div className="time-heading">Jobs This Month</div>
          <div className="time-value">{data.monthCount}</div>
        </Col>
        <Col>
          <div className="time-heading">Jobs This Year</div>
          <div className="time-value">{data.yearCount}</div>
        </Col>
        <Col>
          <div className="time-heading">Receivable Sales This Year</div>
          <div className="time-value" style={{ fontSize: 28 }}>{commas(approvedSales)}</div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6} className="mb-3">
          <CompanyCard
            title="Sea Net Shipping"
            stats={{ fcl: data.sns.snsFcl, lcl: data.sns.snsLCL, pending: data.sns.snsPending }}
          />
        </Col>
        <Col md={6} className="mb-3">
          <CompanyCard
            title="Air Cargo Service"
            stats={{ fcl: data.acs.acsFcl, lcl: data.acs.acsLCL, pending: data.acs.acsPending }}
          />
        </Col>
      </Row>
    </>
  );
};

export default DashboardStats;
