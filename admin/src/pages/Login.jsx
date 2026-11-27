
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginAdmin
} from '../store/slices/authSlice';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (s) => s.adminAuth
  );

  const submit = async (e) => {
    e.preventDefault();

    const res = await dispatch(
      loginAdmin({ email, password })
    );

    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white
    flex items-center justify-center p-4 sm:p-6">

      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-purple/10
        rounded-full blur-3xl -top-20 -left-20" />

        <div className="absolute w-80 h-80 bg-blue-500/10
        rounded-full blur-3xl bottom-0 right-0" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md">

        <form
          onSubmit={submit}
          className="bg-card border border-white/10
          rounded-2xl sm:rounded-3xl
          p-6 sm:p-8 shadow-2xl"
        >

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-xl
            bg-purple/20 flex items-center justify-center
            text-purple">
              <CalendarDays size={27} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold">
                EventNest
              </h1>

              <p className="text-xs text-slate-400">
                Admin Portal
              </p>
            </div>

          </div>

          {/* HEADING */}
          <div className="mb-7">

            <div className="inline-flex items-center gap-2
            text-xs text-purple bg-purple/10
            px-3 py-1.5 rounded-full mb-4">

              <ShieldCheck size={14} />
              Secure Admin Access

            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Welcome Back!
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Sign in to manage your events and bookings.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-rose-500/10
            border border-rose-500/20
            text-rose-400 rounded-xl p-3
            text-sm mb-5">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-5">

            <label className="text-sm text-slate-300
            font-medium">
              Email Address
            </label>

            <div className="relative mt-2">

              <Mail
                size={18}
                className="absolute left-3 top-1/2
                -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                required
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full bg-navySoft
                border border-white/10
                focus:border-purple outline-none
                rounded-xl py-3.5 pl-11 pr-4
                text-white placeholder:text-slate-500
                text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-7">

            <label className="text-sm text-slate-300
            font-medium">
              Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-3 top-1/2
                -translate-y-1/2 text-slate-400"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full bg-navySoft
                border border-white/10
                focus:border-purple outline-none
                rounded-xl py-3.5 pl-11 pr-12
                text-white placeholder:text-slate-500
                text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2
                -translate-y-1/2 text-slate-400
                hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>

            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple
            hover:opacity-90 active:scale-[0.98]
            disabled:opacity-50
            py-3.5 rounded-xl font-bold
            transition-all shadow-lg shadow-purple/20"
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>

          {/* FOOTER */}
          <div className="border-t border-white/10
          mt-7 pt-5 text-center">

            <p className="text-xs text-slate-500">
              <ShieldCheck
                size={13}
                className="inline mr-1"
              />
              Protected Admin Access
            </p>

            <p className="text-xs text-slate-600 mt-2">
              © {new Date().getFullYear()} EventNest. All rights reserved.
            </p>

          </div>

        </form>

      </div>

    </div>
  );
}
