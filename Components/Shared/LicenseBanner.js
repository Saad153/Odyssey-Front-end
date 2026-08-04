import React, { useEffect, useState } from 'react';
import axiosClient from 'apis/axiosClient';

// Polls the backend licence status and shows a warning/read-only banner to
// every logged-in user. This is display-only - the backend independently
// rejects writes with 423 when read-only, so bypassing this banner buys
// nothing. See functions/license/ on the server.
const POLL_MS = 5 * 60 * 1000; // 5 minutes

const LicenseBanner = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    const fetchStatus = async () => {
      try {
        const { data } = await axiosClient.get('/license/status');
        if (alive) setStatus(data);
      } catch (_) {
        // Not logged in / server unreachable: show nothing.
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!status || status.mode === 'active') return null;

  const isReadOnly = status.mode === 'readonly';
  const style = {
    padding: '10px 16px',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 14,
    color: '#fff',
    background: isReadOnly ? '#b02a37' : '#c47d00',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  return (
    <div style={style} role="alert">
      {isReadOnly ? '🔒 ' : '⚠️ '}
      {status.message}
    </div>
  );
};

export default LicenseBanner;
