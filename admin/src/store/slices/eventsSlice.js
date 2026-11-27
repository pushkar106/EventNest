import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchAdminEvents = createAsyncThunk('adminEvents/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/admin/events', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load events');
  }
});

export const createEvent = createAsyncThunk('adminEvents/create', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/events', body);
    return data.data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Create failed');
  }
});

export const updateEvent = createAsyncThunk('adminEvents/update', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await client.put(`/events/${id}`, body);
    return data.data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const deleteEvent = createAsyncThunk('adminEvents/delete', async (id, { rejectWithValue }) => {
  try {
    await client.delete(`/events/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

export const publishEvent = createAsyncThunk('adminEvents/publish', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/events/${id}/publish`);
    return data.data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Publish failed');
  }
});

export const featureEvent = createAsyncThunk('adminEvents/feature', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/events/${id}/feature`);
    return data.data.event;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Feature toggle failed');
  }
});

const eventsSlice = createSlice({
  name: 'adminEvents',
  initialState: { list: [], total: 0, pages: 1, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminEvents.fulfilled, (state, action) => {
        state.loading = false; state.list = action.payload.events; state.total = action.payload.total; state.pages = action.payload.pages || 1;
      })
      .addCase(fetchAdminEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(publishEvent.fulfilled, (state, action) => {
        state.list = state.list.map((e) => e._id === action.payload._id ? action.payload : e);
      })
      .addCase(featureEvent.fulfilled, (state, action) => {
        state.list = state.list.map((e) => e._id === action.payload._id ? action.payload : e);
      });
  },
});

export default eventsSlice.reducer;
