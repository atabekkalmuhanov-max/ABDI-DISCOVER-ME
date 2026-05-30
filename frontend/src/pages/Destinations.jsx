import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { SlidersHorizontal, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DestinationCard from '@/components/common/Card'
import SearchBar from '@/components/common/SearchBar'
import Spinner from '@/components/ui/Spinner'
import { destinationService } from '@/services/api'

const CATEGORIES = ['all', 'historical', 'cultural', 'nature', 'mountain', 'city', 'desert', 'adventure']
const BACKEND_MAP = { all: undefined, historical: 'Historical', cultural: 'Cultural', nature: 'Nature', mountain: 'Mountain', city: 'City', desert: 'Desert', adventure: 'Adventure' }

export default function Destinations() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const { t } = useTranslation()
  const search = searchParams.get('search') || ''

  const { data, isLoading } = useQuery(
    ['destinations', search, activeCategory],
    () => destinationService.getAll({ search, category: BACKEND_MAP[activeCategory] }),
    { keepPreviousData: true }
  )

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-1">{t('destinations.title')}</h1>
          <p className="section-subtitle">{data?.total ?? 0} {t('destinations.subtitle')}</p>

          <div className="mt-6 max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category filter */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {t(`destinations.cat_${cat}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.destinations || []).map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>

            {data?.destinations?.length === 0 && (
              <div className="text-center py-32">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">{t('destinations.no_results')}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('destinations.no_results_sub')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
