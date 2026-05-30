import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Users, Star, Landmark, Mountain, Utensils, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SearchBar from '@/components/common/SearchBar'
import DestinationCard from '@/components/common/Card'
import Spinner from '@/components/ui/Spinner'
import { destinationService } from '@/services/api'

const STATS = [
  { icon: MapPin, key: 'stats_destinations', value: '500+' },
  { icon: Users, key: 'stats_travelers', value: '50K+' },
  { icon: Star, key: 'stats_rating', value: '4.8' },
]

const WHY_ITEMS = [
  { icon: Landmark, titleKey: 'why_silk', descKey: 'why_silk_desc', color: 'from-primary-500 to-primary-700' },
  { icon: Mountain, titleKey: 'why_arch', descKey: 'why_arch_desc', color: 'from-gold-500 to-gold-600' },
  { icon: Utensils, titleKey: 'why_culture', descKey: 'why_culture_desc', color: 'from-emerald-500 to-emerald-700' },
  { icon: Sunset, titleKey: 'why_nature', descKey: 'why_nature_desc', color: 'from-orange-500 to-orange-700' },
]

const POPULAR_CITIES = [
  { name: 'Samarkand', description: 'Jewel of the Silk Road', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Registan_Samarkand.jpg/800px-Registan_Samarkand.jpg' },
  { name: 'Bukhara', description: 'Living Museum City', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bukhara-Citadel_ARK.jpg/800px-Bukhara-Citadel_ARK.jpg' },
  { name: 'Khiva', description: 'Open-air Museum', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Khiva_viewed_from_Islam_Khodja_minaret.jpg/800px-Khiva_viewed_from_Islam_Khodja_minaret.jpg' },
]

export default function Home() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery('featured-destinations', () =>
    destinationService.getAll({ limit: 6, featured: true })
  )

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-32 px-4">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm text-primary-200 mb-8">
            <MapPin className="w-4 h-4 text-gold-400" />
            Uzbekistan — Pearl of Central Asia
          </div>

          <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6 leading-tight tracking-tight">
            {t('home.hero_title').split(' ').slice(0, -2).join(' ')}{' '}
            <span className="text-gold-gradient">{t('home.hero_title').split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p className="text-primary-200 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          <SearchBar className="max-w-2xl mx-auto" />

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {['Samarkand', 'Bukhara', 'Khiva', 'Tashkent', 'Chimgan'].map((city) => (
              <Link
                key={city}
                to={`/destinations?search=${city}`}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-primary-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 relative">
          {STATS.map(({ icon: Icon, key, value }) => (
            <div key={key} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Icon className="w-5 h-5 mx-auto mb-2 text-gold-400" />
              <div className="text-3xl font-bold font-display">{value}</div>
              <div className="text-primary-200 text-xs mt-1">{t(`home.${key}`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 px-4 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-2">Must-Visit Cities</h2>
          <p className="section-subtitle text-center mb-10">Ancient capitals of the Silk Road</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_CITIES.map((city) => (
              <Link key={city.name} to={`/destinations?search=${city.name}`} className="group relative rounded-2xl overflow-hidden h-64 block">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = `https://placehold.co/800x600/1f2ab8/white?text=${city.name}` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-display font-bold text-white">{city.name}</h3>
                  <p className="text-white/80 text-sm">{city.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Uzbekistan */}
      <section className="py-16 px-4 bg-sand-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.why_title')}</h2>
            <p className="section-subtitle">{t('home.why_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_ITEMS.map(({ icon: Icon, titleKey, descKey, color }) => (
              <div key={titleKey} className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-2">{t(`home.${titleKey}`)}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t(`home.${descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-4 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">{t('home.featured_title')}</h2>
              <p className="section-subtitle">{t('home.featured_subtitle')}</p>
            </div>
            <Link to="/destinations" className="hidden sm:flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium">
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.destinations || []).map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/destinations" className="btn-secondary inline-flex items-center gap-1.5">
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-primary-400/20 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl font-display font-bold mb-4">{t('home.cta_title')}</h2>
          <p className="text-primary-200 text-lg mb-10">{t('home.cta_subtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5">
              {t('home.cta_button')}
            </Link>
            <Link to="/destinations" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2">
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
