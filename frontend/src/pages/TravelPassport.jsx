import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Award, Map, Lock, CheckCircle, Globe, Clock, Plus, X, Search } from 'lucide-react'
import { passportService, destinationService } from '@/services/api'
import useAuthStore from '@/store/authStore'

const LEVEL_MINS = [0, 100, 300, 600, 1000, 1500]

const REGION_COLOR_CLASSES = {
  blue:    'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-300',
  indigo:  'bg-indigo-100  text-indigo-700  dark:bg-indigo-900/30  dark:text-indigo-300',
  amber:   'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pink:    'bg-pink-100    text-pink-700    dark:bg-pink-900/30    dark:text-pink-300',
  orange:  'bg-orange-100  text-orange-700  dark:bg-orange-900/30  dark:text-orange-300',
  rose:    'bg-rose-100    text-rose-700    dark:bg-rose-900/30    dark:text-rose-300',
  yellow:  'bg-yellow-100  text-yellow-800  dark:bg-yellow-900/30  dark:text-yellow-300',
  red:     'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-300',
  lime:    'bg-lime-100    text-lime-700    dark:bg-lime-900/30    dark:text-lime-300',
  cyan:    'bg-cyan-100    text-cyan-700    dark:bg-cyan-900/30    dark:text-cyan-300',
  purple:  'bg-purple-100  text-purple-700  dark:bg-purple-900/30  dark:text-purple-300',
  teal:    'bg-teal-100    text-teal-700    dark:bg-teal-900/30    dark:text-teal-300',
  gray:    'bg-slate-100   text-slate-700   dark:bg-slate-800      dark:text-slate-300',
}

const PROGRESS_COLOR_CLASSES = {
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  amber:   'bg-amber-500',
  emerald: 'bg-emerald-500',
  pink:    'bg-pink-500',
  orange:  'bg-orange-500',
  rose:    'bg-rose-500',
  yellow:  'bg-yellow-500',
  red:     'bg-red-500',
  lime:    'bg-lime-500',
  cyan:    'bg-cyan-500',
  purple:  'bg-purple-500',
  teal:    'bg-teal-500',
  gray:    'bg-slate-500',
}

const TABS = [
  { id: 'overview',      label: 'Overview',      Icon: Globe  },
  { id: 'regions',       label: 'Regions',        Icon: Map    },
  { id: 'achievements',  label: 'Achievements',   Icon: Award  },
]

export default function TravelPassport() {
  const { user } = useAuthStore()
  const [passport, setPassport]           = useState(null)
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState('overview')
  const [showModal, setShowModal]         = useState(false)
  const [destinations, setDestinations]   = useState([])
  const [search, setSearch]               = useState('')
  const [visitedIds, setVisitedIds]       = useState(new Set())
  const [loadingVisit, setLoadingVisit]   = useState(null)
  const [destLoading, setDestLoading]     = useState(false)

  const fetchPassport = useCallback(async () => {
    try {
      const data = await passportService.getPassport()
      setPassport(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVisitedIds = useCallback(async () => {
    try {
      const { visitedIds: ids } = await passportService.getVisitedIds()
      setVisitedIds(new Set(ids))
    } catch {}
  }, [])

  useEffect(() => {
    fetchPassport()
    fetchVisitedIds()
  }, [fetchPassport, fetchVisitedIds])

  useEffect(() => {
    if (!showModal) return
    const fetchDests = async () => {
      setDestLoading(true)
      try {
        const result = await destinationService.getAll(search ? { search, limit: 20 } : { limit: 20 })
        setDestinations(result.destinations || [])
      } catch {
        setDestinations([])
      } finally {
        setDestLoading(false)
      }
    }
    const timer = setTimeout(fetchDests, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search, showModal])

  const toggleVisit = async (dest) => {
    setLoadingVisit(dest.id)
    try {
      if (visitedIds.has(dest.id)) {
        await passportService.unmarkVisited(dest.id)
        setVisitedIds(prev => { const n = new Set(prev); n.delete(dest.id); return n })
      } else {
        await passportService.markVisited(dest.id)
        setVisitedIds(prev => new Set([...prev, dest.id]))
      }
      fetchPassport()
    } catch {}
    setLoadingVisit(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const pts         = passport?.totalPoints  || 0
  const lvl         = passport?.level        || 0
  const currentMin  = LEVEL_MINS[lvl]        || 0
  const nextMin     = LEVEL_MINS[lvl + 1]
  const levelPct    = nextMin
    ? Math.min(100, Math.round(((pts - currentMin) / (nextMin - currentMin)) * 100))
    : 100

  const earnedCount = passport?.achievements?.filter(a => a.earned).length || 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Passport Header Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 text-white p-6 md:p-8 shadow-xl">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 shrink-0 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center text-3xl font-bold shadow-lg">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>

          {/* Name & level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <BookOpen className="w-4 h-4 opacity-70" />
              <span className="text-xs opacity-70 font-medium tracking-wide uppercase">Digital Travel Passport</span>
            </div>
            <h1 className="text-2xl font-display font-bold truncate">{user?.name}</h1>
            <p className="text-primary-200 text-sm font-medium mt-0.5">
              Level {lvl} · {passport?.levelName}
            </p>

            {/* XP bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 bg-white/25 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-white rounded-full h-full transition-all duration-700 ease-out"
                  style={{ width: `${levelPct}%` }}
                />
              </div>
              <span className="text-sm font-mono shrink-0">{pts} pts</span>
            </div>
            {passport?.nextLevel && (
              <p className="text-xs text-primary-200 mt-1">
                {passport.nextLevel.minPoints - pts} pts to reach{' '}
                <span className="font-semibold">{passport.nextLevel.name}</span>
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {[
              { label: 'Visited',   value: passport?.visitCount  || 0,  emoji: '📍' },
              { label: 'Regions',   value: passport?.regionCount || 0,  emoji: '🗺️' },
              { label: 'Badges',    value: earnedCount,                  emoji: '🏅' },
              { label: 'Complete',  value: `${passport?.completionPercentage || 0}%`, emoji: '✨' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[76px]">
                <div className="text-xl leading-none mb-1">{s.emoji}</div>
                <div className="text-xl font-bold leading-none">{s.value}</div>
                <div className="text-xs opacity-75 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">

          {/* Region badges */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🏅</span> Region Badges
              <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
                {passport?.regionBadges?.length || 0} earned
              </span>
            </h2>
            {passport?.regionBadges?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {passport.regionBadges.map(badge => (
                  <div
                    key={badge.region}
                    className={`rounded-2xl p-4 text-center shadow-sm border border-transparent ${REGION_COLOR_CLASSES[badge.color] || REGION_COLOR_CLASSES.gray}`}
                  >
                    <div className="text-4xl mb-2 leading-none">{badge.icon}</div>
                    <div className="font-semibold text-sm leading-tight">{badge.badgeName}</div>
                    <div className="text-xs opacity-75 mt-1">{badge.region}</div>
                    <div className="text-xs mt-1.5 opacity-60">
                      {badge.visitCount} visit{badge.visitCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Visit destinations to earn region badges!
                </p>
              </div>
            )}
          </section>

          {/* Recent visits */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Visits
            </h2>
            {passport?.recentVisits?.length > 0 ? (
              <div className="space-y-2">
                {passport.recentVisits.map(visit => (
                  <div key={visit.id} className="card px-4 py-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl shrink-0">
                      📍
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {visit.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {visit.region || 'Uzbekistan'}
                      </p>
                    </div>
                    <time className="text-xs text-slate-400 shrink-0">
                      {new Date(visit.visited_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No visits yet — log your first destination!
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Regions tab ── */}
      {activeTab === 'regions' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track how many destinations you've explored in each region.
          </p>
          {passport?.regionProgress?.length > 0 ? (
            passport.regionProgress.map(r => (
              <div
                key={r.region}
                className={`card px-5 py-4 transition-all ${r.hasVisited ? 'border-l-4 border-primary-500' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl leading-none shrink-0">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{r.region}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                        {r.visited} / {r.total}
                      </span>
                    </div>
                    <div className="bg-slate-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR_CLASSES[r.color] || 'bg-primary-500'}`}
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold w-10 text-right shrink-0 ${
                      r.percentage === 100
                        ? 'text-green-500'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {r.percentage}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-10 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No region data available.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Achievements tab ── */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {earnedCount} of {passport?.achievements?.length || 0} achievements unlocked
            </p>
            <div className="bg-slate-200 dark:bg-dark-700 rounded-full h-2 w-40 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{
                  width: `${passport?.achievements?.length
                    ? Math.round((earnedCount / passport.achievements.length) * 100)
                    : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {passport?.achievements?.map(ach => (
              <div
                key={ach.slug}
                className={`card p-5 flex gap-4 transition-all duration-200 ${
                  ach.earned ? 'border-l-4 border-amber-400' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    ach.earned
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-slate-100 dark:bg-dark-700'
                  }`}
                >
                  {ach.earned ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {ach.name}
                    </p>
                    {ach.earned && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {ach.description}
                  </p>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1.5">
                    +{ach.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Log Visit FAB ── */}
      <button
        onClick={() => { setShowModal(true); setSearch('') }}
        className="fixed bottom-6 right-6 btn-primary rounded-full px-5 py-3 shadow-xl flex items-center gap-2 z-40"
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium text-sm">Log Visit</span>
      </button>

      {/* ── Log Visit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Log a Visit</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Destination list */}
            <div className="overflow-y-auto px-5 pb-5 space-y-2 flex-1">
              {destLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : destinations.length > 0 ? (
                destinations.map(dest => {
                  const isVisited = visitedIds.has(dest.id)
                  return (
                    <button
                      key={dest.id}
                      onClick={() => toggleVisit(dest)}
                      disabled={loadingVisit === dest.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left border transition-colors ${
                        isVisited
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <span className="text-xl shrink-0">{isVisited ? '✅' : '📍'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                          {dest.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {dest.region || 'Uzbekistan'}
                        </p>
                      </div>
                      {loadingVisit === dest.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent shrink-0" />
                      ) : isVisited ? (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">
                          Visited
                        </span>
                      ) : null}
                    </button>
                  )
                })
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-8">
                  {search ? 'No destinations found' : 'Loading destinations...'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
