import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';
import { updateProfile } from './userSlice';

const persistSession = async (payload) => {
  if (payload.accessToken) await AsyncStorage.setItem('accessToken', payload.accessToken);
  if (payload.refreshToken) await AsyncStorage.setItem('refreshToken', payload.refreshToken);
  if (payload.user) await AsyncStorage.setItem('user', JSON.stringify(payload.user));
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const [accessToken, refreshToken, userRaw] = await AsyncStorage.multiGet(['accessToken', 'refreshToken', 'user'])
    .then((pairs) => pairs.map((p) => p[1]));
  if (!accessToken) return { user: null, accessToken: null };
  try {
    const { data } = await client.get('/auth/me');
    return { user: data.data.user, accessToken, refreshToken };
  } catch {
    return { user: userRaw ? JSON.parse(userRaw) : null, accessToken, refreshToken };
  }
});

export const loginUser = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/login', body);
    await persistSession(data.data);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/register', body);
    await persistSession(data.data);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const googleLogin = createAsyncThunk('auth/google', async (idToken, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/google', { idToken });
    await persistSession(data.data);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const sendOtp = createAsyncThunk('auth/sendOtp', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/send-otp', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/verify-otp', body);
    await persistSession(data.data);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgot', async (email, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/forgot-password', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Request failed');
  }
});

export const resetPassword = createAsyncThunk('auth/reset', async (body, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/reset-password', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await client.post('/auth/logout', {});
  } catch {}
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, loading: false, bootstrapping: true, error: null, otpHint: null },
  reducers: { clearAuthError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.bootstrapping = false;
      })
      .addCase(bootstrapAuth.rejected, (state) => { state.bootstrapping = false; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.otpHint = action.payload.otp;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.loading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.user; state.accessToken = action.payload.accessToken;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.accessToken = null; state.otpHint = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
