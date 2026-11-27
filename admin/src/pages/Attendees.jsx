
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminEvents } from '../store/slices/eventsSlice';
import {
  clearVerify,
  fetchAttendees,
  manualCheckin,
  updateAttendanceStatus
} from '../store/slices/bookingsSlice';

export default function Attendees() {
  const dispatch = useDispatch();

  const events = useSelector((s) => s.adminEvents.list);
  const { attendees, lastVerify, error } = useSelector(
    (s) => s.adminBookings
  );

  const [eventId, setEventId] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    dispatch(clearVerify());
    dispatch(fetchAdminEvents({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!eventId && events.length) {
      setEventId(events[0]._id);
      dispatch(fetchAttendees(events[0]._id));
    }
  }, [events, eventId, dispatch]);

  const onCheckin = async () => {
    if (!bookingId.trim()) return;

    dispatch(clearVerify());

    const res = await dispatch(
      manualCheckin({
        bookingId,
        eventId: eventId || undefined
      })
    );

    if (res.meta.requestStatus === 'fulfilled' && eventId) {
      dispatch(fetchAttendees(eventId));
      setBookingId('');
    }
  };

  const presentCount = attendees.filter(
    (a) => a.status === 'PRESENT'
  ).length;

  const notYetCount = attendees.filter(
    (a) => a.status === 'NOT_YET'
  ).length;

  const absentCount = attendees.filter(
    (a) => a.status === 'ABSENT'
  ).length;

  const handleEventChange = (value) => {
    setEventId(value);

    if (value) {
      dispatch(fetchAttendees(value));
    }
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateAttendanceStatus({ id, status }));
  };

  const statusStyle = (status) => {
    if (status === 'PRESENT') {
      return 'bg-emerald-500/10 text-emerald-400';
    }

    if (status === 'ABSENT') {
      return 'bg-rose-500/10 text-rose-400';
    }

    return 'bg-amber-500/10 text-amber-400';
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Attendees
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage event attendees and verify tickets.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          Total attendees: {attendees.length}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <div className="bg-card rounded-2xl p-4">
          <p className="text-xs sm:text-sm text-slate-400">
            Total Attendees
          </p>
          <p className="text-2xl font-bold mt-2">
            {attendees.length}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <p className="text-xs sm:text-sm text-slate-400">
            Checked In
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {presentCount}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <p className="text-xs sm:text-sm text-slate-400">
            Not Checked In
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {notYetCount}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <p className="text-xs sm:text-sm text-slate-400">
            Absent
          </p>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            {absentCount}
          </p>
        </div>

      </div>

      {/* Event Selector */}
      <div className="bg-card rounded-2xl p-4 sm:p-5">
        <label className="block text-sm text-slate-400 mb-2">
          Select Event
        </label>

        <select
          className="w-full sm:max-w-md bg-navy border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple"
          value={eventId}
          onChange={(e) => handleEventChange(e.target.value)}
        >
          <option value="">Select event</option>

          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Manual Verification */}
      <div className="bg-card rounded-2xl p-4 sm:p-5">
        <h2 className="font-bold text-lg mb-1">
          Manual Ticket Verification
        </h2>

        <p className="text-sm text-slate-400 mb-4">
          Enter booking ID to manually check in an attendee.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="w-full min-w-0 sm:flex-1 bg-navy border border-white/10 rounded-xl p-3 outline-none focus:border-purple"
            placeholder="Booking ID e.g. BK..."
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />

          <button
            className="w-full sm:w-auto bg-purple hover:opacity-90 px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            onClick={onCheckin}
            disabled={!bookingId.trim()}
          >
            Check In
          </button>
        </div>

        {lastVerify?.message && (
          <p className="text-emerald-400 mt-3 text-sm">
            {lastVerify.message}
          </p>
        )}

        {error && (
          <p className="text-rose-400 mt-3 text-sm">
            {error}
          </p>
        )}
      </div>

      {/* Mobile Attendee Cards */}
      <div className="md:hidden space-y-3">
        <h2 className="font-bold text-lg">
          Attendee List
        </h2>

        {attendees.map((a) => (
          <div
            key={a._id}
            className="bg-card border border-white/5 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold break-words">
                  {a.user?.fullName || 'Unknown'}
                </p>
                <p className="text-xs text-slate-400 break-all mt-1">
                  {a.user?.email}
                </p>
              </div>

              <span className={`text-xs px-2 py-1 rounded-lg shrink-0 ${statusStyle(a.status)}`}>
                {a.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Booking ID</p>
                <p className="font-mono text-xs mt-1 break-all">
                  {a.booking?.bookingId || '-'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs">Ticket Type</p>
                <p className="mt-1">
                  {a.booking?.ticketTypeName || '-'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs">Quantity</p>
                <p className="mt-1">
                  {a.booking?.quantity ?? '-'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs">Method</p>
                <p className="mt-1">
                  {a.verificationMethod || '-'}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <label className="block text-xs text-slate-400 mb-2">
                Update Attendance Status
              </label>

              <select
                className="w-full bg-navy border border-white/10 rounded-xl p-3 text-sm"
                value={a.status}
                onChange={(e) =>
                  handleStatusChange(a._id, e.target.value)
                }
              >
                <option value="NOT_YET">NOT_YET</option>
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>
          </div>
        ))}

        {!attendees.length && (
          <div className="bg-card rounded-2xl p-8 text-center text-slate-400">
            No attendees for this event yet.
          </div>
        )}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden md:block bg-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-bold text-lg">
            Attendee List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[850px]">
            <thead className="text-slate-400 bg-white/5">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Booking</th>
                <th className="p-4 text-left">Tier</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-left">Update</th>
              </tr>
            </thead>

            <tbody>
              {attendees.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-4">
                    {a.user?.fullName || '-'}
                  </td>

                  <td className="p-4">
                    {a.user?.email || '-'}
                  </td>

                  <td className="p-4 font-mono text-xs">
                    {a.booking?.bookingId || '-'}
                  </td>

                  <td className="p-4">
                    {a.booking?.ticketTypeName} × {a.booking?.quantity}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${statusStyle(a.status)}`}>
                      {a.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {a.verificationMethod || '-'}
                  </td>

                  <td className="p-4">
                    <select
                      className="bg-navy rounded-lg p-2 text-xs border border-white/10"
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a._id, e.target.value)
                      }
                    >
                      <option value="NOT_YET">NOT_YET</option>
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                    </select>
                  </td>
                </tr>
              ))}

              {!attendees.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-400"
                  >
                    No attendees for this event yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
