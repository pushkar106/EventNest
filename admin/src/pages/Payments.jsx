
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../store/slices/paymentsSlice';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  CalendarDays,
  User,
  Receipt
} from 'lucide-react';

export default function Payments() {
  const dispatch = useDispatch();

  const { list, total, pages, loading } = useSelector(
    (s) => s.adminPayments
  );

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchPayments({ page, status, limit: 20 }));
  }, [page, status, dispatch]);

  const filteredPayments = list.filter((p) => {
    const term = search.toLowerCase();

    return (
      (p.paymentId || p._id || '').toLowerCase().includes(term) ||
      (p.booking?.bookingId || '').toLowerCase().includes(term) ||
      (p.user?.fullName || '').toLowerCase().includes(term) ||
      (p.event?.title || '').toLowerCase().includes(term)
    );
  });

  const statusStyle = (value) => {
    switch (value) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-400';
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-400';
      case 'REFUNDED':
        return 'bg-blue-500/15 text-blue-400';
      default:
        return 'bg-white/10 text-slate-300';
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">
            Manage transactions
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Payments
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Total transactions: {total}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-white/5 rounded-xl px-4 py-3">
          <CreditCard className="text-purple" size={20} />
          <span className="font-semibold">Payment Management</span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-white/5">
          <CreditCard className="text-purple mb-3" size={22} />
          <p className="text-xs sm:text-sm text-slate-400">
            Total Payments
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            {total}
          </h2>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-white/5">
          <IndianRupee className="text-emerald-400 mb-3" size={22} />
          <p className="text-xs sm:text-sm text-slate-400">
            Current Page Revenue
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 break-all">
            ₹{list.reduce(
              (sum, p) =>
                p.status === 'COMPLETED'
                  ? sum + Number(p.amount || 0)
                  : sum,
              0
            ).toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="hidden sm:block bg-card rounded-2xl p-4 border border-white/5">
          <Receipt className="text-blue-400 mb-3" size={22} />
          <p className="text-sm text-slate-400">
            Displaying
          </p>
          <h2 className="text-2xl font-bold mt-1">
            {list.length}
          </h2>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="bg-card rounded-2xl p-4 border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payment, booking, user..."
              className="w-full bg-navySoft border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-purple"
            />
          </div>

          <select
            className="bg-navySoft border border-white/10 rounded-xl p-3 text-sm outline-none w-full sm:w-52"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="bg-card rounded-2xl p-10 text-center text-slate-400">
          Loading payments...
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navySoft text-slate-400">
                  <tr>
                    <th className="p-4 text-left">Payment ID</th>
                    <th className="p-4 text-left">Booking</th>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Event</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Method</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-xs">
                        {p.paymentId || p._id}
                      </td>

                      <td className="p-4 text-slate-300">
                        {p.booking?.bookingId || '-'}
                      </td>

                      <td className="p-4">
                        {p.user?.fullName || '-'}
                      </td>

                      <td className="p-4 max-w-48 truncate">
                        {p.event?.title || '-'}
                      </td>

                      <td className="p-4 font-semibold">
                        ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-slate-300">
                        {p.method || '-'}
                        {p.isMock && ' (mock)'}
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!filteredPayments.length && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE PAYMENT CARDS */}
          <div className="md:hidden space-y-3">
            {filteredPayments.map((p) => (
              <div
                key={p._id}
                className="bg-card border border-white/5 rounded-2xl p-4 space-y-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Payment ID
                    </p>
                    <p className="font-mono text-xs mt-1 break-all">
                      {p.paymentId || p._id}
                    </p>
                  </div>

                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${statusStyle(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="bg-navySoft rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Payment Amount
                  </p>
                  <h2 className="text-2xl font-extrabold mt-1">
                    ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User size={17} className="text-purple shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Customer</p>
                      <p className="break-words">
                        {p.user?.fullName || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Receipt size={17} className="text-purple shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Event</p>
                      <p className="break-words">
                        {p.event?.title || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays size={17} className="text-purple shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Booking ID</p>
                      <p className="break-all">
                        {p.booking?.bookingId || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-between text-xs">
                  <span className="text-slate-400">Method</span>
                  <span>{p.method || '-'}{p.isMock ? ' (mock)' : ''}</span>
                </div>
              </div>
            ))}

            {!filteredPayments.length && (
              <div className="bg-card rounded-2xl p-8 text-center text-slate-400">
                No payments found.
              </div>
            )}
          </div>
        </>
      )}

      {/* PAGINATION */}
      <div className="bg-card border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-navySoft rounded-lg text-sm disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <span className="text-xs sm:text-sm text-slate-400">
          Page {page} of {pages || 1}
        </span>

        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="flex items-center gap-1 px-3 py-2 bg-navySoft rounded-lg text-sm disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
