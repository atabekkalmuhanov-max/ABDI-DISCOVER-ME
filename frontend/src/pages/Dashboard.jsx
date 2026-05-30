import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  MapPin, Star, Users, TrendingUp, Search, ArrowRight, Sparkles,
  Clock, X, Map, CalendarDays, Globe, Award, ChevronRight, Compass,
  BookOpen, Heart, Thermometer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'
import { dashboardService, destinationService } from '@/services/api'
import UzbekistanMap, { UZBEKISTAN_REGIONS } from '@/components/dashboard/UzbekistanMap'
import WeatherWidget from '@/components/dashboard/WeatherWidget'
import TravelStats from '@/components/dashboard/TravelStats'

/* ── Static data ──────────────────────────────────────────── */

const POPULAR_ATTRACTIONS = [
  {
    id: 'a1', name: 'Registan', region: 'Samarkand', category: 'Architecture',
    rating: 4.9, visits: '450K/yr', regionColor: '#10b981',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Registan_Samarkand.jpg/480px-Registan_Samarkand.jpg',
  },
  {
    id: 'a2', name: 'Ichan Kala · Khiva', region: 'Khorezm', category: 'Old City',
    rating: 4.8, visits: '280K/yr', regionColor: '#06b6d4',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Khiva_viewed_from_Islam_Khodja_minaret.jpg/480px-Khiva_viewed_from_Islam_Khodja_minaret.jpg',
  },
  {
    id: 'a3', name: 'Kalon Minaret', region: 'Bukhara', category: 'Monument',
    rating: 4.9, visits: '380K/yr', regionColor: '#f59e0b',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bukhara-Citadel_ARK.jpg/480px-Bukhara-Citadel_ARK.jpg',
  },
  {
    id: 'a4', name: 'Shah-i-Zinda', region: 'Samarkand', category: 'Mausoleum',
    rating: 4.9, visits: '320K/yr', regionColor: '#10b981',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Shah-i-Zinda_Ensemble.jpg/480px-Shah-i-Zinda_Ensemble.jpg',
  },
  {
    id: 'a5', name: 'Chorsu Bazaar', region: 'Tashkent', category: 'Market',
    rating: 4.7, visits: '520K/yr', regionColor: '#3d56f5',
    image: 'https://placehold.co/480x320/1f2ab8/white?text=Chorsu+Bazaar',
  },
  {
    id: 'a6', name: 'Shakhrisabz', region: 'Kashkadarya', category: 'Historic City',
    rating: 4.8, visits: '260K/yr', regionColor: '#f97316',
    image: 'https://placehold.co/480x320/c2410c/white?text=Shakhrisabz',
  },
  {
    id: 'a7', name: 'Margilan Silk Bazaar', region: 'Fergana', category: 'Bazaar',
    rating: 4.7, visits: '185K/yr', regionColor: '#a855f7',
    image: 'https://placehold.co/480x320/7c3aed/white?text=Margilan+Silk',
  },
  {
    id: 'a8', name: 'Gur-e-Amir', region: 'Samarkand', category: 'Mausoleum',
    rating: 4.8, visits: '290K/yr', regionColor: '#10b981',
    image: 'https://placehold.co/480x320/059669/white?text=Gur-e-Amir',
  },
]

const QUICK_SEARCHES = [
  'Samarkand', 'Bukhara', 'Khiva', 'Tashkent', 'Silk Road', 'Registan',
]

/* ── Sub-components ───────────────────────────────────────── */

function GlassStatCard({ icon: Icon, label, value, sub, color }) {
  const ring = {
    blue:   'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    gold:   'bg-gold-100   dark:bg-gold-900/40    text-gold-600   dark:text-gold-400',
    green:  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  }
  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ring[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-display font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-white/70 mt-0.5 truncate">{label}</p>
        {sub && <p className="text-xs text-white/45 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function RegionDetailPanel({ region, onClose }) {
  return (
    <div className="card p-5 animate-slide-up h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: region.color }}
          >
            {region.name[0]}
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
              {region.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {region.capital}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        {region.desc}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Visitors', value: region.visitors, icon: Users },
          { label: 'Rating',   value: `${region.rating}★`, icon: Star },
          { label: 'Area',     value: region.area, icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-slate-50 dark:bg-dark-900 rounded-xl p-2.5 text-center">
            <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top attractions */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          Top Attractions
        </p>
        <div className="space-y-1.5">
          {region.top.map((attraction, i) => (
            <div key={attraction} className="flex items-center gap-2.5">
              <span
                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
                style={{ background: region.color }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{attraction}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/destinations?search=${encodeURIComponent(region.name)}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110"
        style={{ background: region.color }}
      >
        <Compass className="w-4 h-4" />
        Explore {region.name}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function RegionGrid({ onSelect, selectedId }) {
  return (
    <div className="card p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-4 h-4 text-primary-500" />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">
          Select a Region
        </h3>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        Click any region on the map — or pick from the list:
      </p>
      <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
        {UZBEKISTAN_REGIONS.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
              selectedId === r.id
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: r.color }}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {r.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AttractionCard({ a }) {
  return (
    <Link
      to={`/destinations?search=${encodeURIComponent(a.name)}`}
      className="group relative rounded-2xl overflow-hidden shrink-0 w-52 h-68 block shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ height: '272px' }}
    >
      <img
        src={a.image}
        alt={a.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={e => { e.target.src = `https://placehold.co/480x320/1f2ab8/white?text=${encodeURIComponent(a.name)}` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Category badge */}
      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm"
        style={{ color: a.regionColor }}>
        {a.category}
      </span>

      {/* Rating */}
      <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold bg-black/50 text-white backdrop-blur-sm px-2 py-1 rounded-full">
        <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
        {a.rating}
      </span>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h4 className="font-display font-bold text-white text-sm leading-tight mb-0.5">
          {a.name}
        </h4>
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />{a.region}
          </p>
          <p className="text-white/60 text-xs">{a.visits}</p>
        </div>
      </div>
    </Link>
  )
}

function RecentSearches({ searches, onRemove, onSearch }) {
  if (searches.length === 0) return null
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Recent Searches
        </h3>
        <button
          onClick={() => searches.forEach(s => onRemove(s))}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-full">
            <Search className="w-3 h-3 text-slate-400" />
            <button onClick={() => onSearch(s)} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {s}
            </button>
            <button onClick={() => onRemove(s)} className="text-slate-400 hover:text-red-400 transition-colors ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

function RecommendedCard({ dest }) {
  return (
    <Link
      to={`/destinations/${dest.id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
        <img
          src={dest.image_url || `https://placehold.co/120x120/1f2ab8/white?text=${encodeURIComponent(dest.name || 'UZ')}`}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://placehold.co/120x120/1f2ab8/white?text=UZ' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {dest.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{dest.country || 'Uzbekistan'}</p>
        {dest.rating && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {parseFloat(dest.rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
    </Link>
  )
}

/* ── Main Dashboard ───────────────────────────────────────── */

export default function Dashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [selectedRegion, setSelectedRegion] = useState(null)

  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dm_recent_searches') || '[]') }
    catch { return [] }
  })

  const { data: statsData } = useQuery('dashboard-stats', dashboardService.getStats, {
    retry: false,
    staleTime: 5 * 60_000,
  })

  const { data: featuredData, isLoading: recLoading } = useQuery(
    'dashboard-recommended',
    () => destinationService.getAll({ featured: true, limit: 4 }),
    { staleTime: 5 * 60_000 }
  )

  const saveSearch = useCallback((term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 8)
      localStorage.setItem('dm_recent_searches', JSON.stringify(next))
      return next
    })
  }, [])

  const removeSearch = useCallback((term) => {
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== term)
      localStorage.setItem('dm_recent_searches', JSON.stringify(next))
      return next
    })
  }, [])

  const handleSearch = useCallback((term) => {
    saveSearch(term)
    window.location.href = `/destinations?search=${encodeURIComponent(term)}`
  }, [saveSearch])

  const stats = statsData || {}
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const memberSince = new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-20">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-12 px-4">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-primary-400/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full border border-white/5" />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative">
          {/* Welcome row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold font-display shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-primary-300 text-sm">{greeting},</p>
              <h1 className="text-2xl font-display font-bold leading-tight">
                {user?.name || 'Traveller'}
              </h1>
              <p className="text-primary-300/70 text-xs mt-0.5 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Member since {memberSince}
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <Link
                to="/ai"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                AI Suggest
              </Link>
              <Link
                to="/map"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Map className="w-4 h-4" />
                Full Map
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GlassStatCard
              icon={MapPin} label="Destinations" color="blue"
              value={stats.total_destinations || '500+'}
              sub="Across Uzbekistan"
            />
            <GlassStatCard
              icon={Users} label="Travellers" color="green"
              value="50K+"
              sub="Active explorers"
            />
            <GlassStatCard
              icon={Star} label="Reviews" color="gold"
              value={stats.total_reviews || '12K+'}
              sub="Verified ratings"
            />
            <GlassStatCard
              icon={TrendingUp} label="Regions" color="purple"
              value="12"
              sub="Tourism viloyatlar"
            />
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">

        {/* ── Quick search bar ─────────────────────────────── */}
        <div className="card p-4">
          <form
            onSubmit={e => {
              e.preventDefault()
              const v = e.target.q.value.trim()
              if (v) handleSearch(v)
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                type="text"
                placeholder="Search destinations, regions, attractions…"
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 shrink-0">
              Search
            </button>
          </form>
          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Map + Right panel ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-xl">Explore Uzbekistan by Region</h2>
            <Link
              to="/map"
              className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Full interactive map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map (3/5) */}
            <div className="lg:col-span-3">
              <div className="card p-4">
                <UzbekistanMap
                  onRegionSelect={setSelectedRegion}
                  selectedId={selectedRegion?.id}
                />
              </div>
            </div>

            {/* Right panel (2/5) */}
            <div className="lg:col-span-2">
              {selectedRegion ? (
                <RegionDetailPanel
                  region={selectedRegion}
                  onClose={() => setSelectedRegion(null)}
                />
              ) : (
                <RegionGrid
                  onSelect={setSelectedRegion}
                  selectedId={selectedRegion?.id}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── Popular Attractions ──────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title text-xl">Popular Attractions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Must-see landmarks across Uzbekistan</p>
            </div>
            <Link
              to="/destinations"
              className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin">
            {POPULAR_ATTRACTIONS.map(a => (
              <AttractionCard key={a.id} a={a} />
            ))}
          </div>
        </section>

        {/* ── Weather + Recent searches row ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-5">
            <WeatherWidget />
          </div>
          <div className="space-y-4">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <RecentSearches
                searches={recentSearches}
                onRemove={removeSearch}
                onSearch={handleSearch}
              />
            )}
            {/* Quick actions */}
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { to: '/destinations', icon: Compass,  label: 'Explore Destinations', desc: 'Browse 500+ places', color: 'text-primary-600 dark:text-primary-400' },
                  { to: '/ai',           icon: Sparkles, label: 'AI Recommendations',  desc: 'Personalised trips',  color: 'text-gold-600   dark:text-gold-400'    },
                  { to: '/map',          icon: Map,      label: 'Interactive Map',      desc: 'Plan your route',    color: 'text-emerald-600 dark:text-emerald-400' },
                ].map(({ to, icon: Icon, label, desc, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${color} group-hover:scale-110 transition-transform`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Statistics + Recommendations ─────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts (2/3) */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                Travel Statistics
              </h2>
            </div>
            <TravelStats />
          </div>

          {/* Recommended (1/3) */}
          <div className="space-y-4">
            {/* Recommended destinations */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-gold-500" />
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                  Recommended
                </h3>
              </div>
              {recLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {(featuredData?.destinations || []).slice(0, 4).map(d => (
                    <RecommendedCard key={d.id} dest={d} />
                  ))}
                  {(!featuredData?.destinations?.length) && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Sign in to get personalised suggestions
                    </p>
                  )}
                </div>
              )}
              <Link
                to="/destinations"
                className="flex items-center justify-center gap-1.5 mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                All destinations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Season guide */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Best Time to Visit
                </h3>
              </div>
              {[
                { season: 'Spring', months: 'Mar – May', note: 'Perfect — flowers & mild heat', bar: 'bg-emerald-400', w: 'w-full' },
                { season: 'Autumn', months: 'Sep – Nov', note: 'Excellent — harvest & cool',    bar: 'bg-gold-400',    w: 'w-10/12' },
                { season: 'Winter', months: 'Dec – Feb', note: 'Quiet — cold but uncrowded',    bar: 'bg-sky-400',     w: 'w-6/12'  },
                { season: 'Summer', months: 'Jun – Aug', note: 'Hot — plan for early starts',   bar: 'bg-orange-400',  w: 'w-8/12'  },
              ].map(({ season, months, note, bar, w }) => (
                <div key={season} className="mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{season}</span>
                    <span className="text-xs text-slate-400">{months}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} ${w} rounded-full`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{note}</p>
                </div>
              ))}
            </div>

            {/* AI promo */}
            <Link to="/ai" className="card p-4 block bg-gradient-to-br from-primary-700 to-primary-900 border-primary-600 group hover:shadow-glow transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">AI Trip Planner</p>
                  <p className="text-primary-300 text-xs">Powered by Claude</p>
                </div>
              </div>
              <p className="text-primary-200 text-xs leading-relaxed mb-3">
                Describe your ideal Uzbekistan trip and get a personalised itinerary.
              </p>
              <span className="flex items-center gap-1.5 text-white font-semibold text-xs group-hover:gap-2.5 transition-all">
                Try now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* ── Recent activity + Account ─────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Saved Places',  value: '0',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: Heart,    label: 'Favourites',    value: '0',  color: 'text-rose-500    dark:text-rose-400',    bg: 'bg-rose-50    dark:bg-rose-900/20'    },
            { icon: Star,     label: 'My Reviews',    value: '0',  color: 'text-gold-600    dark:text-gold-400',    bg: 'bg-gold-50    dark:bg-gold-900/20'    },
            { icon: Globe,    label: 'Trips Planned', value: '0',  color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}
