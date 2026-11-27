
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, toggleUser } from '../store/slices/usersSlice';
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react';

export default function Users() {
  const dispatch = useDispatch();

  const { list, total, pages, loading } = useSelector(
    (s) => s.adminUsers
  );

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const load = (p = page) =>
    dispatch(fetchUsers({
      search,
      role,
      page: p,
      limit: 20,
    }));

  useEffect(() => {
    load();
  }, [page, role]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const handleToggle = (u) => {
    if (confirm(`Toggle status for ${u.email}?`)) {
      dispatch(toggleUser(u._id));
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400 mb-1">
            Manage your platform
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Users
          </h1>
        </div>

        <div className="bg-purple/15 border border-purple/20 rounded-xl px-4 py-3 flex items-center gap-3 w-fit">
          <UsersIcon className="text-purple" size={22} />

          <div>
            <p className="text-xs text-slate-400">Total Users</p>
            <p className="text-lg font-bold">{total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="bg-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className="w-full bg-navySoft border border-white/10 rounded-xl pl-10 pr-3 py-3 outline-none focus:border-purple text-sm"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="w-full sm:w-40 bg-navySoft border border-white/10 rounded-xl px-3 py-3 text-sm outline-none"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="submit"
          className="bg-purple hover:opacity-90 rounded-xl px-6 py-3 font-semibold text-sm"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {loading ? (
        <div className="bg-card rounded-2xl p-10 text-center text-slate-400">
          Loading users...
        </div>
      ) : (
        <>
          {/* MOBILE USER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">

            {list.map((u) => (
              <div
                key={u._id}
                className="bg-card border border-white/5 rounded-2xl p-4 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-purple/20 flex items-center justify-center text-purple font-bold text-lg">
                    {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">
                      {u.fullName}
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 break-all">
                      <Mail size={13} className="shrink-0" />
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple/15 text-purple rounded-lg px-3 py-1 text-xs font-semibold">
                    {u.role}
                  </span>

                  <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    u.isEmailVerified
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {u.isEmailVerified ? 'Verified' : 'Not verified'}
                  </span>

                  <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    u.isActive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <button
                    onClick={() => handleToggle(u)}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold flex justify-center items-center gap-2 ${
                      u.isActive
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {u.isActive ? (
                      <>
                        <UserX size={16} />
                        Disable User
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Enable User
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-card rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navySoft text-slate-400">
                  <tr>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-center">Role</th>
                    <th className="p-4 text-center">Verified</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((u) => (
                    <tr
                      key={u._id}
                      className="border-t border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="p-4 font-semibold">
                        {u.fullName}
                      </td>

                      <td className="p-4 text-slate-300">
                        {u.email}
                      </td>

                      <td className="p-4 text-center">
                        {u.role}
                      </td>

                      <td className="p-4 text-center">
                        {u.isEmailVerified ? (
                          <span className="text-emerald-400 inline-flex items-center gap-1">
                            <ShieldCheck size={15} /> Yes
                          </span>
                        ) : (
                          <span className="text-amber-400">No</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {u.isActive ? (
                          <span className="text-emerald-400">Active</span>
                        ) : (
                          <span className="text-rose-400">Disabled</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggle(u)}
                          className="bg-purple/15 text-purple hover:bg-purple/25 px-4 py-2 rounded-lg text-xs font-semibold"
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!list.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!list.length && (
            <div className="lg:hidden text-center text-slate-400 p-6 bg-card rounded-xl">
              No users found.
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      <div className="bg-card rounded-2xl p-3 sm:p-4 flex flex-wrap justify-between items-center gap-3">

        <p className="text-xs sm:text-sm text-slate-400">
          Page {page} of {pages || 1}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm font-semibold px-2">
            {page}
          </span>

          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
