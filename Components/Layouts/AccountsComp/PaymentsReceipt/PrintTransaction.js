import { Col, Row, Table } from 'react-bootstrap';
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import numToWords from 'functions/numToWords';

const commas = (a) => parseFloat(a || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const companyDetails = {
  1: {
    name: 'SEA NET SHIPPING & LOGISTICS',
    logo: '/seanet-logo.png',
    address: 'PLOT NO. A-230, BLOCK 2, P.E.C.H.S NEAR JHEEL PARK, KARACHI, PAKISTAN',
    tel: 'Tel: 9221 34395444-55-66   Fax: 9221 34385001',
    email: 'info@seanetpk.com',
    web: 'www.seanetpk.com',
    ntn: '8271203-5',
  },
  2: {
    name: 'CARGO LINKERS',
    logo: null,
    address: 'F-50 BLOCK-6 SHAHRAH-E-FAISAL KARACHI',
    tel: '',
    email: '',
    web: '',
    ntn: '5322935-2',
  },
  3: {
    name: 'AIR CARGO SERVICES',
    logo: '/aircargo-logo.png',
    address: 'House# A230, PECHS, Block 2,  Karachi',
    tel: 'Tel: 9221 34395444-55-66   Fax: 9221 34385001',
    email: 'info@acs.com.pk',
    web: 'www.acs.com.pk',
    ntn: '0287230-7',
  },
};

const amountInWords = (amount, currency) => {
  const abs = Math.abs(parseFloat(amount || 0));
  const intPart = Math.floor(abs);
  const cents = Math.round((abs - intPart) * 100);
  const intWords = numToWords(intPart).replace(/ only$/i, '');
  const centWords = cents > 0 ? ` and ${numToWords(cents).replace(/ only$/i, '')} Cent` : '';
  return `${currency} ${intWords}${centWords} Only`;
};

const PrintTransaction = ({ companyId, state }) => {

  let printRef = useRef(null);
  const company = companyDetails[companyId] || companyDetails[1];

  const isReceiving = state.payType === 'Recievable';
  const partyName = state.PRaccounts?.find((x) => x.id === state.selectedAccount)?.name || '';
  const voucherNo = state.oldVouchers?.find((v) => v.id === state.voucherId)?.voucherNo || '';
  const receivingAccountTitle = state.receivingAccounts?.find((x) => x.id === state.receivingAccount)?.title || '';

  const title = `${state.type ? state.type.charAt(0).toUpperCase() + state.type.slice(1) : ''} ${isReceiving ? 'Receipt' : 'Payment'}`;

  const total = state.advance ? Math.abs(parseFloat(state.totalReceivable || 0)) : parseFloat(state.totalReceivable || 0);
  const exRate = parseFloat(state.exRate || 1);
  const localAmountTotal = state.advance
    ? total * exRate
    : state.invoices.reduce((sum, x) => sum + parseFloat(x.receiving || 0) * parseFloat(x.ex_rate || 0), 0);
  const roundingFactor = state.invoices.reduce((sum, x) => sum + parseFloat(x.roundOff || 0) * parseFloat(x.ex_rate || 0), 0);
  const bankCharges = parseFloat(state.bankChargesAmount || 0) * exRate;
  const tax = parseFloat(state.taxAmount || 0) * exRate;
  const netAmount = localAmountTotal - bankCharges - tax + roundingFactor;

  const remarks = () => {
    const modeText = state.transactionMode === 'Cash' ? 'Cash' : `Cheque # ${state.checkNo || ''}`;
    const dateText = moment(state.transactionMode === 'Cash' ? state.date : state.checkDate).format('YYYY-MM-DD');
    const invoiceList = state.invoices.map((x) => {
      const job = x?.SE_Job?.jobNo || '';
      const hbl = x?.SE_Job?.Bl?.hbl || '';
      return `${x.invoice_No}/${hbl}/${job} (${x.currency} ${parseFloat(x.receiving || 0).toFixed(2)})`;
    }).join(' ,');
    return `${isReceiving ? 'Received' : 'Paid'} ${modeText} Dated ${dateText} Against ${state.currency}${invoiceList ? `\nInv/HBL/Job No(s) ${invoiceList}` : ''} ${isReceiving ? 'From' : 'To'} ${partyName}`;
  };

  const row = { marginBottom: 3 };
  const label = { fontSize: 9, color: '#666' };
  const value = { fontSize: 10 };

  const Field = ({ labelText, valueText }) => (
    <span style={{ display: 'inline-block', marginRight: 28, verticalAlign: 'top', maxWidth: '100%' }}>
      <span style={label}>{labelText} :</span> <b style={value}>{valueText}</b>
    </span>
  );

  return (
  <div>
    <ReactToPrint content={() => printRef} trigger={() => (<div className="div-btn-custom text-center p-2 px-4">Print</div>)} />
    <div className="d-none">
      <div ref={(res) => (printRef = res)} className='payment-receipt-print-root' style={{ page: 'paymentReceiptPortrait', fontSize: 11, padding: '12mm 12mm 24mm 12mm' }}>
        <style>{`
          @media print {
            @page paymentReceiptPortrait { size: A4 portrait; margin: 0; }
            .payment-receipt-print-root { page: paymentReceiptPortrait; }
          }
          .payment-receipt-print-root .print-table { margin-bottom: 4px; }
          .payment-receipt-print-root .print-table th,
          .payment-receipt-print-root .print-table td { padding: 2px 4px; font-size: 9px; line-height: 1.25; vertical-align: middle; }
          .payment-receipt-print-root .print-table thead { display: table-header-group; }
          .payment-receipt-print-root .print-table tfoot { display: table-footer-group; }
          .payment-receipt-print-root .print-table tr { page-break-inside: avoid; }
          .payment-receipt-print-root hr { margin: 3px 0; }
        `}</style>
        <Row style={row}>
          {company.logo &&
          <Col md={2} className='text-center'>
            <img src={company.logo} style={{ filter: `invert(0.5)` }} height={55} />
          </Col>
          }
          <Col>
            <div className='text-center'>
              <div style={{ fontSize: 15, lineHeight: 1.3 }}><b>{company.name}</b></div>
              <div style={{ fontSize: 9, lineHeight: 1.3 }}>{company.address}</div>
              {company.tel && <div style={{ fontSize: 9, lineHeight: 1.3 }}>{company.tel}</div>}
              {(company.email || company.web) && <div style={{ fontSize: 9, lineHeight: 1.3 }}>Email: {company.email}   Web: {company.web}</div>}
              <div style={{ fontSize: 9, lineHeight: 1.3 }}>NTN # {company.ntn}</div>
            </div>
          </Col>
        </Row>
        <hr />
        <div className='text-center' style={{ fontSize: 12, marginBottom: 3 }}><b>{title}</b></div>
        <hr />
        <div style={{ marginBottom: 4 }}>
          <Field labelText="Voucher No" valueText={voucherNo} />
          <Field labelText="Date" valueText={moment(state.date).format('DD/MM/YYYY')} />
          <Field labelText={isReceiving ? 'Receive From' : 'Paid To'} valueText={partyName} />
        </div>
        <div style={{ marginBottom: 4 }}>
          <Field labelText="The sum of" valueText={amountInWords(total, state.currency)} />
        </div>
        <div style={{ marginBottom: 4 }}>
          <Field labelText="By" valueText={state.transactionMode} />
          <Field labelText="Cheque #" valueText={state.transactionMode === 'Cash' ? '-' : (state.checkNo || '-')} />
          <Field labelText="Cheque Date" valueText={state.transactionMode === 'Cash' ? '-' : moment(state.checkDate).format('DD/MM/YYYY')} />
          <Field labelText="Curr" valueText={state.currency} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <Field labelText={`${state.transactionMode === 'Cash' ? 'Cash' : 'Bank'} A/C`} valueText={receivingAccountTitle} />
          <Field labelText="Exch Rate" valueText={state.exRate} />
        </div>
        {state.invoices.length > 0 &&
        <Table bordered className='print-table mt-2'>
          <thead>
            <tr className='text-center'>
              <th>S#</th>
              <th>Bill/Invoice No</th>
              <th>Ref#</th>
              <th>HBL # / MBL #</th>
              <th>Job #</th>
              <th>Cont. No</th>
              <th>Bill/Invoice Settle Amount</th>
              <th>Exch Rate</th>
              <th>Local Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.invoices.map((x, index) => (
              <tr key={index} className='text-center'>
                <td>{index + 1}</td>
                <td>{x.invoice_No}</td>
                <td>{x?.SE_Job?.customerRef || ''}</td>
                <td>{[x?.SE_Job?.Bl?.hbl, x?.SE_Job?.Bl?.mbl].filter(Boolean).join(' / ')}</td>
                <td>{x?.SE_Job?.jobNo || ''}</td>
                <td>{(x?.SE_Job?.Bl?.Container_Infos || []).map((c) => c.no).join(', ')}</td>
                <td className='text-end'>{x.currency} {commas(x.receiving)}</td>
                <td>{parseFloat(x.ex_rate || 0).toFixed(2)}</td>
                <td className='text-end'>{commas(parseFloat(x.receiving || 0) * parseFloat(x.ex_rate || 0))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='text-end fw-bold'>
              <td colSpan={8}>Total :</td>
              <td>{commas(localAmountTotal)}</td>
            </tr>
          </tfoot>
        </Table>
        }
        <Row style={row} className='mt-2'>
          <Col md={3}>
            <span style={label}>Tax Amount :</span> <b style={value}>{commas(tax)}</b>
          </Col>
          <Col md={3}>
            <span style={label}>Bank Charges :</span> <b style={value}>{commas(bankCharges)}</b>
          </Col>
          <Col md={3}>
            <span style={label}>Rounding Factor :</span> <b style={value}>{commas(roundingFactor)}</b>
          </Col>
          <Col md={3}>
            <span style={label}>Net Amount :</span> <b style={value}>{commas(netAmount)}</b>
          </Col>
        </Row>
        <Row style={row}>
          <Col md={12}>
            <div style={label}><b>Remarks :</b></div>
            <div style={{ fontSize: 9, whiteSpace: 'pre-wrap' }}>{remarks()}</div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
  )
}

export default React.memo(PrintTransaction)
