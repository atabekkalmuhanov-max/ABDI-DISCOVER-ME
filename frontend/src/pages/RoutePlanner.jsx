import { useState, useEffect, useCallback } from 'react'
import {
  Map, Plus, Trash2, Edit3, Globe, Lock, Car, Bus, Train, Footprints,
  Shuffle, Calendar, DollarSign, Eye, X, Search, GripVertical, Save,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Clock,
} from 'lucide-react'
import { routeService, destinationService } from '@/services/api'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const TRANSPORT_OPTIONS = [
  { id: 'car',   label: 'Car',    Icon: Car },
  { id: 'bus',   label: 'Bus',    Icon: Bus },
  { id: 'train', label: 'Train',  Icon: Train },
  { id: 'walk',  label: 'Walk',   Icon: Footprints },
  { id: 'mixed', label: 'Mixed',  Icon: Shuffle },
]

const TRANSPORT_ICONS = { car: Car, bus: Bus, train: Train, walk: Footprints, mixed: Shuffle }

function RouteCard({ route, onEdit, onDelete, currentUserId }) {
  const TransportIcon = TRANSPORT_ICONS[route.transport] || Shuffle
  const isOwner = currentUserId && route.author_id === currentUserId
  const stopCount = Array.isArray(route.stops) ? route.stops.length : 0

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow duration-200 group flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {route.is_public
              ? <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            }
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{route.title}</h3>
          </div>
          {route.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{route.description}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(route)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(route.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Map className="w-3.5 h-3.5" /> {stopCount} stop{stopCount !== 1 ? 's' : ''}
        </span>
        {route.duration_days && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {route.duration_days} day{route.duration_days !== 1 ? 's' : ''}
          </span>
        )}
        {route.transport && (
          <span className="flex items-center gap-1 capitalize">
            <TransportIcon className="w-3.5 h-3.5" /> {route.transport}
          </span>
        )}
        {route.budget_min && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> ${route.budget_min}–{route.budget_max || '?'}
          </span>
        )}
      </div>

      {Array.isArray(route.stops) && route.stops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {route.stops.slice(0, 3).map((stop, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">
                {i + 1}
              </div>
              <span className="text-slate-700 dark:text-slate-300 truncate">{stop.name || stop.destination_name || 'Stop'}</span>
            </div>
          ))}
          {route.stops.length > 3 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pl-7">+{route.stops.length - 3} more</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-400">
        <span>{route.author_name || 'You'}</span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" /> {route.view_count || 0}
        </span>
      </div>
    </div>
  )
}

function StopItem({ stop, index, total, onMove, onRemove }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 group">
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(index, -1)} disabled={index === 0} className="p-0.5 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
          <ArrowUp className="w-3 h-3" />
        </button>
        <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="p-0.5 rounded text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{stop.name}</p>
        {stop.region && <p className="text-xs text-slate-400 dark:text-slate-500">{stop.region}</p>}
      </div>
      <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function RouteModal({ route, onClose, onSaved }) {
  const [title, setTitle] = useState(route?.title || '')
  const [description, setDescription] = useState(route?.description || '')
  const [transport, setTransport] = useState(route?.transport || 'mixed')
  const [durationDays, setDurationDays] = useState(route?.duration_days || 1)
  const [budgetMin, setBudgetMin] = useState(route?.budget_min || '')
  const [budgetMax, setBudgetMax] = useState(route?.budget_max || '')
  const [isPublic, setIsPublic] = useState(route?.is_public !== false)
  const [stops, setStops] = useState(Array.isArray(route?.stops) ? route.stops : [])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const data = await destinationService.getAll({ search, limit: 8 })
        setSearchResults(data.destinations || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const addStop = (dest) => {
    if (stops.some(s => s.destination_id === dest.id)) {
      toast.error('Already added')
      return
    }
    setStops(prev => [...prev, { destination_id: dest.id, name: dest.name, region: dest.region }])
    setSearch('')
    setSearchResults([])
  }

  const removeStop = (index) => setStops(prev => prev.filter((_, i) => i !== index))

  const moveStop = (index, dir) => {
    const newStops = [...stops]
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= newStops.length) return
    ;[newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]]
    setStops(newStops)
  }

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(), description: description.trim(), transport,
        duration_days: parseInt(durationDays), is_public: isPublic,
        stops, budget_min: budgetMin || null, budget_max: budgetMax || null,
      }
      const data = route?.id
        ? await routeService.update(route.id, payload)
        : await routeService.create(payload)
      toast.success(route?.id ? 'Route updated' : 'Route created!')
      onSaved(data.route)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save route')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {route?.id ? 'Edit Route' : 'Create Route'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My Silk Road Adventure"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A journey through ancient Silk Road cities..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>

          {/* Transport + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Transport</label>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORT_OPTIONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTransport(id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      transport === id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={durationDays}
                onChange={e => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Budget + Visibility */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Budget ($)</label>
              <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="50"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Budget ($)</label>
              <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="200"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  isPublic
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isPublic ? <><Globe className="w-3.5 h-3.5" /> Public</> : <><Lock className="w-3.5 h-3.5" /> Private</>}
              </button>
            </div>
          </div>

          {/* Stops builder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Stops <span className="text-slate-400 font-normal">({stops.length} added)</span>
            </label>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search destinations to add..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {(searchLoading || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-3 text-center text-sm text-slate-400">Searching...</div>
                  ) : (
                    searchResults.map(dest => (
                      <button
                        key={dest.id}
                        onClick={() => addStop(dest)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                          <Map className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{dest.name}</p>
                          {dest.region && <p className="text-xs text-slate-400 dark:text-slate-500">{dest.region}</p>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {stops.length > 0 ? (
              <div className="space-y-2">
                {stops.map((stop, i) => (
                  <StopItem key={i} stop={stop} index={i} total={stops.length} onMove={moveStop} onRemove={removeStop} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Map className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-400 dark:text-slate-500">Search destinations above to add stops</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5">Cancel</button>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : route?.id ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RoutePlanner() {
  const { user } = useAuthStore()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)

  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await routeService.getAll({ mine: filter === 'mine' ? 'true' : 'false' })
      setRoutes(data.routes || [])
    } catch {
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return
    try {
      await routeService.delete(id)
      setRoutes(prev => prev.filter(r => r.id !== id))
      toast.success('Route deleted')
    } catch {
      toast.error('Failed to delete route')
    }
  }

  const handleEdit = (route) => {
    setEditingRoute(route)
    setShowModal(true)
  }

  const handleSaved = (savedRoute) => {
    setRoutes(prev => {
      const exists = prev.find(r => r.id === savedRoute.id)
      if (exists) return prev.map(r => r.id === savedRoute.id ? { ...r, ...savedRoute } : r)
      return [savedRoute, ...prev]
    })
    setShowModal(false)
    setEditingRoute(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Route Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Build and share your Uzbekistan travel routes</p>
        </div>
        <button
          onClick={() => { setEditingRoute(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Route
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl mb-6 w-fit">
        {[{ id: 'all', label: 'All Routes' }, { id: 'mine', label: 'My Routes' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <Map className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No routes yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mb-6">
            {filter === 'mine'
              ? 'You haven\'t created any routes. Build your first Uzbekistan itinerary!'
              : 'No routes have been shared yet. Be the first to create one!'
            }
          </p>
          <button onClick={() => { setEditingRoute(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {showModal && (
        <RouteModal
          route={editingRoute}
          onClose={() => { setShowModal(false); setEditingRoute(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
