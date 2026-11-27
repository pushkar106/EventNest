
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  deleteEvent,
  featureEvent,
  fetchAdminEvents,
  publishEvent,
} from '../store/slices/eventsSlice';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Ticket,
  Star,
  Edit,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';

export default function Events() {
  const dispatch = useDispatch();

  const { list, total, pages, loading } = useSelector(
    (s) => s.adminEvents
  );

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = (p = page) =>
    dispatch(
      fetchAdminEvents({
        search,
        status,
        page: p,
        limit: 10,
      })
    );

  useEffect(() => {
    load();
  }, [page, status]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(
      fetchAdminEvents({
        search,
        status,
        page: 1,
        limit: 10,
      })
    );
  };

  const handleDelete = (event) => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      dispatch(deleteEvent(event._id));
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Events
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage and monitor all your events
          </p>
        </div>

        <Link
          to="/events/new"
          className="inline-flex items-center justify-center gap-2
          bg-purple hover:opacity-90 px-5 py-3 rounded-xl
          font-semibold w-full sm:w-auto"
        >
          <Plus size={19} />
          Create event
        </Link>
      </div>

      {/* TOTAL */}
      <div className="bg-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Total Events</p>
          <h2 className="text-2xl font-bold mt-1">{total}</h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-purple/20
        flex items-center justify-center text-purple">
          <Calendar size={24} />
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <form
        onSubmit={applySearch}
        className="bg-card rounded-2xl p-4
        flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2
            -translate-y-1/2 text-slate-400"
          />

          <input
            className="w-full rounded-xl p-3 pl-10
            bg-navySoft border border-white/10
            outline-none focus:border-purple"
            placeholder="Search event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="w-full sm:w-48 rounded-xl p-3
          bg-navySoft border border-white/10 outline-none"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {[
            'DRAFT',
            'PUBLISHED',
            'SOLD_OUT',
            'COMPLETED',
            'CANCELLED',
          ].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          type="submit"
          className="flex items-center justify-center gap-2
          bg-purple px-5 py-3 rounded-xl font-semibold"
        >
          <Filter size={17} />
          Filter
        </button>
      </form>

      {/* MOBILE EVENT CARDS */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">

        {loading ? (
          <p className="text-center text-slate-400 p-8">
            Loading events...
          </p>
        ) : list.length ? (
          list.map((e) => (
            <div
              key={e._id}
              className="bg-card rounded-2xl p-4
              border border-white/5 space-y-4"
            >

              <div className="flex justify-between items-start gap-3">

                <div className="min-w-0">
                  <h3 className="font-bold text-base break-words">
                    {e.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {e.category}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2 py-1 rounded-lg
                  text-xs font-semibold ${
                    e.status === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {e.status}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-navySoft rounded-xl p-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={13} /> City
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {e.venue?.city || '-'}
                  </p>
                </div>

                <div className="bg-navySoft rounded-xl p-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Ticket size={13} /> Bookings
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {e.bookingCount || 0}
                  </p>
                </div>

              </div>

              <button
                onClick={() => dispatch(featureEvent(e._id))}
                className={`w-full flex items-center justify-center
                gap-2 rounded-xl p-2 text-sm ${
                  e.isFeatured
                    ? 'bg-purple/20 text-purple'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                <Star size={15} />
                {e.isFeatured ? 'Featured Event' : 'Mark as Featured'}
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2
              border-t border-white/10">

                <Link
                  to={`/events/${e._id}/edit`}
                  className="flex items-center justify-center gap-1
                  bg-white/10 rounded-lg p-2 text-xs"
                >
                  <Edit size={14} /> Edit
                </Link>

                <button
                  onClick={() => dispatch(publishEvent(e._id))}
                  className="flex items-center justify-center gap-1
                  bg-purple/20 text-purple rounded-lg p-2 text-xs"
                >
                  <Eye size={14} />
                  {e.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={() => handleDelete(e)}
                  className="flex items-center justify-center gap-1
                  bg-rose-500/10 text-rose-400 rounded-lg p-2 text-xs"
                >
                  <Trash2 size={14} /> Delete
                </button>

              </div>

            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 p-8 bg-card rounded-xl">
            No events found.
          </p>
        )}

      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto
      bg-card rounded-2xl">

        <table className="w-full text-sm">

          <thead className="text-slate-400">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>City</th>
              <th>Bookings</th>
              <th>Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : list.map((e) => (
              <tr
                key={e._id}
                className="border-t border-white/5"
              >
                <td className="p-4 font-medium">{e.title}</td>

                <td className="text-center text-slate-300">
                  {e.category}
                </td>

                <td className="text-center">
                  <span className="px-2 py-1 rounded-lg
                  bg-white/10 text-xs">
                    {e.status}
                  </span>
                </td>

                <td className="text-center">
                  {e.venue?.city}
                </td>

                <td className="text-center">
                  {e.bookingCount || 0}
                </td>

                <td className="text-center">
                  <button
                    onClick={() => dispatch(featureEvent(e._id))}
                    className="text-purple"
                  >
                    {e.isFeatured ? '★ Featured' : '☆ Standard'}
                  </button>
                </td>

                <td className="p-4 text-right whitespace-nowrap space-x-3">

                  <Link
                    className="text-accent"
                    to={`/events/${e._id}/edit`}
                  >
                    Edit
                  </Link>

                  <button
                    className="text-purple"
                    onClick={() => dispatch(publishEvent(e._id))}
                  >
                    {e.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    className="text-rose-400"
                    onClick={() => handleDelete(e)}
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}

            {!loading && !list.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No events found.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-wrap items-center justify-between
      gap-3 bg-card rounded-xl p-4">

        <span className="text-sm text-slate-400">
          Page {page} of {pages || 1}
        </span>

        <div className="flex gap-2">

          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white/10 rounded-lg
            disabled:opacity-40"
          >
            Previous
          </button>

          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-purple rounded-lg
            disabled:opacity-40"
          >
            Next
          </button>

        </div>
      </div>

    </div>
  );
}
