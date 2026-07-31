import React, { useEffect, useState } from 'react';
import { Modal, Radio, Input, Spin } from 'antd';
import Cookies from 'js-cookie';
import axiosClient from 'apis/axiosClient';
import openNotification from './Notification';
import { isValidEmailList } from 'functions/emailList';

const { TextArea } = Input;

const SendInvoiceEmailModal = ({ open, onClose, invoice, onSent }) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState({ infoMail:'', accountsMail:'' });
  const [option, setOption] = useState(null);
  const [customEmail, setCustomEmail] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!open || !invoice?.id) return;
    setLoading(true);
    setOption(null);
    setCustomEmail('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/getPartyEmails`, {
      headers: { invoiceid: invoice.id, employeeid: Cookies.get('loginId') }
    }).then((x) => {
      if (x.data.status === 'success') {
        setEmails(x.data.result);
        setOption(x.data.result.infoMail ? 'info' : x.data.result.accountsMail ? 'accounts' : 'custom');
        setCc(x.data.result.defaultCc || '');
        setBcc(x.data.result.defaultBcc || '');
        setSubject(x.data.result.defaultSubject || '');
        setBody(x.data.result.defaultBody || '');
      } else {
        setEmails({ infoMail:'', accountsMail:'' });
        setOption('custom');
        openNotification('Error', x.data.result || 'Could not load registered emails.', 'red');
      }
    }).finally(() => setLoading(false));
  }, [open, invoice?.id]);

  const resolvedTo =
    option === 'info' ? emails.infoMail :
    option === 'accounts' ? emails.accountsMail :
    customEmail.trim();

  const toValid = isValidEmailList(resolvedTo, { requireNonEmpty:true });
  const ccValid = isValidEmailList(cc);
  const bccValid = isValidEmailList(bcc);

  const canSend = toValid && ccValid && bccValid && subject.trim() && body.trim();

  // Fire-and-forget: close the modal immediately so the user can keep working,
  // and surface a notification whenever the send actually finishes in the
  // background. This component stays mounted (the parent always renders it,
  // just toggling `open`), so the request isn't interrupted by the close.
  const send = () => {
    if (!canSend) return;
    const payload = { id: invoice.id, employeeId: Cookies.get('loginId'), to: resolvedTo, cc, bcc, subject, body };
    onClose();
    axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/sendEmail`, payload).then((x) => {
      if (x.data.status === 'success') {
        openNotification('Success', `Invoice emailed to ${payload.to}!`, 'green');
        onSent?.();
      } else {
        openNotification('Error', x.data.result || 'Failed to send invoice email.', 'red');
      }
    }).catch(() => {
      openNotification('Error', 'Failed to send invoice email.', 'red');
    });
  };

  return (
    <Modal
      title={`Send Invoice ${invoice?.invoice_No || ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      width={600}
    >
      {loading && <div className='text-center py-4'><Spin /></div>}
      {!loading && (
        <>
          <div className='mb-2'>Send to <b>{invoice?.party_Name}</b> at:</div>
          <Radio.Group className='d-flex flex-column' value={option} onChange={(e) => setOption(e.target.value)}>
            <Radio value='info' disabled={!emails.infoMail} className='mb-2'>
              Info Mail{emails.infoMail ? `: ${emails.infoMail}` : ' (not registered)'}
            </Radio>
            <Radio value='accounts' disabled={!emails.accountsMail} className='mb-2'>
              Accounts Mail{emails.accountsMail ? `: ${emails.accountsMail}` : ' (not registered)'}
            </Radio>
            <Radio value='custom' className='mb-2'>
              Other email
            </Radio>
          </Radio.Group>
          {option === 'custom' && (
            <Input
              placeholder='e.g. a@x.com; b@x.com'
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className='mt-1 mb-2'
              status={customEmail && !isValidEmailList(customEmail, { requireNonEmpty:true }) ? 'error' : ''}
            />
          )}
          <div className='mt-2 mb-3' style={{ fontSize:13 }}>
            {toValid
              ? <>This invoice will be emailed to <b>{resolvedTo}</b>.</>
              : <span style={{ color:'grey' }}>Select or enter valid email address(es) to continue.</span>}
          </div>

          <div className='mb-1'><b>CC</b> <span style={{ fontSize:12, color:'grey' }}>(optional, e.g. a@x.com; b@x.com)</span></div>
          <Input
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            className='mb-3'
            status={!ccValid ? 'error' : ''}
          />

          <div className='mb-1'><b>BCC</b> <span style={{ fontSize:12, color:'grey' }}>(optional, e.g. a@x.com; b@x.com)</span></div>
          <Input
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            className='mb-3'
            status={!bccValid ? 'error' : ''}
          />

          <div className='mb-1'><b>Subject</b></div>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className='mb-3'
            status={!subject.trim() ? 'error' : ''}
          />

          <div className='mb-1'><b>Message</b></div>
          <TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            autoSize={{ minRows:6, maxRows:14 }}
            className='mb-1'
            status={!body.trim() ? 'error' : ''}
          />
          <div className='mb-3' style={{ fontSize:12, color:'grey' }}>
            The invoice PDF will be attached automatically — no need to mention it separately unless you want to.
          </div>

          <div className='d-flex justify-content-end'>
            <div className='div-btn-custom text-center py-1 px-3 mx-2' style={{ cursor:'pointer' }} onClick={onClose}>Cancel</div>
            <div
              className='div-btn-custom-green text-center py-1 px-3'
              style={{ cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.6 }}
              onClick={send}
            >
              Send
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SendInvoiceEmailModal;
