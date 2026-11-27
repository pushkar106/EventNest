import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Events from './pages/Events';
import EventForm from './pages/EventForm';
import Bookings from './pages/Bookings';
import Attendees from './pages/Attendees';
import Scanner from './pages/Scanner';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Profile from './pages/Profile';

function Private({ children }) {
  const { user, token } = useSelector((s) => s.adminAuth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Layout /></Private>}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="events" element={<Events />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="attendees" element={<Attendees />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
