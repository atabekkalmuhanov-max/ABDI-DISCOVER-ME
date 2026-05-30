import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, Upload, X, Play, Square, MapPin, Calendar, Building2,
  BookOpen, Sparkles, Loader2, Clock, RefreshCw, ChevronDown, Scroll,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { guideService } from '@/services/api'
import toast from 'react-hot-toast'

const LANG_OPTIONS = [
  { code: 'en', label: 'English', speechCode: 'en-US' },
  { code: 'uz', label: "O'zbek", speechCode: 'uz-UZ' },
  { code: 'ru', label: 'Русский', speechCode: 'ru-RU' },
  { code: 'kk', label: 'Qaraqalpaq', speechCode: 'kk-KZ' },
]

function useAudio() {
  const [speaking, setSpeaking] = useState(false)
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const supported = !!synth

  const speak = useCallback((text, langCode) => {
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
  }, [synth])

  const stop = useCallback(() => {
    if (!synth) return
    synth.cancel()
    setSpeaking(false)
  }, [synth])

  useEffect(() => () => { synth?.cancel() }, [synth])

  return { speak, stop, speaking, supported }
}

function FactList({ items, icon: Icon, title }) {
  if (!items?.length) return null
  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 mb-3">
        <Icon className="w-4 h-4 text-primary-500" />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="w-5 h-5 shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function HistoryCard({ item }) {
  const { t } = useTranslation()
  const date = new Date(item.created_at).toLocaleDateString()
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
        <Camera className="w-4 h-4 text-gold-600 dark:text-gold-400" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{item.attraction_name}</p>
        {item.location && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {item.location}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {t('guide.history_date')}: {date}
        </p>
      </div>
    </div>
  )
}

export default function AiGuide() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [language, setLanguage] = useState(i18n.language.slice(0, 2))
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef(null)
  const { speak, stop, speaking, supported: audioSupported } = useAudio()

  const currentLangOption = LANG_OPTIONS.find((l) => l.code === language) || LANG_OPTIONS[0]

  useEffect(() => {
    guideService.getHistory()
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
    stop()
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a photo first.')
      return
    }
    setLoading(true)
    setResult(null)
    stop()
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('language', language)
      const data = await guideService.analyze(formData)
      setResult(data)
      if (data.identified !== false) {
        guideService.getHistory()
          .then((d) => setHistory(d.history || []))
          .catch(() => {})
      }
    } catch {
      toast.error(t('guide.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    stop()
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAudio = () => {
    if (speaking) {
      stop()
    } else if (result?.audio_text) {
      speak(result.audio_text, currentLangOption.speechCode)
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Powered by Claude AI Vision
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">{t('guide.title')}</h1>
          <p className="text-primary-200 text-lg">{t('guide.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">
        {/* Upload & Language card */}
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Language selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('guide.language_label')}
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

          {/* Upload zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('guide.upload_title')}
            </label>
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  dragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {t('guide.upload_hint').split('—')[0]}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {t('guide.upload_hint').split('—')[1]}
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="Upload preview" className="w-full max-h-72 object-cover" />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {t('guide.upload_change')}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('guide.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('guide.analyze_btn')}
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="card p-6 sm:p-8 animate-slide-up space-y-6">
            {result.identified === false ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {result.message || t('guide.not_identified')}
                </p>
                <button onClick={handleReset} className="btn-primary mt-4 px-6 py-2 text-sm">
                  {t('guide.new_search')}
                </button>
              </div>
            ) : (
              <>
                {/* Name & meta */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{result.name}</h2>
                    <button
                      onClick={handleReset}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('guide.new_search')}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
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
                  </div>
                </div>

                {/* Architecture style */}
                {result.architecture_style && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1 uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5" />
                      {t('guide.result_style')}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.architecture_style}</p>
                  </div>
                )}

                {/* Historical facts */}
                <FactList
                  items={result.historical_facts}
                  icon={BookOpen}
                  title={t('guide.result_facts')}
                />

                {/* Interesting stories */}
                <FactList
                  items={result.interesting_stories}
                  icon={Sparkles}
                  title={t('guide.result_stories')}
                />

                {/* Audio guide + Story Mode */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-5 flex flex-wrap gap-3">
                  {result.audio_text && (
                    audioSupported ? (
                      <button
                        onClick={handleAudio}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                          speaking
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400'
                            : 'bg-gold-50 dark:bg-gold-900/20 border-gold-400 text-gold-700 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-gold-900/30'
                        }`}
                      >
                        {speaking ? (
                          <><Square className="w-3.5 h-3.5 fill-current" /> {t('guide.audio_stop')}</>
                        ) : (
                          <><Play className="w-3.5 h-3.5 fill-current" /> {t('guide.audio_play')}</>
                        )}
                      </button>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t('guide.audio_unsupported')}</p>
                    )
                  )}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        name: result.name || '',
                        location: result.location || '',
                        ...(result.construction_year ? { year: result.construction_year } : {}),
                      })
                      navigate(`/story?${params.toString()}`)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all duration-150"
                  >
                    <Scroll className="w-3.5 h-3.5" />
                    {t('guide.live_the_story')}
                  </button>
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
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{t('guide.history_title')}</span>
                <span className="badge badge-primary">{history.length}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            {showHistory && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {history.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
