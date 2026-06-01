import { useState, useRef, useEffect, useCallback } from 'react'
import { Calendar, ChevronDown, Filter, Footprints, Bus, Bike, Wifi, WifiOff } from 'lucide-react'

const FORMATS = [
  { value: 'all', label: 'Любой формат' },
  { value: 'offline', label: 'Офлайн', Icon: WifiOff },
  { value: 'online', label: 'Онлайн', Icon: Wifi },
]

const TRANSPORTS = [
  { value: 'all', label: 'Любой способ' },
  { value: 'walking', label: 'Пешком', Icon: Footprints },
  { value: 'bus', label: 'На автобусе', Icon: Bus },
  { value: 'bike', label: 'На велосипеде', Icon: Bike },
]

const MAX_PRICE = 2_000_000

function useClickOutside(onClose) {
  const ref = useRef(null)
  const stableClose = useCallback(onClose, [])
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) stableClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [stableClose])
  return ref
}

function Dropdown({ label, icon: Icon, active, children }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 bg-white shadow-sm whitespace-nowrap ${
          active || open
            ? 'border-primary-400 text-primary-600 bg-primary-50'
            : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 min-w-[230px] py-2 animate-fade-in">
          {children(setOpen)}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({ filters, onFilterChange }) {
  const formatLabel = FORMATS.find((f) => f.value === filters.format)?.label
  const transportLabel = TRANSPORTS.find((t) => t.value === filters.transport)?.label

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Dates */}
      <Dropdown
        label={filters.date ? new Date(filters.date).toLocaleDateString('ru') : 'Любые даты'}
        icon={Calendar}
        active={!!filters.date}
      >
        {(setOpen) => (
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Выберите дату</p>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              onChange={(e) => { onFilterChange({ date: e.target.value || null }); setOpen(false) }}
              defaultValue={filters.date || ''}
            />
            {filters.date && (
              <button
                className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
                onClick={() => { onFilterChange({ date: null }); setOpen(false) }}
              >
                Сбросить дату
              </button>
            )}
          </div>
        )}
      </Dropdown>

      {/* Format */}
      <Dropdown
        label={filters.format && filters.format !== 'all' ? formatLabel : 'Формат проведения'}
        active={!!filters.format && filters.format !== 'all'}
      >
        {(setOpen) =>
          FORMATS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { onFilterChange({ format: value }); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                filters.format === value ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 text-gray-400" />}
              {label}
            </button>
          ))
        }
      </Dropdown>

      {/* Transport */}
      <Dropdown
        label={filters.transport && filters.transport !== 'all' ? transportLabel : 'Способ передвижения'}
        active={!!filters.transport && filters.transport !== 'all'}
      >
        {(setOpen) =>
          TRANSPORTS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { onFilterChange({ transport: value }); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                filters.transport === value ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 text-gray-400" />}
              {label}
            </button>
          ))
        }
      </Dropdown>

      {/* Price */}
      <Dropdown
        label={
          filters.maxPrice && filters.maxPrice < MAX_PRICE
            ? `До ${(filters.maxPrice / 1000).toFixed(0)} 000 сум`
            : 'Цена'
        }
        active={!!filters.maxPrice && filters.maxPrice < MAX_PRICE}
      >
        {(setOpen) => (
          <div className="px-4 py-4 w-[270px]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Стоимость</p>
            <div className="mb-2">
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={50_000}
                defaultValue={filters.maxPrice || MAX_PRICE}
                onChange={(e) => onFilterChange({ maxPrice: parseInt(e.target.value) })}
                className="w-full accent-primary-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0 сум</span>
                <span className="text-primary-600 font-semibold">
                  {((filters.maxPrice || MAX_PRICE) / 1000).toFixed(0)} 000 сум
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Применить
            </button>
          </div>
        )}
      </Dropdown>

      {/* Extra filters button */}
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm">
        <Filter className="w-4 h-4" />
        Фильтры
      </button>
    </div>
  )
}
