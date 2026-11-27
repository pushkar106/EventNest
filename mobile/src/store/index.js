import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventsReducer from './slices/eventsSlice';
import bookingReducer from './slices/bookingSlice';
import ticketsReducer from './slices/ticketsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    events: eventsReducer,
    booking: bookingReducer,
    tickets: ticketsReducer,
    notifications: notificationsReducer,
  },
});
