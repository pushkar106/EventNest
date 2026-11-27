
import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Calendar, Ticket, Users, CreditCard,
  QrCode, User, LogOut, BarChart3, ClipboardCheck,
  Menu, X, Sun, Moon, Settings
} from 'lucide-react';
import { logoutAdmin } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/bookings', label: 'Bookings', icon: Ticket },
  { to: '/attendees', label: 'Attendees', icon: ClipboardCheck },
  { to: '/scanner', label: 'QR Scanner', icon: QrCode },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const user = useSelector((s) => s.adminAuth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === 'dark';

  const currentPage =
    links.find(link => link.to === location.pathname)?.label || 'Admin';

  const logout = async () => {
    await dispatch(logoutAdmin());
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="flex items-center justify-between px-3 py-5 mb-5">
        <div className="text-xl font-black whitespace-nowrap">
          EventNest <span className="text-purple">Admin</span>
        </div>

        {mobile && (
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={23}/>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 px-2 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3
              transition-all duration-200
              ${isActive
                ? 'bg-purple/20 text-purple'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={20} className="shrink-0"/>
            <span className={collapsed && !mobile ? 'md:hidden' : ''}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-purple/20 text-purple flex items-center justify-center font-bold">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          <div className={`min-w-0 ${collapsed && !mobile ? 'md:hidden' : ''}`}>
            <p className="text-sm font-semibold truncate">
              {user?.fullName || 'Administrator'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut size={19}/>
          <span className={collapsed && !mobile ? 'md:hidden' : ''}>
            Logout
          </span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Desktop and tablet sidebar */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-40
        flex-col bg-[var(--surface)] border-r border-[var(--border)]
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <SidebarContent/>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-3 text-slate-500 hover:text-purple"
        >
          {collapsed ? 'Expand →' : '← Collapse'}
        </button>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative w-[280px] max-w-[85vw] h-full bg-[var(--surface)] flex flex-col shadow-2xl">
            <SidebarContent mobile/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main
        className={`min-h-screen min-w-0 transition-all duration-300
        ${collapsed ? 'md:ml-20' : 'md:ml-64'}
        pb-24 md:pb-8`}
      >

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] px-4 md:px-8 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[var(--card)]"
              aria-label="Open menu"
            >
              <Menu size={22}/>
            </button>

            <div>
              <p className="text-xs text-[var(--muted)]">
                EventNest / Admin
              </p>
              <h2 className="font-bold text-lg">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card)] border border-[var(--border)] hover:text-purple transition"
            >
              {isDark ? <Sun size={19}/> : <Moon size={19}/>}
            </button>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                {user?.fullName}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {user?.role}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-purple/20 text-purple flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet/>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] px-1 py-2">
        <div className="grid grid-cols-5 gap-1">
          {[links[0], links[1], links[2], links[3], links[8]].map(
            ({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 rounded-xl text-[10px]
                  ${isActive ? 'text-purple' : 'text-[var(--muted)]'}`
                }
              >
                <Icon size={21}/>
                {label}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
}
