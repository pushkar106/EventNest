
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

import {
  TrendingUp,
  Ticket,
  XCircle,
  IndianRupee,
  BarChart3
} from 'lucide-react';

export default function Analytics() {
  const dispatch = useDispatch();

  const { stats, charts, loading, error } =
    useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const bookings = (charts?.monthlyBookings || []).map((b) => ({
    name: `${b._id.month}/${b._id.year}`,
    count: b.count,
    revenue: b.revenue,
  }));

  const cards = [
    {
      label: 'Confirmed bookings',
      value: stats?.confirmedBookings ?? 0,
      icon: Ticket,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Cancelled bookings',
      value: stats?.cancelledBookings ?? 0,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Total revenue',
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-purple',
      bg: 'bg-purple/10',
    },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-purple/20 border-t-purple rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-card border border-rose-500/20 rounded-2xl p-6">
        <p className="text-rose-400">{error}</p>
        <button
          onClick={() => dispatch(fetchDashboard())}
          className="mt-4 px-5 py-2 rounded-xl bg-purple text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#172238',
    border: '1px solid #303D59',
    borderRadius: '12px',
    color: '#fff',
  };

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple text-sm font-semibold mb-2">
            <BarChart3 size={17}/>
            ANALYTICS OVERVIEW
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Analytics
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Track bookings and revenue performance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="text-xs text-emerald-400 font-semibold">
            Live statistics
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-card border border-white/5 rounded-2xl p-5 hover:border-purple/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm font-medium">
                {label}
              </p>

              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={21} className={color}/>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 break-words">
              {value}
            </h2>

            <div className="flex items-center gap-2 mt-3">
              <TrendingUp size={15} className="text-emerald-400"/>
              <span className="text-xs text-slate-500">
                Overall platform statistics
              </span>
            </div>
          </div>
        ))}

      </div>

      {/* Booking Volume Chart */}
      <div className="bg-card border border-white/5 rounded-2xl p-4 sm:p-6 min-w-0">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold">
              Booking volume
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monthly booking activity
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-400"/>
            Bookings
          </div>
        </div>

        <div className="h-64 sm:h-72 lg:h-80 w-full min-w-0">

          {bookings.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookings}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#28344B"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#9AA4B2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#9AA4B2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={40}
                />

                <Tooltip contentStyle={tooltipStyle}/>

                <Bar
                  dataKey="count"
                  name="Bookings"
                  fill="#4C8DFF"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BarChart3 size={35} className="text-slate-600 mb-3"/>
              <p className="text-slate-400 text-sm">
                No booking data available yet
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-white/5 rounded-2xl p-4 sm:p-6 min-w-0">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold">
              Booking revenue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monthly revenue performance
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-purple bg-purple/10 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-purple"/>
            Revenue
          </div>
        </div>

        <div className="h-64 sm:h-72 lg:h-80 w-full min-w-0">

          {bookings.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={bookings}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#28344B"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#9AA4B2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#9AA4B2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />

                <Tooltip contentStyle={tooltipStyle}/>

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#7C5CFF"
                  strokeWidth={3}
                  dot={{ fill: '#7C5CFF', r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <TrendingUp size={35} className="text-slate-600 mb-3"/>
              <p className="text-slate-400 text-sm">
                No revenue data available yet
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
