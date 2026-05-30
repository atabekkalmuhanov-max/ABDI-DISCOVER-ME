import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, X, Sparkles, Loader2, Camera, Clock, MapPin, Calendar,
  ArrowLeftRight, ChevronDown, RefreshCw, BookOpen, Layers,
  Zap, Globe, History, Shield,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { timeTravelService } from '@/services/api'
import toast from 'react-hot-toast'

const ERA_SUGGESTIONS = [
  '14th century', '15th century', '16th century', 'Medieval period',
  'Timurid Empire', 'Silk Road era', 'Ancient times', '19th century',
]

const EVENT_TYPE_STYLES = {
  construction: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  renovation:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  destruction:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  restoration:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  cultural:     'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400',
  conquest:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
}

const EVENT_DOT_STYLES = {
  construction: 'bg-emerald-500',
  renovation:   'bg-blue-500',
  destruction:  'bg-red-500',
  restoration:  'bg-purple-500',
  cultural:     'bg-gold-500',
  conquest:     'bg-orange-500',
}

// ─── Before/After Comparison Slider ───────────────────────────────────────────
function ComparisonSlider({ currentSrc, historicalSrc, currentLabel, historicalLabel }) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const update = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setSliderPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) update(e.clientX) }
    const onTouch = (e) => { if (dragging.current) update(e.touches[0].clientX) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [update])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl cursor-ew-resize select-none bg-slate-900"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={(e) => { dragging.current = true; update(e.clientX) }}
      onTouchStart={(e) => { dragging.current = true; update(e.touches[0].clientX) }}
    >
      {/* Historical image — full background */}
      <img
        src={historicalSrc}
        alt={historicalLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Current image — clipped by clip-path */}
      <img
        src={currentSrc}
        alt={currentLabel}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        draggable={false}
      />

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-2xl pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center ring-2 ring-primary-400">
          <ArrowLeftRight className="w-4 h-4 text-primary-700" />
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none">
        {currentLabel}
      </span>
      <span className="absolute top-3 right-3 bg-amber-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none">
        {historicalLabel}
      </span>

      {/* Drag hint */}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full pointer-events-none opacity-70">
        ← Drag to compare →
      </span>
    </div>
  )
}

// ─── Historical Timeline ───────────────────────────────────────────────────────
function Timeline({ events, t }) {
  if (!events?.length) return null
  return (
    <div className="relative pl-8">
      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-400 via-gold-400 to-primary-300 rounded-full" />
      {events.map((event, i) => (
        <div key={i} className="relative mb-5 last:mb-0">
          <div
            className={`absolute -left-5 top-2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-800 shadow-sm ${
              EVENT_DOT_STYLES[event.type] || 'bg-primary-500'
            }`}
          />
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-full">
                {event.year}
              </span>
              {event.type && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${EVENT_TYPE_STYLES[event.type] || 'bg-slate-100 text-slate-600'}`}>
                  {t(`timeTravel.event_${event.type}`, { defaultValue: event.type })}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{event.event}</h4>
            {event.significance && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{event.significance}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Historical Period Card ────────────────────────────────────────────────────
function PeriodCard({ period, index }) {
  return (
    <div className="relative bg-gradient-to-br from-white to-sand-50 dark:from-dark-800 dark:to-dark-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{index + 1}</span>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{period.era}</h4>
          {period.year_range && (
            <span className="text-xs text-gold-600 dark:text-gold-400 font-medium">{period.year_range}</span>
          )}
        </div>
      </div>
      {period.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{period.description}</p>
      )}
      {period.key_changes?.length > 0 && (
        <ul className="space-y-1">
          {period.key_changes.map((change, j) => (
            <li key={j} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-1.5" />
              {change}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({ item, t }) {
  const date = new Date(item.created_at).toLocaleDateString()
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
        <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{item.attraction_name}</p>
        {item.location && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {item.location}
          </p>
        )}
        {item.target_era && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 shrink-0" /> {item.target_era}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('timeTravel.history_date')}: {date}</p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TimeTravelPage() {
  const { t, i18n } = useTranslation()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [targetEra, setTargetEra] = useState('')
  const [language, setLanguage] = useState(i18n.language.slice(0, 2))
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState('compare')
  const inputRef = useRef(null)

  const LANG_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'uz', label: "O'zbek" },
    { code: 'ru', label: 'Русский' },
    { code: 'kk', label: 'Qaraqalpaq' },
  ]

  const TABS = [
    { id: 'compare',  label: t('timeTravel.tab_compare'),  icon: ArrowLeftRight },
    { id: 'timeline', label: t('timeTravel.tab_timeline'), icon: Clock },
    { id: 'eras',     label: t('timeTravel.tab_eras'),     icon: Layers },
    { id: 'analysis', label: t('timeTravel.tab_analysis'), icon: BookOpen },
  ]

  useEffect(() => {
    timeTravelService.getHistory()
      .then((data) => setHistory(data.history || []))
      .catch(() => {})
  }, [])

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a photo first.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('language', language)
      formData.append('target_era', targetEra)
      const data = await timeTravelService.analyze(formData)
      setResult(data)
      setActiveTab(data.historical_image ? 'compare' : 'timeline')
      if (data.identified !== false) {
        timeTravelService.getHistory()
          .then((d) => setHistory(d.history || []))
          .catch(() => {})
      }
    } catch {
      toast.error(t('timeTravel.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setTargetEra('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-primary-800 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-amber-300 blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full bg-primary-400 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-4 h-4 text-gold-400" />
            {t('timeTravel.powered_by')}
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">{t('timeTravel.title')}</h1>
          <p className="text-amber-200 text-lg">{t('timeTravel.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">

        {/* Upload card */}
        <div className="card p-6 sm:p-8 space-y-6">

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('timeTravel.language_label')}
            </label>
            <div className="flex flex-wrap gap-2">
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                    language === l.code
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target era */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('timeTravel.era_label')}
              <span className="text-xs font-normal text-slate-400 ml-2">{t('timeTravel.era_optional')}</span>
            </label>
            <input
              type="text"
              value={targetEra}
              onChange={(e) => setTargetEra(e.target.value)}
              placeholder={t('timeTravel.era_placeholder')}
              className="input-field w-full"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ERA_SUGGESTIONS.map((era) => (
                <button
                  key={era}
                  onClick={() => setTargetEra(era)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${
                    targetEra === era
                      ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-600'
                  }`}
                >
                  {era}
                </button>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('timeTravel.upload_title')}
            </label>
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  dragging
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{t('timeTravel.upload_hint_main')}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('timeTravel.upload_hint_sub')}</p>
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="Upload preview" className="w-full max-h-72 object-cover" />
                <button onClick={handleReset} className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={() => inputRef.current?.click()} className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  {t('timeTravel.upload_change')}
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: !file || loading ? undefined : 'linear-gradient(135deg, #92400e, #1e40af)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('timeTravel.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('timeTravel.analyze_btn')}
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            {result.identified === false ? (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {result.message || t('timeTravel.not_identified')}
                </p>
                <button onClick={handleReset} className="btn-primary mt-4 px-6 py-2 text-sm">
                  {t('timeTravel.new_search')}
                </button>
              </div>
            ) : (
              <>
                {/* Identity banner */}
                <div className="card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{result.name}</h2>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {result.location && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            {result.location}
                          </span>
                        )}
                        {result.construction_year && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-gold-500" />
                            {result.construction_year}
                          </span>
                        )}
                        {result.peak_era && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            {result.peak_era}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('timeTravel.new_search')}
                    </button>
                  </div>
                  {result.historical_significance && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                      {result.historical_significance}
                    </p>
                  )}
                </div>

                {/* Tabs */}
                <div className="card overflow-hidden">
                  <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
                          activeTab === id
                            ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 sm:p-6">
                    {/* Compare tab */}
                    {activeTab === 'compare' && (
                      <div className="space-y-4">
                        {result.historical_image ? (
                          <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                              {t('timeTravel.compare_hint')}
                            </p>
                            <ComparisonSlider
                              currentSrc={preview}
                              historicalSrc={result.historical_image}
                              currentLabel={result.current_period || t('timeTravel.label_today')}
                              historicalLabel={result.peak_era || t('timeTravel.label_historical')}
                            />
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                              <ArrowLeftRight className="w-7 h-7 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              {t('timeTravel.no_image_title')}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('timeTravel.no_image_desc')}
                            </p>
                          </div>
                        )}

                        {/* Current vs historical description */}
                        {result.comparison && (
                          <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                {t('timeTravel.label_today')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {result.comparison.current_description}
                              </p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                                {result.peak_era || t('timeTravel.label_historical')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {result.comparison.historical_description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline tab */}
                    {activeTab === 'timeline' && (
                      <div>
                        {result.timeline_events?.length > 0 ? (
                          <Timeline events={result.timeline_events} t={t} />
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                            {t('timeTravel.no_timeline')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Eras tab */}
                    {activeTab === 'eras' && (
                      <div className="space-y-4">
                        {result.historical_periods?.length > 0 ? (
                          result.historical_periods.map((period, i) => (
                            <PeriodCard key={i} period={period} index={i} />
                          ))
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                            {t('timeTravel.no_eras')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Analysis tab */}
                    {activeTab === 'analysis' && result.comparison && (
                      <div className="space-y-5">
                        {/* Key differences */}
                        {result.comparison.key_differences?.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 mb-3 text-sm">
                              <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                              {t('timeTravel.differences_title')}
                            </h3>
                            <ul className="space-y-2">
                              {result.comparison.key_differences.map((diff, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                  <span className="w-5 h-5 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {i + 1}
                                  </span>
                                  {diff}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Preservation */}
                        {result.comparison.preservation_status && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1 uppercase tracking-wider">
                              <Shield className="w-3.5 h-3.5" />
                              {t('timeTravel.preservation_title')}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {result.comparison.preservation_status}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card p-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{t('timeTravel.history_title')}</span>
                <span className="badge badge-primary">{history.length}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            {showHistory && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {history.map((item) => (
                  <HistoryCard key={item.id} item={item} t={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
