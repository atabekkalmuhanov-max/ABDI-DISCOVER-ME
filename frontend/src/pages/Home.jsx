import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ChevronRight } from 'lucide-react'
import { destinationService } from '@/services/api'
import FilterBar from '@/components/common/FilterBar'
import CategoryTabs from '@/components/common/CategoryTabs'
import PromoCarousel from '@/components/common/PromoCarousel'
import SkeletonCard from '@/components/common/SkeletonCard'
import DestinationCard from '@/components/common/Card'

const PAGE_SIZE = 8

const CATEGORIES = [
  { id: 'all',        label: 'Все',          count: 4265 },
  { id: 'discount',   label: 'Со скидкой',   count: 23   },
  { id: 'new',        label: 'Новые',        count: 8    },
  { id: 'historical', label: 'Исторические', count: 128  },
  { id: 'nature',     label: 'Природа',      count: 89   },
  { id: 'cultural',   label: 'Культурные',   count: 64   },
  { id: 'walking',    label: 'Пешком',       count: 47   },
  { id: 'bus',        label: 'На автобусе',  count: 53   },
  { id: 'food',       label: 'Кухня',        count: 31   },
]

const PROMO_ITEMS = [
  {
    id: 1,
    title: 'Архитектура Тимуридов',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Registan_01.jpg',
    count: 24,
  },
  {
    id: 2,
    title: 'Великий Шёлковый путь',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Bukhara_Caravansaray.jpg',
    count: 18,
  },
  {
    id: 3,
    title: 'Мечети и медресе',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Itchan_Kala_minaret.jpg',
    count: 36,
  },
  {
    id: 4,
    title: 'Мавзолеи Шах-и-Зинда',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shahi-Zinda_271.jpg',
    count: 15,
  },
  {
    id: 5,
    title: 'Горные маршруты',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Tian_Shan_Panorama.jpg',
    count: 12,
  },
]

// Map frontend category IDs to API category values
const CATEGORY_API_MAP = {
  historical: 'historical',
  nature:     'nature',
  cultural:   'cultural',
  walking:    'walking',
  bus:        'bus',
  food:       'food',
}

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery   = searchParams.get('search') || ''
  const cityParam     = searchParams.get('city')   || 'Самарканд'

  const [activeCategory, setActiveCategory] = useState('all')
  const [filters, setFilters] = useState({ date: null, format: 'all', transport: 'all', maxPrice: null })
  const [limit, setLimit] = useState(PAGE_SIZE)

  // Reset limit when category or search changes
  useEffect(() => { setLimit(PAGE_SIZE) }, [activeCategory, searchQuery])

  const apiCategory = CATEGORY_API_MAP[activeCategory]

  const { data, isLoading, isFetching } = useQuery(
    ['places', { limit, category: apiCategory, search: searchQuery }],
    () =>
      destinationService.getAll({
        limit,
        ...(apiCategory && { category: apiCategory }),
        ...(searchQuery && { search: searchQuery }),
      }),
    { keepPreviousData: true }
  )

  const places  = data?.destinations || []
  const hasMore = places.length >= limit

  const handleFilterChange = (updated) => {
    setFilters((prev) => ({ ...prev, ...updated }))
  }

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
  }

  const titleCity = searchQuery
    ? `по запросу "${searchQuery}"`
    : `в ${cityParam}е`

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Breadcrumbs ── */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary-500 transition-colors">
            Главная
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/destinations" className="hover:text-primary-500 transition-colors">
            Узбекистан
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-700 font-medium">{cityParam}</span>
        </nav>

        {/* ── Title + Description ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-slate-100 mb-2">
            Экскурсии {titleCity}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-base">
            Необычные экскурсии от местных жителей.{' '}
            <span className="text-primary-600 font-medium">Цены от 150 000 сум</span>
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-4 py-3 mb-4">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* ── Category tabs ── */}
        <div className="mb-7">
          <CategoryTabs
            categories={CATEGORIES}
            active={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>

        {/* ── Promo carousel ── */}
        <div className="mb-8">
          <PromoCarousel items={PROMO_ITEMS} />
        </div>

        {/* ── Place grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : places.map((place) => (
                <DestinationCard key={place.id} destination={place} />
              ))}
        </div>

        {/* ── Empty state ── */}
        {!isLoading && places.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Ничего не найдено
            </h3>
            <p className="text-gray-400 dark:text-slate-500 mb-6">
              Попробуйте изменить фильтры или поиск
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setFilters({ date: null, format: 'all', transport: 'all', maxPrice: null }) }}
              className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* ── Load more ── */}
        {!isLoading && hasMore && places.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              disabled={isFetching}
              className="border border-gray-200 bg-white hover:border-primary-400 hover:text-primary-600 text-gray-700 text-sm font-semibold px-10 py-3 rounded-full transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                  Загрузка...
                </span>
              ) : (
                'Загрузить ещё'
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
