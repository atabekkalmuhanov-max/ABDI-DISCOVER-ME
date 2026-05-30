import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { MapPin, Star, ArrowRight, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { destinationService } from '@/services/api'
import Spinner from '@/components/ui/Spinner'

// Uzbekistan destination coordinates for map markers
const UZ_COORDS = {
  'Registan Square': [39.6547, 66.9758],
  'Shah-i-Zinda': [39.6680, 66.9792],
  'Bukhara Old City': [39.7748, 64.4170],
  'Kalon Minaret': [39.7761, 64.4166],
  'Khiva Old Town': [41.3775, 60.3636],
  'Tashkent': [41.2995, 69.2401],
  'Chorsu Bazaar': [41.3264, 69.2347],
  'Shahrisabz': [39.0558, 66.8342],
  'Chimgan Mountains': [41.5667, 70.0333],
  'Aydarkul Lake': [40.7500, 65.5000],
  'Fergana Valley': [40.3864, 71.7864],
  'Termez': [37.2246, 67.2783],
  'Nurata': [40.5569, 65.6929],
  'Aral Sea': [45.0, 60.0],
  'Samarkand': [39.6547, 66.9758],
}

function getCoords(dest) {
  for (const [key, coords] of Object.entries(UZ_COORDS)) {
    if (dest.name?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(dest.name?.toLowerCase())) {
      return coords
    }
  }
  // Random position around Uzbekistan for unmapped destinations
  return [39.5 + Math.random() * 3 - 1.5, 64.5 + Math.random() * 8 - 4]
}

export default function MapPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(null)
  const [MapComponents, setMapComponents] = useState(null)
  const [mapError, setMapError] = useState(false)

  const { data, isLoading } = useQuery('all-destinations-map', () =>
    destinationService.getAll({ limit: 50 })
  )

  useEffect(() => {
    // Dynamically import react-leaflet to avoid SSR issues
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      // Fix default leaflet icon issue
      delete L.default.Icon.Default.prototype._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setMapComponents({ MapContainer: rl.MapContainer, TileLayer: rl.TileLayer, Marker: rl.Marker, Popup: rl.Popup, useMap: rl.useMap })
    }).catch(() => setMapError(true))
  }, [])

  const destinations = data?.destinations || []

  return (
    <div className="h-screen-minus-nav flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{t('map.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('map.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5" />
            {t('map.click_hint')}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{destinations.length} Destinations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {destinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelected(dest)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                  selected?.id === dest.id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{dest.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {dest.category || 'Cultural'}
                    </div>
                  </div>
                  {dest.rating && (
                    <div className="flex items-center gap-0.5 text-xs shrink-0">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                      <span className="text-slate-600 dark:text-slate-300">{parseFloat(dest.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading || !MapComponents ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-dark-800">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('map.loading')}</p>
              </div>
            </div>
          ) : mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-dark-800">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Map unavailable. Please install react-leaflet.</p>
                <pre className="text-xs text-slate-400 mt-2 bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded">npm install react-leaflet leaflet</pre>
              </div>
            </div>
          ) : (
            <MapComponents.MapContainer
              center={[41.2, 63.0]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <MapComponents.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {destinations.map((dest) => {
                const coords = getCoords(dest)
                return (
                  <MapComponents.Marker key={dest.id} position={coords}>
                    <MapComponents.Popup>
                      <div className="min-w-[180px]">
                        {dest.image_url && (
                          <img src={dest.image_url} alt={dest.name} className="w-full h-24 object-cover rounded mb-2" onError={(e) => e.target.remove()} />
                        )}
                        <p className="font-semibold text-sm">{dest.name}</p>
                        {dest.category && <p className="text-xs text-gray-500 mt-0.5">{dest.category}</p>}
                        {dest.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{parseFloat(dest.rating).toFixed(1)} ({dest.review_count} reviews)</span>
                          </div>
                        )}
                        <a
                          href={`/destinations/${dest.id}`}
                          className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:underline"
                        >
                          {t('map.view_details')} <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </MapComponents.Popup>
                  </MapComponents.Marker>
                )
              })}
            </MapComponents.MapContainer>
          )}

          {/* Selected destination detail panel (mobile) */}
          {selected && (
            <div className="lg:hidden absolute bottom-4 left-4 right-4 card p-4 shadow-xl animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selected.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selected.category}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
              </div>
              <Link to={`/destinations/${selected.id}`} className="btn-primary text-sm w-full text-center mt-3 block py-2">
                {t('map.view_details')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
