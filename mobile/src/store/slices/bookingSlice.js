import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const createBooking = createAsyncThunk('booking/create', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/bookings', body);
    return data.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Booking failed');
  }
});

export const mockPay = createAsyncThunk('booking/mockPay', async (bookingId, { rejectWithValue }) => {
  try {
    await client.post('/payments/create-order', { bookingId });
    const { data } = await client.post('/payments/mock-complete', { bookingId });
    return data.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Payment failed');
  }
});

export const createRazorpayOrder = createAsyncThunk('booking/order', async (bookingId, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/payments/create-order', { bookingId });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not create order');
  }
});

export const cancelBooking = createAsyncThunk('booking/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await client.post(`/bookings/${id}/cancel`, { reason });
    return data.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cancel failed');
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: { current: null, order: null, loading: false, error: null },
  reducers: { setDraft: (state, action) => { state.current = action.payload; }, clearBooking: (state) => { state.current = null; state.order = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(mockPay.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(mockPay.pending, (state) => { state.loading = true; })
      .addCase(mockPay.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => { state.order = action.payload; });
  },
});

export const { setDraft, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
