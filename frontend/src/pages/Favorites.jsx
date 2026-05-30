import { useState, useEffect, useCallback } from 'react'
import { Heart, MapPin, Trash2, ExternalLink, Search, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { favoritesService } from '@/services/api'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  historical:    'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  natural:       'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  cultural:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  religious:     'bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300',
  museum:        'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  bazaar:        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  architectural: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  recreational:  'bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-300',
}

function FavoriteCard({ fav, onRemove }) {
  const dest = fav.details
  const categoryClass = CATEGORY_COLORS[dest?.category] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'

  return (
    <div className="card p-0 overflow-hidden group hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 overflow-hidden">
        {dest?.image_url ? (
          <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-primary-300 dark:text-primary-700" />
          </div>
        )}
        <button
          onClick={() => onRemove(fav.entity_type, fav.entity_id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
          title="Remove from favorites"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
        {dest?.category && (
          <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryClass}`}>
            {dest.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1">
          {dest?.name || `Destination #${fav.entity_id}`}
        </h3>
        {dest?.region && (
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> {dest.region}
          </p>
        )}
        {dest?.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">{dest.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Saved {new Date(fav.created_at).toLocaleDateString()}
          </span>
          <Link
            to={`/destinations/${fav.entity_id}`}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            View <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const data = await favoritesService.getAll()
      setFavorites(data.favorites || [])
    } catch {
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(favorites)
      return
    }
    const q = search.toLowerCase()
    setFiltered(favorites.filter(f =>
      f.details?.name?.toLowerCase().includes(q) ||
      f.details?.region?.toLowerCase().includes(q) ||
      f.details?.category?.toLowerCase().includes(q)
    ))
  }, [search, favorites])

  const handleRemove = async (entityType, entityId) => {
    try {
      await favoritesService.remove(entityType, entityId)
      setFavorites(prev => prev.filter(f => !(f.entity_type === entityType && f.entity_id === entityId)))
      toast.success('Removed from favorites')
    } catch {
      toast.error('Failed to remove favorite')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-current" />
            My Favorites
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {favorites.length} saved destination{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search favorites..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-red-300 dark:text-red-700" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No favorites yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mb-6">
            Browse destinations and tap the heart icon to save your favorites here.
          </p>
          <Link to="/destinations" className="btn-primary flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Explore Destinations
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500">No favorites match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(fav => (
            <FavoriteCard
              key={`${fav.entity_type}-${fav.entity_id}`}
              fav={fav}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
