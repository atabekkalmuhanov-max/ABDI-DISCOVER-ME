import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ArrowRight } from 'lucide-react'

const PRICE_BY_LEVEL = {
  1: '150 000 сум',
  2: '300 000 сум',
  3: '600 000 сум',
  4: '1 200 000 сум',
}

export default function DestinationCard({ destination }) {
  const { id, name, image_url, rating, review_count, category, price_level } = destination
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const priceText = price_level ? `от ${PRICE_BY_LEVEL[price_level]}` : null

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <Link
        to={`/destinations/${id}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card-hover transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={image_url || `https://source.unsplash.com/600x400/?${encodeURIComponent(name)},uzbekistan`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://placehold.co/600x400/1DB8A8/white?text=Uzbekistan' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Rating badge — top right */}
          {rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
              <span className="text-xs font-bold text-gray-900">{parseFloat(rating).toFixed(1)}</span>
            </div>
          )}

          {/* "Подробнее" hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-1.5 bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-colors">
              Подробнее <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug truncate mb-1 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
          {category && (
            <p className="text-gray-400 text-xs mb-3 truncate">{category}</p>
          )}
          <div className="flex items-center justify-between">
            {rating ? (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                <span className="font-medium">{parseFloat(rating).toFixed(1)}</span>
                {review_count > 0 && (
                  <span className="text-gray-400">({review_count})</span>
                )}
              </div>
            ) : <div />}

            {priceText && (
              <span className="text-xs font-semibold text-primary-600 shrink-0">
                {priceText}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
