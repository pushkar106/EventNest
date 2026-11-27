
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBookings } from '../store/slices/bookingsSlice';
import {
  Search,
  Eye,
  CalendarDays,
  Ticket,
  CreditCard,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function Bookings() {
  const dispatch = useDispatch();

  const { list, total, pages, loading } = useSelector(
    (s) => s.adminBookings
  );

  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const load = (p = page) =>
    dispatch(
      fetchAdminBookings({
        status,
        search,
        page: p,
        limit: 15
      })
    );

  useEffect(() => {
    load();
  }, [status, page]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const getStatusStyle = (value) => {
    switch (value) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-400';

      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400';

      case 'REFUNDED':
        return 'bg-amber-500/10 text-amber-400';

      default:
        return 'bg-blue-500/10 text-blue-400';
    }
  };

  const getPaymentStyle = (value) => {
    if (value === 'PAID') {
      return 'text-emerald-400';
    }

    if (value === 'REFUNDED') {
      return 'text-amber-400';
    }

    return 'text-slate-400';
  };

  const currentPages = Math.max(pages || 1, 1);

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Bookings
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage and monitor all event bookings.
          </p>
        </div>

        <div className="bg-purple/10 text-purple px-4 py-2 rounded-xl text-sm font-semibold w-fit">
          Total: {total}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
            <Ticket size={16} />
            Total Bookings
          </div>

          <p className="text-2xl font-bold mt-2">
            {total}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
            <CheckCircle size={16} />
            Current Page
          </div>

          <p className="text-2xl font-bold mt-2">
            {page}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
            <CalendarDays size={16} />
            Total Pages
          </div>

          <p className="text-2xl font-bold mt-2">
            {currentPages}
          </p>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-2xl p-4 sm:p-5">

        <form
          onSubmit={onSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full bg-navy border border-white/10 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-purple text-sm"
              placeholder="Search booking ID, user, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-48 bg-navy border border-white/10 rounded-xl p-3 outline-none focus:border-purple text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>

            {[
              'PENDING',
              'CONFIRMED',
              'CANCELLED',
              'REFUNDED'
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto bg-purple hover:opacity-90 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Search size={17} />
            Search
          </button>
        </form>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-card rounded-2xl p-10 text-center text-slate-400">
          Loading bookings...
        </div>
      ) : (
        <>
          {/* Mobile Booking Cards */}
          <div className="md:hidden space-y-3">

            {list.map((b) => (
              <div
                key={b._id}
                className="bg-card rounded-2xl border border-white/5 p-4 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">
                    <p className="font-mono text-sm text-purple break-all">
                      {b.bookingId}
                    </p>

                    <p className="font-semibold mt-2 break-words">
                      {b.event?.title || 'Unknown Event'}
                    </p>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-lg shrink-0 ${getStatusStyle(b.status)}`}>
                    {b.status}
                  </span>

                </div>

                <div className="space-y-2 text-sm">

                  <div className="flex items-center gap-2 text-slate-300">
                    <User size={15} className="text-slate-400 shrink-0" />
                    <span className="break-words">
                      {b.user?.fullName || 'Unknown User'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Ticket size={15} className="text-slate-400 shrink-0" />
                    <span>
                      {b.ticketTypeName} × {b.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-slate-400" />

                    <span className={getPaymentStyle(b.paymentStatus)}>
                      {b.paymentStatus || 'Pending Payment'}
                    </span>
                  </div>

                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">

                  <div>
                    <p className="text-xs text-slate-400">
                      Total Amount
                    </p>

                    <p className="text-lg font-bold mt-1">
                      ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">
                      Check-in
                    </p>

                    <span className={`text-xs ${b.isCheckedIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {b.isCheckedIn ? 'Checked In' : 'Pending'}
                    </span>
                  </div>

                </div>

                <button
                  className="w-full bg-purple/15 text-purple hover:bg-purple/25 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={() => setSelected(b)}
                >
                  <Eye size={16} />
                  View Booking Details
                </button>

              </div>
            ))}

            {!list.length && (
              <div className="bg-card rounded-2xl p-8 text-center text-slate-400">
                No bookings found.
              </div>
            )}

          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block bg-card rounded-2xl overflow-hidden">

            <div className="p-5 border-b border-white/5">
              <h2 className="font-bold text-lg">
                Booking Records
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">

                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="p-4 text-left">Booking ID</th>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Event</th>
                    <th className="p-4 text-center">Tier</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Payment</th>
                    <th className="p-4 text-center">Check-in</th>
                    <th className="p-4 text-center">Amount</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((b) => (
                    <tr
                      key={b._id}
                      className="border-t border-white/5 hover:bg-white/[0.03]"
                    >
                      <td className="p-4 font-mono text-xs text-purple">
                        {b.bookingId}
                      </td>

                      <td className="p-4">
                        {b.user?.fullName || '-'}
                      </td>

                      <td className="p-4 max-w-[180px]">
                        <p className="truncate">
                          {b.event?.title || '-'}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        {b.ticketTypeName} × {b.quantity}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      <td className={`p-4 text-center ${getPaymentStyle(b.paymentStatus)}`}>
                        {b.paymentStatus || '-'}
                      </td>

                      <td className="p-4 text-center">
                        {b.isCheckedIn ? (
                          <span className="text-emerald-400">
                            Checked In
                          </span>
                        ) : (
                          <span className="text-amber-400">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center font-semibold">
                        ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          className="text-purple hover:text-white flex items-center justify-center gap-1 mx-auto"
                          onClick={() => setSelected(b)}
                        >
                          <Eye size={15} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!list.length && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center text-slate-400"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card rounded-2xl p-4">

        <p className="text-sm text-slate-400">
          Page {page} of {currentPages}
        </p>

        <div className="flex items-center gap-3">

          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-xl disabled:opacity-30"
          >
            <ChevronLeft size={17} />
            Prev
          </button>

          <span className="text-sm text-slate-300">
            {page} / {currentPages}
          </span>

          <button
            disabled={page >= currentPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 py-2 bg-purple rounded-xl disabled:opacity-30"
          >
            Next
            <ChevronRight size={17} />
          </button>

        </div>
      </div>

      {/* Booking Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold">
                Booking Details
              </h2>

              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-navySoft rounded-xl p-4">
              <p className="text-xs text-slate-400">
                Booking ID
              </p>

              <p className="font-mono text-purple break-all mt-1">
                {selected.bookingId}
              </p>
            </div>

            <div className="space-y-3 text-sm">

              <div>
                <p className="text-slate-400">Attendee</p>
                <p className="font-semibold mt-1">
                  {selected.user?.fullName || '-'}
                </p>
                <p className="text-slate-400 break-all">
                  {selected.user?.email || '-'}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Event</p>
                <p className="font-semibold mt-1">
                  {selected.event?.title || '-'}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Ticket</p>
                <p className="font-semibold mt-1">
                  {selected.ticketTypeName} × {selected.quantity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <p className="text-slate-400">Booking Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-lg text-xs ${getStatusStyle(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>

                <div>
                  <p className="text-slate-400">Payment</p>
                  <p className={`mt-1 ${getPaymentStyle(selected.paymentStatus)}`}>
                    {selected.paymentStatus || '-'}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-slate-400">Check-in Status</p>
                <p className={`mt-1 ${selected.isCheckedIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selected.isCheckedIn ? 'Checked In' : 'Pending'}
                </p>
              </div>

              <div className="bg-navySoft rounded-xl p-4 flex justify-between items-center">
                <span className="text-slate-400">
                  Total Amount
                </span>

                <span className="text-xl font-bold">
                  ₹{Number(selected.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

            </div>

            {selected.qrCodeUrl && (
              <div className="text-center border-t border-white/5 pt-4">
                <p className="text-sm text-slate-400 mb-3">
                  Booking QR Code
                </p>

                <img
                  src={selected.qrCodeUrl}
                  alt="Booking QR Code"
                  className="w-40 h-40 object-contain bg-white rounded-xl p-2 mx-auto"
                />
              </div>
            )}

            {selected.qrToken && (
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  QR Token
                </p>

                <p className="text-xs font-mono bg-navySoft p-3 rounded-xl break-all">
                  {selected.qrToken}
                </p>
              </div>
            )}

            <button
              className="w-full bg-purple hover:opacity-90 py-3 rounded-xl font-semibold"
              onClick={() => setSelected(null)}
            >
              Close Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
