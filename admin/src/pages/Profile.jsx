
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateAdminProfile
} from '../store/slices/authSlice';
import client from '../api/client';

import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LockKeyhole,
  Save,
  KeyRound,
  UserRound
} from 'lucide-react';

export default function Profile() {
  const user = useSelector((s) => s.adminAuth.user);
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await dispatch(
        updateAdminProfile({ fullName, mobile })
      );

      setMsg(
        res.meta.requestStatus === 'fulfilled'
          ? 'Profile updated successfully!'
          : res.payload || 'Profile update failed'
      );
    } finally {
      setSaving(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    setChangingPwd(true);
    setPwdMsg('');

    try {
      const { data } = await client.put(
        '/auth/change-password',
        { currentPassword, newPassword }
      );

      setPwdMsg(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdMsg(
        err.response?.data?.message || 'Password update failed'
      );
    } finally {
      setChangingPwd(false);
    }
  };

  const inputClass =
    'w-full min-w-0 bg-navySoft border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple transition placeholder:text-slate-500';

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">

      {/* PAGE HEADER */}
      <div>
        <p className="text-sm text-slate-400 mb-1">
          Account settings
        </p>

        <h1 className="text-2xl sm:text-3xl font-extrabold">
          My Profile
        </h1>

        <p className="text-slate-400 text-sm mt-2">
          Manage your admin account and security settings.
        </p>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="bg-card border border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center">
            <UserRound size={34} className="text-purple" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold break-words">
              {user?.fullName || 'Admin User'}
            </h2>

            <p className="text-sm text-slate-400 mt-1 break-all">
              {user?.email}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-purple/20 text-purple px-3 py-1 rounded-full text-xs font-semibold">
                {user?.role || 'ADMIN'}
              </span>

              <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <ShieldCheck size={13} />
                Admin Account
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* PERSONAL INFORMATION */}
        <form
          onSubmit={save}
          className="bg-card border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple/20 p-3 rounded-xl">
              <User size={21} className="text-purple" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Personal Information
              </h2>
              <p className="text-xs text-slate-400">
                Update your account details
              </p>
            </div>
          </div>

          {/* FULL NAME */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                className={`${inputClass} pl-10`}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                className={`${inputClass} pl-10 opacity-70`}
                value={user?.email || ''}
                disabled
              />
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Email address cannot be changed here.
            </p>
          </div>

          {/* MOBILE */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Mobile Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                className={`${inputClass} pl-10`}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {/* MESSAGE */}
          {msg && (
            <p className={`text-sm ${
              msg.includes('successfully')
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}>
              {msg}
            </p>
          )}

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-purple hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* CHANGE PASSWORD */}
        <form
          onSubmit={changePwd}
          className="bg-card border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <LockKeyhole size={21} className="text-blue-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Security Settings
              </h2>
              <p className="text-xs text-slate-400">
                Change your account password
              </p>
            </div>
          </div>

          {/* CURRENT PASSWORD */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Current Password
            </label>

            <input
              type="password"
              className={inputClass}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              New Password
            </label>

            <input
              type="password"
              className={inputClass}
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {/* SECURITY INFO */}
          <div className="bg-navySoft border border-white/5 rounded-xl p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="text-emerald-400 shrink-0"
              />

              <div>
                <p className="text-sm font-semibold">
                  Account Security
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Use a strong password with at least 6 characters.
                </p>
              </div>
            </div>
          </div>

          {/* PASSWORD MESSAGE */}
          {pwdMsg && (
            <p className="text-sm text-slate-300">
              {pwdMsg}
            </p>
          )}

          {/* UPDATE PASSWORD */}
          <button
            type="submit"
            disabled={changingPwd}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
          >
            <KeyRound size={18} />
            {changingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>

      </div>

    </div>
  );
}
