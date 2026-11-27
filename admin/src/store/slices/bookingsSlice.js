import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchAdminBookings = createAsyncThunk('adminBookings/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/admin/bookings', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load bookings');
  }
});

export const fetchAttendees = createAsyncThunk('adminBookings/attendees', async (eventId, { rejectWithValue }) => {
  try {
    const { data } = await client.get(`/attendance/events/${eventId}/attendees`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load attendees');
  }
});

export const verifyQr = createAsyncThunk('adminBookings/qr', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/attendance/verify-qr', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'QR verification failed');
  }
});

export const manualCheckin = createAsyncThunk('adminBookings/manual', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/attendance/manual-checkin', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-in failed');
  }
});

export const updateAttendanceStatus = createAsyncThunk('adminBookings/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/attendance/${id}/status`, { status });
    return data.data.attendance;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Status update failed');
  }
});

const bookingsSlice = createSlice({
  name: 'adminBookings',
  initialState: { list: [], total: 0, pages: 1, attendees: [], loading: false, error: null, lastVerify: null },
  reducers: { clearVerify: (state) => { state.lastVerify = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.list = action.payload.bookings; state.total = action.payload.total; state.pages = action.payload.pages || 1; state.loading = false;
      })
      .addCase(fetchAdminBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAttendees.fulfilled, (state, action) => { state.attendees = action.payload.attendees; })
      .addCase(verifyQr.fulfilled, (state, action) => { state.lastVerify = action.payload; state.error = null; })
      .addCase(verifyQr.rejected, (state, action) => { state.error = action.payload; })
      .addCase(manualCheckin.fulfilled, (state, action) => { state.lastVerify = action.payload; state.error = null; })
      .addCase(manualCheckin.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateAttendanceStatus.fulfilled, (state, action) => {
        state.attendees = state.attendees.map((a) => a._id === action.payload._id ? { ...a, status: action.payload.status } : a);
      });
  },
});

export const { clearVerify } = bookingsSlice.actions;
export default bookingsSlice.reducer;
