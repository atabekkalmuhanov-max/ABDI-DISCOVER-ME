import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MONTHLY = [
  { month: 'Jan', visitors: 45, revenue: 2.1 },
  { month: 'Feb', visitors: 52, revenue: 2.4 },
  { month: 'Mar', visitors: 78, revenue: 3.6 },
  { month: 'Apr', visitors: 125, revenue: 5.8 },
  { month: 'May', visitors: 148, revenue: 6.9 },
  { month: 'Jun', visitors: 112, revenue: 5.2 },
  { month: 'Jul', visitors: 98,  revenue: 4.5 },
  { month: 'Aug', visitors: 115, revenue: 5.3 },
  { month: 'Sep', visitors: 142, revenue: 6.6 },
  { month: 'Oct', visitors: 158, revenue: 7.3 },
  { month: 'Nov', visitors: 88,  revenue: 4.1 },
  { month: 'Dec', visitors: 62,  revenue: 2.9 },
]

const REGIONS = [
  { region: 'Tashkent',     visitors: 240, color: '#3d56f5' },
  { region: 'Samarkand',    visitors: 180, color: '#10b981' },
  { region: 'Bukhara',      visitors: 155, color: '#f59e0b' },
  { region: 'Kashkadarya',  visitors: 95,  color: '#f97316' },
  { region: 'Fergana',      visitors: 82,  color: '#a855f7' },
  { region: 'Khorezm',      visitors: 68,  color: '#06b6d4' },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/95 text-white text-xs px-3 py-2.5 rounded-xl shadow-2xl border border-white/10">
      <p className="font-bold mb-1.5 text-slate-200">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color || '#94a3b8' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name === 'visitors' ? `${p.value}K visitors` : p.name === 'revenue' ? `$${p.value}M revenue` : `${p.value}K`}
        </p>
      ))}
    </div>
  )
}

export default function TravelStats() {
  return (
    <div className="space-y-8">
      {/* Monthly visitors area chart */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Monthly Visitors 2024
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-1.5 rounded-full bg-primary-500 inline-block" />
              Visitors (K)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-1.5 rounded-full bg-gold-500 inline-block" />
              Revenue ($M)
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={195}>
          <AreaChart data={MONTHLY} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3d56f5" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#3d56f5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e0a000" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#e0a000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.55} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone" dataKey="visitors" stroke="#3d56f5" strokeWidth={2.2}
              fill="url(#gradVisitors)" dot={false} activeDot={{ r: 4, fill: '#3d56f5' }}
            />
            <Area
              type="monotone" dataKey="revenue" stroke="#e0a000" strokeWidth={2.2}
              fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: '#e0a000' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top regions horizontal bar chart */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Top Regions by Annual Visitors (K)
        </h3>
        <ResponsiveContainer width="100%" height={185}>
          <BarChart
            data={REGIONS}
            layout="vertical"
            margin={{ top: 0, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.55} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="region" width={85}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(63,86,245,0.06)' }} />
            <Bar dataKey="visitors" radius={[0, 5, 5, 0]} maxBarSize={18}>
              {REGIONS.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
