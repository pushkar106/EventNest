import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchNotifications = createAsyncThunk('notifications/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/notifications');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/read', async (id, { rejectWithValue }) => {
  try {
    await client.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark read');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        if (action.payload === 'all') {
          state.list = state.list.map((n) => ({ ...n, isRead: true }));
          state.unreadCount = 0;
        } else {
          state.list = state.list.map((n) => n._id === action.payload ? { ...n, isRead: true } : n);
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationsSlice.reducer;
