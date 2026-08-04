import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import axiosClient from 'apis/axiosClient';

// Admin-only configuration hub. Gated three ways:
//   1. The sidebar entry only renders for the 'admin' designation.
//   2. This component redirects any non-admin who reaches /config directly.
//   3. The backend /license/info route enforces the admin designation too,
//      so the data itself is never served to a non-admin.
const Config = () => {
  const router = useRouter();
  const [allowed, setAllowed] = useState(null); // null = still checking
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  // Client-side admin check off the JWT.
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token || token === 'undefined') {
      router.replace('/login');
      return;
    }
    let decoded;
    try {
      decoded = jwt_decode(token);
    } catch (_) {
      router.replace('/login');
      return;
    }
    const isAdmin = (decoded.designation || '').toLowerCase() === 'admin';
    setUsername(decoded.username || '');
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    setAllowed(true);
  }, [router]);

  // Load install / licence detail once confirmed admin.
  useEffect(() => {
    if (!allowed) return;
    axiosClient
      .get('/license/info')
      .then(({ data }) => setInfo(data))
      .catch((err) => {
        if (err?.response?.status === 403) router.replace('/');
        else setError('Could not load configuration details.');
      });
  }, [allowed, router]);

  if (allowed === null) return null; // avoid flashing content pre-check

  const modeColor =
    info?.mode === 'readonly' ? '#b02a37' : info?.mode === 'warn' ? '#c47d00' : '#237804';

  return (
    <div className="base-page-layout" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 4 }}>Configuration</h3>
      <p style={{ color: '#888', marginBottom: 24 }}>
        Administrator settings for this installation.
      </p>

      {error && <div style={{ color: '#b02a37', marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* Licence / install status */}
        <section style={cardStyle}>
          <h5 style={cardTitle}>Licence &amp; Installation</h5>
          {!info ? (
            <p style={{ color: '#888' }}>Loading…</p>
          ) : (
            <table style={{ width: '100%', fontSize: 14 }}>
              <tbody>
                <Row label="Install ID" value={info.installId} />
                <Row
                  label="Status"
                  value={
                    <span style={{ color: modeColor, fontWeight: 600, textTransform: 'capitalize' }}>
                      {info.mode}
                    </span>
                  }
                />
                {info.paidThrough && (
                  <Row
                    label="Paid through"
                    value={new Date(info.paidThrough).toISOString().slice(0, 10)}
                  />
                )}
                {info.daysUntilExpiry != null && (
                  <Row label="Days left on subscription" value={info.daysUntilExpiry} />
                )}
                {info.daysRemaining != null && (
                  <Row label="Days until read-only" value={info.daysRemaining} />
                )}
                <Row label="App version" value={info.appVersion} />
                <Row label="Licence server" value={info.licenseServerUrl} />
                <Row label="Server time" value={info.serverTime} />
                {info.message && <Row label="Notice" value={info.message} />}
              </tbody>
            </table>
          )}
        </section>

        {/* Session */}
        <section style={cardStyle}>
          <h5 style={cardTitle}>Session</h5>
          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              <Row label="Signed in as" value={username} />
              <Row label="Role" value="admin" />
            </tbody>
          </table>
        </section>

        {/* Placeholder for future settings */}
        <section style={cardStyle}>
          <h5 style={cardTitle}>Settings</h5>
          <p style={{ color: '#888', fontSize: 14 }}>
            Additional configuration options will appear here.
          </p>
        </section>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <tr>
    <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
      {label}
    </td>
    <td style={{ padding: '6px 0', wordBreak: 'break-all' }}>{value}</td>
  </tr>
);

const cardStyle = {
  flex: '1 1 320px',
  minWidth: 300,
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const cardTitle = { marginBottom: 16, fontWeight: 600 };

export default Config;
