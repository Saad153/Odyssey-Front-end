import React, { useEffect, useState } from 'react';
import { Modal, Input, Spin } from 'antd';
import moment from 'moment';
import { searchJobsForCopy, getJobById } from 'apis/jobs';
import openNotification from 'Components/Shared/Notification';

const CopyFromJobModal = ({ open, onClose, type, companyId, onCopied }) => {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!open) { setQ(''); setDebouncedQ(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!open || !debouncedQ.trim()) { setResults([]); return; }
    setSearching(true);
    searchJobsForCopy({ q:debouncedQ.trim(), type, companyId }).then((res) => {
      setResults(res.status === 'success' ? res.result : []);
    }).finally(() => setSearching(false));
  }, [debouncedQ, open, type, companyId]);

  const pick = async (job) => {
    setLoadingId(job.id);
    const res = await getJobById({ id:job.id, type });
    setLoadingId(null);
    if (res.status === 'success' && res.result) {
      onCopied(res.result);
      onClose();
    } else {
      openNotification('Error', 'Could not load that job.', 'red');
    }
  };

  return (
    <Modal title="Copy Booking Info From Existing Job" open={open} onCancel={onClose} footer={null} width={550}>
      <Input
        placeholder="Search by job number or client name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        allowClear
      />
      <div className='mt-3' style={{ maxHeight:320, overflowY:'auto' }}>
        {searching && <div className='text-center py-3'><Spin size='small' /></div>}
        {!searching && results.length === 0 && q.trim() && (
          <div style={{ color:'grey', fontSize:13 }}>No matching jobs found.</div>
        )}
        {!searching && results.map((job) => (
          <div
            key={job.id}
            className='p-2 mb-1'
            style={{ border:'1px solid #eee', borderRadius:6, cursor: loadingId ? 'not-allowed' : 'pointer', opacity: loadingId && loadingId !== job.id ? 0.5 : 1 }}
            onClick={() => !loadingId && pick(job)}
          >
            <div style={{ fontWeight:600 }}>
              {job.jobNo} {loadingId === job.id && <Spin size='small' className='mx-2' />}
            </div>
            <div style={{ fontSize:12, color:'grey' }}>
              {job.Client?.name || 'No client'} &middot; {job.pol || '-'} &rarr; {job.pod || job.fd || '-'} &middot; {job.jobDate ? moment(job.jobDate).format('DD-MMM-YYYY') : ''}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CopyFromJobModal;
