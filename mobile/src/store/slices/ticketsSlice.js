import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchMyTickets = createAsyncThunk('tickets/my', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/bookings/my', { params });
    return data.data.bookings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load tickets');
  }
});

export const fetchTicketById = createAsyncThunk('tickets/one', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.get(`/bookings/${id}`);
    return data.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Ticket not found');
  }
});

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTickets.pending, (state) => { state.loading = true; })
      .addCase(fetchMyTickets.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMyTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTicketById.fulfilled, (state, action) => { state.current = action.payload; });
  },
});

export default ticketsSlice.reducer;
