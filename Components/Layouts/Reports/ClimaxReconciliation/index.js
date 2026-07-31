import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Table, Tabs, Spin } from 'antd';
import moment from 'moment';
import axiosClient from 'apis/axiosClient';
import openNotification from 'Components/Shared/Notification';

const StatCard = ({ label, value, sub, tone }) => (
  <div className='totals-box' style={{ minHeight:90 }}>
    <div className='totals-label'>{label}</div>
    <div style={{ fontSize:28, fontWeight:700, color: tone || '#1f2937' }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:'grey' }}>{sub}</div>}
  </div>
);

const dateCol = (key, title='Date') => ({
  title, dataIndex:key, key,
  render:(v) => v ? moment(v).format('DD-MMM-YYYY') : '-'
});

const ClimaxReconciliation = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastRun, setLastRun] = useState(null);

  const runCheck = async () => {
    setLoading(true);
    setError('');
    await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/reconciliation/check`).then((x) => {
      if (x.data.status === 'success') {
        setData(x.data.result);
        setLastRun(moment());
      } else {
        setError(x.data.result || 'Failed to run reconciliation check.');
        openNotification('Error', x.data.result || 'Failed to run reconciliation check.', 'red');
      }
    }).catch(() => {
      setError('Failed to run reconciliation check.');
      openNotification('Error', 'Failed to run reconciliation check.', 'red');
    });
    setLoading(false);
  };

  const jobsColumns = [
    { title:'Job Type', dataIndex:'jobType', key:'jobType', width:90 },
    { title:'Job No.', dataIndex:'jobNo', key:'jobNo' },
    dateCol('jobDate', 'Job Date'),
    { title:'Party', dataIndex:'party', key:'party' },
  ];

  const incompleteChargesColumns = [
    { title:'Job Type', dataIndex:'jobType', key:'jobType', width:90 },
    { title:'Job No.', dataIndex:'jobNo', key:'jobNo' },
    dateCol('jobDate', 'Job Date'),
    { title:'Party', dataIndex:'party', key:'party' },
    { title:'Charges in Climax', dataIndex:'chargeCount', key:'chargeCount', width:130 },
    { title:'Charges in Odyssey', dataIndex:'odysseyChargeCount', key:'odysseyChargeCount', width:140 },
  ];

  const invoicesColumns = [
    { title:'Invoice No.', dataIndex:'invoiceNo', key:'invoiceNo' },
    dateCol('date', 'Invoice Date'),
    { title:'Party', dataIndex:'party', key:'party' },
    { title:'Amount', dataIndex:'amount', key:'amount', align:'right' },
  ];

  const vouchersColumns = [
    { title:'Voucher No.', dataIndex:'voucherNo', key:'voucherNo' },
    dateCol('date', 'Voucher Date'),
    { title:'Amount', dataIndex:'amount', key:'amount', align:'right' },
  ];

  return (
    <div className='base-page-layout'>
      <div className='page-header'>
        <h4 className='fw-7 m-0'>Climax Data Reconciliation</h4>
        <div className='btn-header'>
          <button className='btn-custom my-1 px-4' type='button' disabled={loading} onClick={runCheck}>
            {loading ? 'Checking...' : 'Run Check'}
          </button>
        </div>
      </div>

      <div style={{ fontSize:13, color:'grey', marginBottom:12 }}>
        Compares Odyssey against the legacy Climax system to find jobs, invoices, and vouchers that
        haven&apos;t been entered yet, and jobs whose charges look incomplete. This calls the legacy
        Climax bridge service live, so it needs that service running to work.
        {lastRun && <span> Last run: {lastRun.format('DD-MMM-YYYY HH:mm')}.</span>}
      </div>

      {loading && <div className='text-center py-5'><Spin size='large' /></div>}

      {!loading && error &&
        <div style={{ color:'#b91c1c', background:'#fee2e2', padding:12, borderRadius:8 }}>{error}</div>
      }

      {!loading && !error && !data &&
        <div style={{ color:'grey' }}>Click &quot;Run Check&quot; to compare Odyssey against Climax.</div>
      }

      {!loading && data &&
        <>
          <Row className='mb-3'>
            <Col md={4}><StatCard label='Jobs Missing' value={data.summary.jobs.missing} sub={`of ${data.summary.jobs.legacyTotal} in Climax`} tone={data.summary.jobs.missing > 0 ? '#b91c1c' : '#15803d'} /></Col>
            <Col md={4}><StatCard label='Invoices Missing' value={data.summary.invoices.missing} sub={`of ${data.summary.invoices.legacyTotal} in Climax`} tone={data.summary.invoices.missing > 0 ? '#b91c1c' : '#15803d'} /></Col>
            <Col md={4}><StatCard label='Vouchers Missing' value={data.summary.vouchers.missing} sub={`of ${data.summary.vouchers.legacyTotal} in Climax`} tone={data.summary.vouchers.missing > 0 ? '#b91c1c' : '#15803d'} /></Col>
          </Row>
          <Row className='mb-3'>
            <Col md={4}><StatCard label='Jobs With Incomplete Charges' value={data.summary.jobs.incompleteCharges} sub='Job exists, fewer charges than Climax' tone={data.summary.jobs.incompleteCharges > 0 ? '#b45309' : '#15803d'} /></Col>
          </Row>

          <Tabs defaultActiveKey='1'>
            <Tabs.TabPane tab={`Missing Jobs (${data.missingJobs.length})`} key='1'>
              <Table
                columns={jobsColumns}
                dataSource={data.missingJobs}
                rowKey='id'
                size='small'
                pagination={{ pageSize:20 }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Incomplete Charges (${data.incompleteCharges.length})`} key='2'>
              <Table
                columns={incompleteChargesColumns}
                dataSource={data.incompleteCharges}
                rowKey='id'
                size='small'
                pagination={{ pageSize:20 }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Missing Invoices (${data.missingInvoices.length})`} key='3'>
              <Table
                columns={invoicesColumns}
                dataSource={data.missingInvoices}
                rowKey='id'
                size='small'
                pagination={{ pageSize:20 }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Missing Vouchers (${data.missingVouchers.length})`} key='4'>
              <Table
                columns={vouchersColumns}
                dataSource={data.missingVouchers}
                rowKey='id'
                size='small'
                pagination={{ pageSize:20 }}
              />
            </Tabs.TabPane>
          </Tabs>
        </>
      }
    </div>
  );
};

export default React.memo(ClimaxReconciliation);
