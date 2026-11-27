import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchUsers = createAsyncThunk('adminUsers/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/admin/users', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load users');
  }
});

export const toggleUser = createAsyncThunk('adminUsers/toggle', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/admin/users/${id}/toggle-status`);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const usersSlice = createSlice({
  name: 'adminUsers',
  initialState: { list: [], total: 0, pages: 1, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload.users; state.total = action.payload.total; state.pages = action.payload.pages || 1; state.loading = false;
      })
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })
      .addCase(toggleUser.fulfilled, (state, action) => {
        state.list = state.list.map((u) => u._id === action.payload._id ? action.payload : u);
      });
  },
});

export default usersSlice.reducer;
