import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SearchBar({ placeholder, className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center bg-white dark:bg-dark-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center gap-3 px-5 flex-1">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t('home.search_placeholder')}
          className="py-4 flex-1 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none bg-transparent"
        />
      </div>
      <button type="submit" className="btn-primary rounded-none rounded-r-2xl px-6 py-4 text-sm">
        {t('common.search')}
      </button>
    </form>
  )
}
