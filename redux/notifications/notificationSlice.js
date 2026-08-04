import { createSlice } from '@reduxjs/toolkit';

// Session history of every toast shown via Components/Shared/Notification.js's
// openNotification(). The header bell reads from here (NOT the backend
// notifications table). In-memory only - it lives for the current session and
// resets on a hard refresh.
const MAX = 50; // keep a little history; the bell displays the latest 10

const initialState = { list: [] };

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // payload: { id, title, message, color, time } - all serializable strings.
    addNotification: (state, action) => {
      state.list.unshift(action.payload); // newest first
      if (state.list.length > MAX) state.list.length = MAX;
    },
    clearNotifications: (state) => {
      state.list = [];
    },
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
