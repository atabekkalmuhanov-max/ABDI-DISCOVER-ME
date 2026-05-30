import { Link } from 'react-router-dom'
import { MapPin, Star, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function DestinationCard({ destination }) {
  const { t } = useTranslation()
  const { id, name, country, image_url, rating, review_count, category, price_level, best_season } = destination

  return (
    <Link to={`/destinations/${id}`} className="card group block animate-fade-in">
      <div className="relative overflow-hidden h-52">
        <img
          src={image_url || `https://source.unsplash.com/600x400/?${encodeURIComponent(name)},uzbekistan`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://placehold.co/600x400/1f2ab8/white?text=Uzbekistan' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {category && (
          <span className="absolute top-3 left-3 badge bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm text-primary-700 dark:text-primary-300 shadow-sm">
            {category}
          </span>
        )}
        {price_level && (
          <span className="absolute top-3 right-3 badge bg-gold-500 text-white shadow-sm">
            {PRICE_LABELS[price_level]}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 font-display truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{country}</span>
            </div>
          </div>
          {rating && (
            <div className="flex items-center gap-1 text-sm shrink-0">
              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{parseFloat(rating).toFixed(1)}</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">({review_count})</span>
            </div>
          )}
        </div>

        {best_season && (
          <div className="flex items-center gap-1 mt-2.5 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{t('destinations.best_season')}: {best_season}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
