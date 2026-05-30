import { Sun, Cloud, CloudSun, Flame, Droplets, Wind } from 'lucide-react'

const WEATHER = [
  {
    city: 'Tashkent',
    region: 'tashkent',
    temp: 28, feels: 30,
    condition: 'Sunny',
    humidity: 42, wind: 14, uv: 7,
    tip: 'Ideal for sightseeing',
    type: 'sunny',
  },
  {
    city: 'Samarkand',
    region: 'samarkand',
    temp: 32, feels: 35,
    condition: 'Partly Cloudy',
    humidity: 38, wind: 10, uv: 8,
    tip: 'Great touring weather',
    type: 'partly',
  },
  {
    city: 'Bukhara',
    region: 'bukhara',
    temp: 38, feels: 42,
    condition: 'Hot & Sunny',
    humidity: 25, wind: 18, uv: 10,
    tip: 'Bring sunscreen & water',
    type: 'hot',
  },
  {
    city: 'Urgench',
    region: 'khorezm',
    temp: 35, feels: 38,
    condition: 'Clear Sky',
    humidity: 30, wind: 12, uv: 9,
    tip: 'Hot but pleasant',
    type: 'sunny',
  },
  {
    city: 'Fergana',
    region: 'fergana',
    temp: 26, feels: 27,
    condition: 'Light Cloud',
    humidity: 55, wind: 8, uv: 5,
    tip: 'Pleasant valley breeze',
    type: 'partly',
  },
  {
    city: 'Termez',
    region: 'surkhandarya',
    temp: 42, feels: 46,
    condition: 'Extreme Heat',
    humidity: 20, wind: 20, uv: 11,
    tip: 'Extreme heat — plan early',
    type: 'extreme',
  },
]

const STYLES = {
  sunny:   { from: 'from-amber-400',   to: 'to-orange-400',   Icon: Sun },
  partly:  { from: 'from-sky-400',     to: 'to-blue-500',     Icon: CloudSun },
  hot:     { from: 'from-red-400',     to: 'to-orange-500',   Icon: Flame },
  extreme: { from: 'from-rose-600',    to: 'to-red-700',      Icon: Flame },
}

function WeatherCard({ w }) {
  const { from, to, Icon } = STYLES[w.type]
  return (
    <div className={`relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br ${from} ${to} text-white shadow-lg`}>
      {/* Decorative glow circle */}
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/15 pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-1">
          <p className="font-bold text-sm leading-tight">{w.city}</p>
          <Icon className="w-4 h-4 text-white/85 shrink-0 mt-0.5" />
        </div>
        <p className="text-white/65 text-xs mb-2">{w.condition}</p>
        <p className="text-3xl font-display font-bold leading-none">{w.temp}°C</p>
        <p className="text-white/60 text-xs mt-0.5">Feels {w.feels}°</p>
        <div className="flex items-center gap-3 mt-2.5 text-xs text-white/75">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />{w.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3" />{w.wind} km/h
          </span>
          <span>UV {w.uv}</span>
        </div>
        <p className="text-xs text-white/55 mt-2 italic leading-tight">{w.tip}</p>
      </div>
    </div>
  )
}

export default function WeatherWidget() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
          Weather Today
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">{today}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {WEATHER.map(w => <WeatherCard key={w.city} w={w} />)}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
        Indicative temperatures for trip planning
      </p>
    </div>
  )
}
