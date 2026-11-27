import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const updateProfile = createAsyncThunk('user/update', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.put('/auth/profile', body);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const changePassword = createAsyncThunk('user/password', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.put('/auth/change-password', body);
    return data.message;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Password change failed');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, loading: false, error: null, success: null },
  reducers: { clearUserStatus: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false; state.profile = action.payload; state.success = 'Profile updated';
      })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(changePassword.fulfilled, (state, action) => { state.success = action.payload; state.loading = false; })
      .addCase(changePassword.rejected, (state, action) => { state.error = action.payload; state.loading = false; });
  },
});

export const { clearUserStatus } = userSlice.actions;
export default userSlice.reducer;
