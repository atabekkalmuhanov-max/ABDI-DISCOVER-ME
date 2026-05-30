import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Star, ArrowLeft, Clock, Globe, Heart, Share2, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/Spinner'
import { destinationService, reviewService } from '@/services/api'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const PRICE_MAP = { 1: 'Budget ($)', 2: 'Moderate ($$)', 3: 'Upscale ($$$)', 4: 'Luxury ($$$$)' }

function ReviewForm({ destinationId, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await reviewService.create({ destination_id: destinationId, rating, comment })
      toast.success('Review submitted!')
      setComment('')
      onSuccess()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mt-6">
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Write a Review</h4>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map((s) => (
          <button key={s} type="button" onClick={() => setRating(s)}>
            <Star className={`w-6 h-6 ${s <= rating ? 'fill-gold-400 text-gold-400' : 'text-slate-300 dark:text-slate-600'}`} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3} className="input resize-none" />
      <button type="submit" disabled={loading} className="btn-primary mt-3 text-sm py-2">
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

export default function DestinationDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { data: destination, isLoading, isError, refetch } = useQuery(
    ['destination', id],
    () => destinationService.getById(id)
  )

  const { data: reviews } = useQuery(['reviews', id], () => reviewService.getByDestination(id))

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (isError || !destination) return (
    <div className="text-center py-32 text-slate-500 dark:text-slate-400">
      <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p>Destination not found.</p>
      <Link to="/destinations" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-2 inline-block">{t('destinations.back')}</Link>
    </div>
  )

  const reviewList = Array.isArray(reviews) ? reviews : reviews?.reviews || []

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link to="/destinations" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('destinations.back')}
        </Link>

        {/* Hero image */}
        <div className="rounded-3xl overflow-hidden shadow-xl mb-8 relative group">
          <img
            src={destination.image_url || `https://source.unsplash.com/1200x500/?${encodeURIComponent(destination.name)},uzbekistan`}
            alt={destination.name}
            className="w-full h-80 sm:h-[420px] object-cover group-hover:scale-102 transition-transform duration-700"
            onError={(e) => { e.target.src = `https://placehold.co/1200x500/1f2ab8/white?text=${encodeURIComponent(destination.name)}` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2.5 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors shadow-sm">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors shadow-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          {destination.category && (
            <div className="absolute bottom-4 left-4">
              <span className="badge badge-primary shadow-sm backdrop-blur-sm">{destination.category}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-3">{destination.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-500" />{destination.country || 'Uzbekistan'}</span>
              {destination.category && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary-500" />{destination.category}</span>}
              {destination.best_season && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-500" />{t('destinations.best_season')}: {destination.best_season}</span>}
            </div>

            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">About</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{destination.description || 'A stunning destination in Uzbekistan, rich in history and culture.'}</p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Reviews {reviewList.length > 0 && <span className="text-slate-400 font-normal text-sm">({reviewList.length})</span>}
              </h2>
              {reviewList.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 text-sm">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {reviewList.map((r) => (
                    <div key={r.id} className="card p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {r.user_name || 'Anonymous'} · {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              {user && <ReviewForm destinationId={id} onSuccess={refetch} />}
              {!user && (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-4">
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link> to leave a review.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-5 sticky top-24">
              {destination.rating && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">
                      {parseFloat(destination.rating).toFixed(1)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">({destination.review_count} {t('destinations.reviews')})</span>
                  </div>
                </div>
              )}

              {destination.price_level && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('destinations.price_level')}</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gold-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{PRICE_MAP[destination.price_level]}</span>
                  </div>
                </div>
              )}

              {destination.best_season && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('destinations.best_season')}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{destination.best_season}</p>
                </div>
              )}

              <div className="divider" />

              <Link to="/ai" className="btn-primary block text-center">
                <span className="flex items-center justify-center gap-2">✨ {t('destinations.plan_trip')}</span>
              </Link>
              <Link to="/map" className="btn-secondary block text-center text-sm">
                View on Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
