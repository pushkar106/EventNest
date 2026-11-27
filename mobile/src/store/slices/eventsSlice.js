import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchEvents = createAsyncThunk('events/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/events', { params: { status: 'PUBLISHED', ...params } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load events');
  }
});

export const fetchFeaturedEvents = createAsyncThunk('events/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/events/featured');
    return data.data.events;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load featured events');
  }
});

export const fetchEventById = createAsyncThunk('events/detail', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.get(`/events/${id}`);
    return data.data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Event not found');
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: { list: [], featured: [], current: null, total: 0, loading: false, error: null },
  reducers: { clearCurrentEvent: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false; state.list = action.payload.events; state.total = action.payload.total;
      })
      .addCase(fetchEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchEventById.pending, (state) => { state.loading = true; })
      .addCase(fetchEventById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchEventById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
