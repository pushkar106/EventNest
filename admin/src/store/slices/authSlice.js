import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const loginAdmin = createAsyncThunk('adminAuth/login', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/login', body);
    const user = data.data.user;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return rejectWithValue('This portal is for administrators only.');
    }
    localStorage.setItem('adminAccessToken', data.data.accessToken);
    localStorage.setItem('adminRefreshToken', data.data.refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(user));
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchMe = createAsyncThunk('adminAuth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/auth/me');
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const updateAdminProfile = createAsyncThunk('adminAuth/profile', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.put('/auth/profile', body);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const logoutAdmin = createAsyncThunk('adminAuth/logout', async () => {
  try { await client.post('/auth/logout', {}); } catch {}
  localStorage.removeItem('adminAccessToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminUser');
});

const stored = localStorage.getItem('adminUser');

const authSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem('adminAccessToken'),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.token = action.payload.accessToken;
      })
      .addCase(loginAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(updateAdminProfile.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(logoutAdmin.fulfilled, (state) => { state.user = null; state.token = null; });
  },
});

export default authSlice.reducer;
