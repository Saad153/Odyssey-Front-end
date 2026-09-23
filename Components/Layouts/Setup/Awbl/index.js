import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Row, Col, Table, Spinner } from 'react-bootstrap';
import { Input, Select, Radio, Pagination, Tag, Popconfirm, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import openNotification from 'Components/Shared/Notification';
import { describeSaveError } from 'functions/saveErrorMessage';
import { getAwblList, deleteAwbl } from 'apis/awbl';
import { getJobValues } from 'apis/jobs';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import RegisterModal from './RegisterModal';
import PrintList from './PrintList';

const PAGE_SIZE = 20;

const Awbl = () => {
  // Deliberately no company here. AWB stock belongs to the group, so the list,
  // the unused pool and the printout are the same whichever company is
  // selected - naming one on the sheet would imply the numbers were its own.

  // Airlines are ordinary parties whose `types` contains 'Air Line'; getValues
  // already groups them, so this reuses that cached list rather than adding
  // another endpoint.
  const { data: values } = useQuery({ queryKey: ['values'], queryFn: getJobValues });
  const airlines = values?.result?.vendor?.airLine || [];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [airlineId, setAirlineId] = useState(undefined);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Printing pulls the whole filtered set, not just the page on screen, so it
  // has its own row state. `pendingPrint` bridges the gap between the data
  // arriving and the browser dialog opening - printing has to wait until the
  // hidden sheet has actually rendered, which is a paint later.
  const [printRows, setPrintRows] = useState([]);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `AWB Numbers ${new Date().toISOString().slice(0, 10)}`,
  });

  // Every filter change goes back to the server; nothing is filtered in the
  // browser, so the page stays responsive with tens of thousands of numbers.
  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const res = await getAwblList({
        page: opts.page ?? page,
        limit: PAGE_SIZE,
        search: opts.search ?? search,
        airlineId: opts.airlineId ?? airlineId,
        status: opts.status ?? status,
      });
      if (res.status === 'success') {
        setRows(res.result.rows);
        setTotal(res.result.count);
      } else {
        openNotification('Error', res.result || 'Could not load AWB numbers.', 'red', 8);
      }
    } catch (err) {
      openNotification('Error', describeSaveError(err, 'Could not load AWB numbers.'), 'red', 10);
    } finally {
      setLoading(false);
    }
  }, [page, search, airlineId, status]);

  useEffect(() => { load({ page: 1 }); setPage(1); }, [airlineId, status]);

  // Debounced so typing a number doesn't fire a request per keystroke.
  const searchTimer = useRef(null);
  const onSearchChange = (value) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      load({ page: 1, search: value });
    }, 400);
  };

  // Fetch everything matching the current filters, then print once it is on
  // the page. Doing it in an effect (rather than a timeout after setState)
  // guarantees the sheet exists before the dialog opens.
  const onPrint = async () => {
    setPrintLoading(true);
    try {
      const res = await getAwblList({ search, airlineId, status, all: true });
      if (res.status === 'success') {
        setPrintRows(res.result.rows);
        setPendingPrint(true);
      } else {
        openNotification('Error', res.result || 'Could not build the print list.', 'red', 8);
      }
    } catch (err) {
      openNotification('Error', describeSaveError(err, 'Could not build the print list.'), 'red', 10);
    } finally {
      setPrintLoading(false);
    }
  };

  useEffect(() => {
    if (!pendingPrint) return;
    setPendingPrint(false);
    handlePrint();
  }, [pendingPrint, printRows]);

  const onDelete = async (row) => {
    try {
      const res = await deleteAwbl({ id: row.id });
      if (res.status === 'success') {
        openNotification('Deleted', `${row.formatted} removed.`, 'green');
        load();
      } else {
        openNotification('Not Deleted', res.result || 'Could not delete.', 'red', 10);
      }
    } catch (err) {
      openNotification('Not Deleted', describeSaveError(err, 'Could not delete.'), 'red', 10);
    }
  };

  return (
    <div className='base-page-layout'>
      <Row className='align-items-center'>
        {/* .btn-custom is display:flex, which makes each button block-level -
            two of them side by side stack unless they sit in a flex row. */}
        <Col md={4}>
          <div className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
            <button className='btn-custom' style={{ whiteSpace: 'nowrap' }}
              onClick={() => setRegisterOpen(true)}>
              Register AWB
            </button>
            <button className={printLoading || !total ? 'btn-custom-disabled' : 'btn-custom-blue'}
              style={{ whiteSpace: 'nowrap' }}
              onClick={onPrint} disabled={printLoading || !total}>
              {printLoading ? 'Preparing...' : 'Print'}
            </button>
          </div>
        </Col>
        <Col md={3}>
          <Select allowClear showSearch style={{ width: '100%' }} placeholder='All airlines'
            value={airlineId} onChange={setAirlineId} optionFilterProp='label'
            options={airlines.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Col>
        <Col md={2}>
          <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)}>
            <Radio.Button value='all'>All</Radio.Button>
            <Radio.Button value='unused'>Unused</Radio.Button>
            <Radio.Button value='used'>Used</Radio.Button>
          </Radio.Group>
        </Col>
        <Col md={3}>
          <Input.Search allowClear placeholder='Search AWB number'
            value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </Col>
      </Row>
      <hr />

      <Spin spinning={loading}>
        <div style={{ minHeight: 420 }}>
          <Table className='tableFixHead' style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Sr.</th><th>AWB Number</th><th>Airline</th>
                <th>Status</th><th>Job No</th><th>Party</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className='blue-txt fw-7'>{row.formatted}</td>
                  <td>{row.airline}</td>
                  <td>
                    <Tag color={row.status === 'used' ? 'red' : row.status === 'void' ? 'default' : 'green'}>
                      {row.status}
                    </Tag>
                  </td>
                  <td>{row.jobNo || '-'}</td>
                  <td>{row.party || '-'}</td>
                  <td>
                    {row.status !== 'used' &&
                      <Popconfirm title={`Delete ${row.formatted}?`} onConfirm={() => onDelete(row)}
                        okText='Delete' cancelText='Cancel'>
                        <DeleteOutlined style={{ color: 'crimson', cursor: 'pointer' }} />
                      </Popconfirm>
                    }
                  </td>
                </tr>
              ))}
              {!rows.length && !loading &&
                <tr><td colSpan={7} className='text-center py-5'>
                  {search || airlineId || status !== 'all'
                    ? 'No AWB numbers match these filters.'
                    : 'No AWB numbers registered yet.'}
                </td></tr>
              }
            </tbody>
          </Table>
        </div>
      </Spin>

      <div className='d-flex justify-content-end mt-2'>
        <Pagination current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false}
          showTotal={(t) => `${t} number${t === 1 ? '' : 's'}`}
          onChange={(p) => { setPage(p); load({ page: p }); }}
        />
      </div>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)}
        onSaved={() => load({ page: 1 })} airlines={airlines}
      />

      {/* Kept in the DOM but off-screen rather than display:none - react-to-print
          clones the live node, and a node that was never laid out clones empty.
          Positioning it away is what makes the sheet render without showing. */}
      <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden='true'>
        <PrintList
          ref={printRef}
          rows={printRows}
          filters={{
            airlineName: airlines.find((a) => a.id === airlineId)?.name || '',
            status,
            search,
          }}
        />
      </div>
    </div>
  );
};

export default Awbl;
