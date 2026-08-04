import React, { useState, useMemo } from 'react';
import { Popover, Badge } from 'antd';
import { FaRegBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import moment from 'moment';

// Header bell: shows the last 10 notifications that were surfaced via
// openNotification() (Components/Shared/Notification.js), read straight from
// the redux `notifications` slice - NOT the backend notifications table. Lets a
// user who missed a 4s toast (e.g. "Invoice emailed to ...") still confirm it.
const MAX_ITEMS = 10;

const NotificationBell = () => {
  const list = useSelector((state) => state.notifications?.list || []);
  // Id of the newest item the user has already seen; drives the unread badge.
  const [lastSeenId, setLastSeenId] = useState(null);

  const items = list.slice(0, MAX_ITEMS);

  const unreadCount = useMemo(() => {
    if (!list.length) return 0;
    if (!lastSeenId) return list.length;
    const idx = list.findIndex((x) => x.id === lastSeenId);
    // Items above the last-seen one are new; if not found, treat all as new.
    return idx === -1 ? list.length : idx;
  }, [list, lastSeenId]);

  const onOpenChange = (open) => {
    if (open && list.length) setLastSeenId(list[0].id);
  };

  const content = (
    <div style={{ width: 320, maxHeight: 380, overflowY: 'auto' }}>
      {items.length === 0 && (
        <div style={{ padding: 12, color: '#888', fontSize: 13 }}>
          No notifications yet.
        </div>
      )}
      {items.map((x, i) => (
        <div
          key={x.id ?? i}
          style={{
            display: 'flex',
            gap: 8,
            padding: '8px 4px',
            borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <span
            style={{
              flex: '0 0 auto',
              width: 8,
              height: 8,
              borderRadius: '50%',
              marginTop: 5,
              background: x.color || '#1890ff',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
              {x.title}
            </div>
            {x.message && (
              <div style={{ fontSize: 12, color: '#555', wordBreak: 'break-word' }}>
                {x.message}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {x.time ? moment(x.time).fromNow() : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      title="Recent notifications"
      trigger="hover"
      placement="bottomRight"
      onOpenChange={onOpenChange}
      overlayStyle={{ zIndex: 1100 }}
    >
      <span className="cur" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          <FaRegBell size={20} style={{ color: 'black' }} />
        </Badge>
      </span>
    </Popover>
  );
};

export default NotificationBell;
