'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { AnalyticsStatCard } from '@/components/analytics/AnalyticsStatCard';
import { useSellerAnalytics } from '@/hooks/use-seller-analytics.hook';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Processing: '#3B82F6',
  Shipped: '#8B5CF6',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const TOOLTIP_STYLE = {
  backgroundColor: '#13131f',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '13px',
};

const AXIS_TICK_STYLE = { fill: '#6B7280', fontSize: 11 };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  const pct = percent as number ?? 0;
  if (pct < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const ir = innerRadius as number ?? 0;
  const or = outerRadius as number ?? 0;
  const angle = midAngle as number ?? 0;
  const radius = ir + (or - ir) * 0.55;
  const x = (cx as number) + radius * Math.cos(-angle * RADIAN);
  const y = (cy as number) + radius * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(pct * 100).toFixed(0)}%`}
    </text>
  );
}

export default function SellerAnalyticsPage() {
  const { analytics, isLoading, error } = useSellerAnalytics();

  return (
    <SellerLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Sales performance overview for your store</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading analytics…</p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isLoading && !error && analytics && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <AnalyticsStatCard
                label="Total Revenue"
                value={formatCurrency(analytics.totalRevenue)}
                sub="All time"
                gradient="from-indigo-500 to-purple-600"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <AnalyticsStatCard
                label="Total Orders"
                value={analytics.totalOrders.toLocaleString()}
                sub="All time"
                gradient="from-sky-500 to-cyan-400"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <AnalyticsStatCard
                label="Avg Order Value"
                value={formatCurrency(analytics.avgOrderValue)}
                sub="Per order"
                gradient="from-emerald-500 to-teal-400"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                }
              />
              <AnalyticsStatCard
                label="Delivered Rate"
                value={`${analytics.deliveredRate.toFixed(1)}%`}
                sub="Orders delivered"
                gradient="from-pink-500 to-rose-500"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              />
            </div>

            {/* ── Row 1: Revenue area + Orders bar ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue over last 30 days */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Revenue — Last 30 Days</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Daily revenue trend</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics.dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Orders count per day */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Orders — Last 30 Days</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Daily order count</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [Number(v), 'Orders']}
                    />
                    <Bar dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Row 2: Status donut + Top products bar ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Orders by status */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Orders by Status</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Distribution across all order statuses</p>
                </div>
                {analytics.statusData.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-16">No orders yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={analytics.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        dataKey="value"
                        labelLine={false}
                        label={CustomPieLabel}
                      >
                        {analytics.statusData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] ?? '#6B7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(v, name) => [Number(v), String(name)]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                          <span style={{ color: '#9CA3AF', fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top 5 products by revenue */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Top Products by Revenue</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Your 5 highest-grossing products</p>
                </div>
                {analytics.topProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-16">No sales data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      layout="vertical"
                      data={analytics.topProducts.map((p) => ({
                        ...p,
                        name: truncate(p.name, 22),
                      }))}
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={AXIS_TICK_STYLE}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={AXIS_TICK_STYLE}
                        tickLine={false}
                        axisLine={false}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={22}>
                        {analytics.topProducts.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Row 3: Revenue by category ── */}
            {analytics.categoryRevenue.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Revenue by Category</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Which categories are driving the most revenue</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryRevenue}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      dataKey="value"
                      labelLine={false}
                      label={CustomPieLabel}
                    >
                      {analytics.categoryRevenue.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v, name) => [formatCurrency(Number(v)), String(name)]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Empty state when no orders exist at all */}
            {analytics.totalOrders === 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
                <p className="text-gray-400 font-medium">No orders yet</p>
                <p className="text-sm text-gray-600 mt-1">
                  Analytics will appear here once customers start placing orders.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </SellerLayout>
  );
}
