import axiosClient from 'apis/axiosClient';

// Use axiosClient (not raw axios) so the auth token is attached by its request
// interceptor - the /notifications routes are behind the backend's global auth
// gate, and raw axios would send no token and get 401. These are best-effort:
// a failed notification must never break the action that triggered it, so
// errors are swallowed (the caller treats them as fire-and-forget).
export const createNotification = async (data) => {
  try {
    await axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_NOTIFICATION, { data });
  } catch (err) {
    console.error('createNotification failed:', err?.response?.status || err.message);
  }
};

export const updateNotification = async (data) => {
  try {
    await axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_UPDATE_NOTIFICATION, { data });
  } catch (err) {
    console.error('updateNotification failed:', err?.response?.status || err.message);
  }
};
