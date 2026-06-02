import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PromoCarousel({ items }) {
  const [activeDot, setActiveDot] = useState(0)
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 216 + 16 // w-54 + gap-4
    el.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' })
    setActiveDot((prev) => Math.max(0, Math.min(items.length - 1, prev + dir)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-gray-900 flex items-center gap-2">
          Необычные темы и маршруты
          <ArrowRight className="w-5 h-5 text-primary-500" />
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={(e) => {
          const el = e.currentTarget
          const cardWidth = 216 + 16
          setActiveDot(Math.round(el.scrollLeft / (cardWidth * 2)))
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/themes/${item.slug || encodeURIComponent(item.title)}`}
            className="flex-shrink-0 w-[216px] h-64 relative rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = `https://placehold.co/400x500/1DB8A8/white?text=${encodeURIComponent(item.title)}`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
              {item.count && (
                <p className="text-white/70 text-xs mt-1">{item.count} маршрутов</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center gap-1.5 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveDot(i)
              const el = scrollRef.current
              if (el) el.scrollTo({ left: i * (216 + 16) * 2, behavior: 'smooth' })
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeDot ? 'w-5 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
