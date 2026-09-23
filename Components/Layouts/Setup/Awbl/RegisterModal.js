import React, { useMemo, useState } from 'react';
import { Modal, Select, Input, InputNumber, Checkbox, Spin } from 'antd';
import { Row, Col } from 'react-bootstrap';
import openNotification from 'Components/Shared/Notification';
import { describeSaveError } from 'functions/saveErrorMessage';
import { registerAwbl } from 'apis/awbl';

// Mirrors functions/awbl.js on the backend so the preview below matches
// exactly what will be stored. The check digit is the 7-digit serial modulo 7,
// which is why it only ever runs 0-6: for consecutive serials it steps up by
// one and wraps straight back to 0 rather than reaching 7, 8 or 9.
const checkDigitFor = (serial) => String(Number(serial) % 7);
const padSerial = (serial) => String(serial).padStart(7, '0');
const formatNumber = (prefix, serial) =>
  `${prefix}-${padSerial(serial)}${checkDigitFor(serial)}`;

const MAX_SERIAL = 9999999;

const RegisterModal = ({ open, onClose, onSaved, airlines }) => {
  const [airlineId, setAirlineId] = useState(undefined);
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState('');
  const [series, setSeries] = useState(false);
  const [count, setCount] = useState(10);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setAirlineId(undefined);
    setPrefix('');
    setCode('');
    setSeries(false);
    setCount(10);
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  // Live preview of what will be generated, including the check-digit wrap.
  // Showing the first few and the last removes any doubt about how far a
  // series of 100 actually reaches before the user commits to it.
  const preview = useMemo(() => {
    const cleanPrefix = prefix.trim();
    const cleanCode = code.trim().replace(/[\s-]/g, '');
    if (!/^\d{3}$/.test(cleanPrefix) || !/^\d{8}$/.test(cleanCode)) return null;

    const serialPart = cleanCode.slice(0, 7);
    const typedCheck = cleanCode.slice(7);
    const expected = checkDigitFor(serialPart);
    if (typedCheck !== expected) {
      return { error: `Check digit should be ${expected}, not ${typedCheck}.` };
    }

    const start = Number(serialPart);
    const total = series ? Math.max(1, Math.floor(count) || 1) : 1;
    const last = Math.min(start + total - 1, MAX_SERIAL);
    const head = [];
    for (let s = start; s <= Math.min(start + 3, last); s++) head.push(formatNumber(cleanPrefix, s));

    return {
      head,
      last: formatNumber(cleanPrefix, last),
      total: last - start + 1,
      truncated: start + total - 1 > MAX_SERIAL,
    };
  }, [prefix, code, series, count]);

  const submit = async () => {
    if (!airlineId) return openNotification('Error', 'Select the airline first.', 'red');
    if (preview?.error) return openNotification('Error', preview.error, 'red', 8);

    setSaving(true);
    try {
      const res = await registerAwbl({ airlineId, prefix, code, series, count });
      if (res.status === 'success') {
        const { created, skipped, from, to } = res.result;
        openNotification(
          'Registered',
          created === 1
            ? `${from} added.`
            : `${created} numbers added, ${from} to ${to}.` +
              (skipped ? ` ${skipped} already existed and were skipped.` : ''),
          'green',
          8
        );
        reset();
        onSaved();
        onClose();
      } else {
        openNotification('Not Registered', res.result || 'Could not register.', 'red', 10);
      }
    } catch (err) {
      openNotification('Not Registered', describeSaveError(err, 'Could not register.'), 'red', 10);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onCancel={close} maskClosable={false} width={640}
      title="Register AWB Numbers"
      okText={saving ? 'Saving...' : 'Register'}
      onOk={submit} okButtonProps={{ disabled: saving }} cancelButtonProps={{ disabled: saving }}
    >
      <Spin spinning={saving}>
        <Row className='mb-3'>
          <Col md={12}>
            <div className='mb-1'>Airline *</div>
            <Select showSearch style={{ width: '100%' }} value={airlineId} onChange={setAirlineId}
              placeholder='Select airline'
              optionFilterProp='label'
              options={(airlines || []).map((a) => ({ value: a.id, label: a.name }))}
            />
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col md={4}>
            <div className='mb-1'>Airline Code *</div>
            <Input value={prefix} maxLength={3} placeholder='125'
              onChange={(e) => setPrefix(e.target.value.replace(/\D/g, ''))} />
            <div style={{ fontSize: 11, color: 'grey' }}>First 3 digits</div>
          </Col>
          <Col md={8}>
            <div className='mb-1'>AWB Number *</div>
            <Input value={code} maxLength={8} placeholder='10000001'
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            <div style={{ fontSize: 11, color: 'grey' }}>
              8 digits: 7-digit serial plus its check digit
            </div>
          </Col>
        </Row>
        <Row className='mb-2'>
          <Col md={5}>
            <Checkbox checked={series} onChange={(e) => setSeries(e.target.checked)}>
              Generate a series
            </Checkbox>
          </Col>
          {series &&
            <Col md={7}>
              <div className='mb-1'>How many to generate</div>
              <InputNumber min={1} max={1000} value={count} onChange={(v) => setCount(v || 1)}
                style={{ width: 140 }} />
              <div style={{ fontSize: 11, color: 'grey' }}>
                Counts forward from the number above
              </div>
            </Col>
          }
        </Row>

        {preview?.error &&
          <div className='mt-3 p-2' style={{ background: '#fff1f0', border: '1px solid #ffa39e', fontSize: 12 }}>
            {preview.error}
          </div>
        }
        {preview && !preview.error &&
          <div className='mt-3 p-2' style={{ background: '#f6ffed', border: '1px solid #b7eb8f', fontSize: 12 }}>
            <b>{preview.total}</b> number{preview.total === 1 ? '' : 's'} will be registered:{' '}
            {preview.head.join(', ')}
            {preview.total > preview.head.length && <> … {preview.last}</>}
            {preview.truncated &&
              <div style={{ color: '#ad6800' }}>
                Stops at the highest 7-digit serial.
              </div>
            }
          </div>
        }
      </Spin>
    </Modal>
  );
};

export default RegisterModal;
