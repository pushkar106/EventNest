
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

import {
  Users,
  CalendarDays,
  CalendarCheck,
  Ticket,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Activity,
  RefreshCw,
} from 'lucide-react';

const COLORS = [
  '#8B5CF6',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#F43F5E',
  '#06B6D4',
];

const icons = [
  Users,
  CalendarDays,
  CalendarCheck,
  Ticket,
  CheckCircle2,
  IndianRupee,
];

const cardStyles = [
  'from-purple-500/15 to-purple-500/5',
  'from-blue-500/15 to-blue-500/5',
  'from-emerald-500/15 to-emerald-500/5',
  'from-orange-500/15 to-orange-500/5',
  'from-cyan-500/15 to-cyan-500/5',
  'from-amber-500/15 to-amber-500/5',
];

const iconStyles = [
  'bg-purple-500/15 text-purple-400',
  'bg-blue-500/15 text-blue-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-orange-500/15 text-orange-400',
  'bg-cyan-500/15 text-cyan-400',
  'bg-amber-500/15 text-amber-400',
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#182238] px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      <p className="font-bold text-white">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const dispatch = useDispatch();

  const { stats, charts, loading, error } = useSelector(
    (s) => s.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-purple-400" size={32} />
        <p className="text-sm text-slate-400">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
        <p className="font-semibold text-rose-400">
          Unable to load dashboard
        </p>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button
          onClick={() => dispatch(fetchDashboard())}
          className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    ['Users', stats.totalUsers],
    ['Events', stats.totalEvents],
    ['Published', stats.publishedEvents],
    ['Bookings', stats.totalBookings],
    ['Checked In', stats.checkedInCount ?? 0],
    ['Revenue', formatCurrency(stats.totalRevenue)],
  ];

  const revenue = (charts?.revenueByMonth || []).map((r) => ({
    name: `${r._id.month}/${r._id.year}`,
    revenue: r.revenue,
  }));

  const cats = charts?.categoryData || [];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399]" />
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-400">
              Admin Control Center
            </p>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Overview
          </h1>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Monitor your events, bookings and revenue.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchDashboard())}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white disabled:opacity-50 sm:px-4 sm:text-sm"
        >
          <RefreshCw
            size={15}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={17} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white sm:text-base">
            Platform Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">

          {cards.map(([label, value], i) => {
            const Icon = icons[i];

            return (
              <div
                key={label}
                className={`group relative min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${cardStyles[i]} p-3.5 transition duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl sm:p-5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-medium text-slate-400 sm:text-sm">
                    {label}
                  </p>

                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconStyles[i]}`}>
                    <Icon size={16} />
                  </div>
                </div>

                <p className="mt-4 break-words text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-[26px]">
                  {value}
                </p>

                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full opacity-70"
                    style={{
                      width: `${35 + i * 10}%`,
                      background: COLORS[i],
                    }}
                  />
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* Charts */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white sm:text-base">
            Performance Analytics
          </h2>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

          {/* Revenue Chart */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-card p-4 sm:p-5">

            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white sm:text-lg">
                  Revenue
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Monthly revenue overview
                </p>
              </div>

              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                <TrendingUp size={19} />
              </div>
            </div>

            <div className="h-[250px] w-full min-w-0 sm:h-[290px]">
              {revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenue}
                    margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#ffffff"
                      strokeOpacity={0.06}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      minTickGap={15}
                    />

                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `${(value / 1000).toFixed(1)}k`
                          : value
                      }
                      width={45}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#8B5CF6', strokeDasharray: '4 4' }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      activeDot={{
                        r: 5,
                        fill: '#A78BFA',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Category Chart */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-card p-4 sm:p-5">

            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white sm:text-lg">
                  Events by category
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Category distribution
                </p>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                <CalendarDays size={19} />
              </div>
            </div>

            {cats.length > 0 ? (
              <>
                <div className="h-[230px] w-full min-w-0 sm:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cats}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius="48%"
                        outerRadius="78%"
                        paddingAngle={4}
                        stroke="none"
                      >
                        {cats.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background: '#182238',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/5 pt-4">
                  {cats.map((cat, i) => (
                    <div
                      key={i}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: COLORS[i % COLORS.length],
                        }}
                      />

                      <span className="truncate text-xs text-slate-400">
                        {cat._id}
                      </span>

                      <span className="ml-auto shrink-0 text-xs font-bold text-white">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[230px] items-center justify-center text-sm text-slate-500">
                No category data available
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-3 text-[11px] text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        EventNest Admin Dashboard
      </div>

    </div>
  );
}
