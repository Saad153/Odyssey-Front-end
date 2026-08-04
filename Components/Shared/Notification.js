import { notification } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { store } from 'redux/store';
import { addNotification } from 'redux/notifications/notificationSlice';

const openNotification = (title, message, color) => {
    notification.open({
      message: title,
      description: message,
      icon: <ExclamationCircleOutlined style={{ color: color }} />,
      onClick: () => {
        // console.log('Notification Clicked!');
      },
      duration:4
    });

    // Also record it in redux so the header bell can show recently-shown
    // notifications even after the 4s toast disappears. Best-effort, and only
    // stores serializable strings (a few call sites may pass a React node as
    // message - fall back to '' then). Never let this throw in a UI handler.
    try {
      store.dispatch(addNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: typeof title === 'string' ? title : String(title ?? ''),
        message: typeof message === 'string' ? message : '',
        color: color || '',
        time: new Date().toISOString(),
      }));
    } catch (_) {
      /* ignore */
    }
};

export default openNotification