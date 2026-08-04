import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import axiosClient from 'apis/axiosClient';

// Admin-only payment/licence status tag for the header. Shows at a glance
// whether the subscription is good, how many days are left, or that a payment
// is pending / about to go read-only. Self-gates: renders nothing unless the
// logged-in user has the 'admin' designation, and reads the admin-only
// /license/info endpoint. Refreshes every 10 minutes.
const REFRESH_MS = 10 * 60 * 1000;

// Subtle, antd-style tag palettes so the tag sits quietly in the header rather
// than dominating it (matches the muted FY badge next to it).
const TONES = {
  green: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d', dot: '#52c41a' },
  amber: { bg: '#fffbe6', border: '#ffe58f', text: '#ad6800', dot: '#faad14' },
  red:   { bg: '#fff1f0', border: '#ffa39e', text: '#cf1322', dot: '#ff4d4f' },
};

const isAdmin = () => {
  try {
    const token = Cookies.get('token');
    if (!token || token === 'undefined') return false;
    return (jwt_decode(token).designation || '').toLowerCase() === 'admin';
  } catch (_) {
    return false;
  }
};

// Map licence state -> { tone, label }. Labels stay short; the tooltip carries
// the detail.
function describe(info) {
  if (!info) return null;
  const { mode, daysRemaining, daysUntilExpiry } = info;

  if (mode === 'readonly') return { tone: 'red', label: 'Read-only' };
  if (mode === 'warn') return { tone: 'amber', label: `Read-only in ${daysRemaining ?? 0}d` };
  // active
  if (daysUntilExpiry != null) {
    if (daysUntilExpiry <= 7) return { tone: 'amber', label: `Renews in ${daysUntilExpiry}d` };
    return { tone: 'green', label: `Active · ${daysUntilExpiry}d` };
  }
  return { tone: 'green', label: 'Active' };
}

const LicenseStatusChip = () => {
  const [admin] = useState(isAdmin);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!admin) return;
    let alive = true;
    const load = () => {
      axiosClient
        .get('/license/info')
        .then(({ data }) => alive && setInfo(data))
        .catch(() => {}); // non-admin / unreachable -> stay hidden
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [admin]);

  if (!admin) return null;
  const d = describe(info);
  if (!d) return null;
  const t = TONES[d.tone];

  const tooltip = (
    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
      <div><b>Subscription:</b> {info.mode}</div>
      {info.paidThrough && (
        <div><b>Paid through:</b> {moment(info.paidThrough).format('YYYY-MMM-DD')}</div>
      )}
      {info.graceEndsAt && (
        <div><b>Read-only on:</b> {moment(info.graceEndsAt).format('YYYY-MMM-DD')}</div>
      )}
      {info.message && <div style={{ marginTop: 4, maxWidth: 240 }}>{info.message}</div>}
    </div>
  );

  return (
    <Tooltip title={tooltip} placement="bottom">
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 26,
          lineHeight: 1, // override the header's 64px line-height
          padding: '0 10px',
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.bg,
          color: t.text,
          fontSize: 12,
          fontWeight: 600,
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
          cursor: 'default',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot }} />
        {d.label}
      </span>
    </Tooltip>
  );
};

export default LicenseStatusChip;
