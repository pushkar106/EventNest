import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchPayments = createAsyncThunk('adminPayments/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/admin/payments', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load payments');
  }
});

const paymentsSlice = createSlice({
  name: 'adminPayments',
  initialState: { list: [], total: 0, pages: 1, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.list = action.payload.payments; state.total = action.payload.total; state.pages = action.payload.pages || 1; state.loading = false;
      })
      .addCase(fetchPayments.rejected, (state) => { state.loading = false; });
  },
});

export default paymentsSlice.reducer;
