import { useState } from 'react'
import { MapPin, Compass, Eye, EyeOff, Clock, Navigation, Star, ChevronDown, ChevronUp, Sparkles, History, RefreshCw, Map } from 'lucide-react'
import { hiddenPlacesService } from '@/services/api'
import toast from 'react-hot-toast'

const TRAVELER_TYPES = [
  { id: 'solo', label: 'Solo Explorer', emoji: '🧭' },
  { id: 'couple', label: 'Couple', emoji: '💑' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'adventurer', label: 'Adventurer', emoji: '🏔️' },
  { id: 'photographer', label: 'Photographer', emoji: '📷' },
  { id: 'historian', label: 'Historian', emoji: '📜' },
]

const EXPERIENCES = [
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'spiritual', label: 'Spiritual', emoji: '🕌' },
  { id: 'village life', label: 'Village Life', emoji: '🏡' },
  { id: 'food', label: 'Local Food', emoji: '🍽️' },
  { id: 'architecture', label: 'Architecture', emoji: '🏗️' },
  { id: 'adventure', label: 'Adventure', emoji: '⚡' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
]

const REGIONS = [
  'any', 'Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Namangan',
  'Fergana', 'Andijan', 'Nukus', 'Termez', 'Navoi', 'Jizzakh',
]

const TRANSPORT = [
  { id: 'any', label: 'Any transport' },
  { id: 'car', label: 'Private car' },
  { id: 'public', label: 'Public transit' },
  { id: 'walking', label: 'On foot' },
]

const CATEGORY_COLORS = {
  nature: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  history: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  spiritual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  village: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  food: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  architecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  adventure: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  culture: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
}

function HiddenScoreBadge({ score }) {
  const level =
    score >= 85 ? { label: 'Extremely Hidden', color: 'bg-red-500' } :
    score >= 70 ? { label: 'Off The Grid', color: 'bg-orange-500' } :
    score >= 55 ? { label: 'Secret Gem', color: 'bg-amber-500' } :
                  { label: 'Local Favorite', color: 'bg-green-500' }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm ${i < Math.ceil(score / 20) ? level.color : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{level.label}</span>
    </div>
  )
}

function PlaceCard({ place, index }) {
  const [expanded, setExpanded] = useState(false)
  const categoryClass = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.culture

  return (
    <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-200">
      {/* Card header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                #{index + 1}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
                {place.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {place.name}
            </h3>
            {place.localName && (
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 font-medium italic">
                {place.localName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{place.region}</span>
          </div>
        </div>

        <HiddenScoreBadge score={place.hiddenScore} />

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {place.description}
        </p>

        {/* Secret tip teaser */}
        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Insider Tip</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{place.secretTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="font-medium">Details &amp; Getting There</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3 bg-white dark:bg-dark-900">
          {place.whyHidden && (
            <div className="flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Why It's Hidden</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{place.whyHidden}</p>
              </div>
            </div>
          )}

          {place.bestTime && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Best Time to Visit</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{place.bestTime}</p>
              </div>
            </div>
          )}

          {place.howToGet && (
            <div className="flex items-start gap-2">
              <Navigation className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Getting There</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{place.howToGet}</p>
              </div>
            </div>
          )}

          {place.highlights && place.highlights.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Highlights
              </p>
              <div className="flex flex-wrap gap-1.5">
                {place.highlights.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {place.approxLat && place.approxLng && (
            <a
              href={`https://www.google.com/maps?q=${place.approxLat},${place.approxLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Map className="w-3.5 h-3.5" />
              View on map
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryPanel({ history, onRestore }) {
  if (!history.length) return (
    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No previous discoveries yet.</p>
  )

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onRestore(item)}
          className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">
              {item.traveler_type} · {JSON.parse(item.experiences).slice(0, 2).join(', ')}
            </span>
            <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {item.region !== 'any' ? item.region : 'All of Uzbekistan'} · Rarity {item.rarity_level}/100
          </p>
        </button>
      ))}
    </div>
  )
}

export default function HiddenPlaces() {
  const [travelerType, setTravelerType] = useState('solo')
  const [experiences, setExperiences] = useState([])
  const [rarityLevel, setRarityLevel] = useState(70)
  const [region, setRegion] = useState('any')
  const [transportMode, setTransportMode] = useState('any')
  const [loading, setLoading] = useState(false)
  const [places, setPlaces] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [prevIds, setPrevIds] = useState([])

  const toggleExperience = (id) => {
    setExperiences((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const handleDiscover = async (excludeCurrentIds = false) => {
    if (experiences.length === 0) {
      toast.error('Select at least one experience type')
      return
    }
    setLoading(true)
    setHasSearched(true)
    try {
      const { places: results } = await hiddenPlacesService.discover({
        travelerType,
        experiences,
        rarityLevel,
        region,
        transportMode,
        excludeIds: excludeCurrentIds ? prevIds : [],
      })
      setPlaces(results)
      setPrevIds(results.map((_, i) => i))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to discover hidden places')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const { history: h } = await hiddenPlacesService.getHistory()
      setHistory(h)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleShowHistory = () => {
    setShowHistory(true)
    loadHistory()
  }

  const handleRestoreHistory = (item) => {
    setTravelerType(item.traveler_type)
    setExperiences(JSON.parse(item.experiences))
    setRarityLevel(item.rarity_level)
    setRegion(item.region)
    setPlaces(item.result ? JSON.parse(typeof item.result === 'string' ? item.result : JSON.stringify(item.result)) : [])
    setHasSearched(true)
    setShowHistory(false)
  }

  const rarityLabel =
    rarityLevel >= 85 ? 'Only locals know' :
    rarityLevel >= 70 ? 'Off the beaten path' :
    rarityLevel >= 55 ? 'Secret gems' :
    'Local favorites'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
          <Compass className="w-4 h-4" />
          AI-Powered Discovery
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3">
          Hidden Places
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Discover secret destinations, forgotten ruins, and off-the-grid spots in Uzbekistan that most travelers never find.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px,1fr] gap-6 items-start">
        {/* Config panel */}
        <div className="card p-5 space-y-5 sticky top-20">
          {/* Traveler type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRAVELER_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTravelerType(t.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                    travelerType === t.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
              Seeking... <span className="text-slate-400 font-normal">(pick any)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => toggleExperience(e.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    experiences.includes(e.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{e.emoji}</span>
                  <span>{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rarity slider */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              How hidden?
              <span className="ml-2 text-primary-600 dark:text-primary-400 font-normal">{rarityLabel}</span>
            </label>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400">Popular</span>
              <input
                type="range"
                min={30}
                max={100}
                value={rarityLevel}
                onChange={(e) => setRarityLevel(Number(e.target.value))}
                className="flex-1 accent-primary-600"
              />
              <span className="text-xs text-slate-400">Ghost town</span>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r === 'any' ? 'All of Uzbekistan' : r}</option>
              ))}
            </select>
          </div>

          {/* Transport */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Getting there by
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSPORT.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTransportMode(t.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    transportMode === t.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleDiscover(false)}
              disabled={loading || experiences.length === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Discover
                </>
              )}
            </button>
            <button
              onClick={handleShowHistory}
              className="btn-secondary p-2.5"
              title="View history"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {showHistory && (
            <div className="card p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 dark:text-white">Previous Discoveries</h2>
                <button onClick={() => setShowHistory(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Close
                </button>
              </div>
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <HistoryPanel history={history} onRestore={handleRestoreHistory} />
              )}
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Compass className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Ready to explore?
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm">
                Configure your preferences and hit Discover to uncover places most travelers never find.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">Searching the unknown...</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">AI is uncovering hidden gems for you</p>
            </div>
          )}

          {!loading && hasSearched && places.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {places.length} Hidden Places Found
                </h2>
                <button
                  onClick={() => handleDiscover(true)}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Discover More
                </button>
              </div>

              <div className="space-y-4">
                {places.map((place, i) => (
                  <PlaceCard key={`${place.name}-${i}`} place={place} index={i} />
                ))}
              </div>
            </>
          )}

          {!loading && hasSearched && places.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400">No places found. Try adjusting your preferences.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
