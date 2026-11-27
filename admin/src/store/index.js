import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import eventsReducer from './slices/eventsSlice';
import bookingsReducer from './slices/bookingsSlice';
import usersReducer from './slices/usersSlice';
import paymentsReducer from './slices/paymentsSlice';

export const store = configureStore({
  reducer: {
    adminAuth: authReducer,
    dashboard: dashboardReducer,
    adminEvents: eventsReducer,
    adminBookings: bookingsReducer,
    adminUsers: usersReducer,
    adminPayments: paymentsReducer,
  },
});
