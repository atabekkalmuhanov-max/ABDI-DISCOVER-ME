import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Scroll, Building2, BookOpen, Shield, Palette, Compass, Package,
  Zap, Clock, AlignLeft, Play, Square, Copy, Check,
  Sparkles, Loader2, ChevronDown, RefreshCw, MapPin, Calendar,
  Camera, User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { storyService } from '@/services/api'
import toast from 'react-hot-toast'

const LANG_OPTIONS = [
  { code: 'en', label: 'English',    speechCode: 'en-US' },
  { code: 'uz', label: "O'zbek",     speechCode: 'uz-UZ' },
  { code: 'ru', label: 'Русский',    speechCode: 'ru-RU' },
  { code: 'kk', label: 'Qaraqalpaq', speechCode: 'kk-KZ' },
]

const CHARACTERS = [
  { id: 'merchant',  icon: Package,   color: 'amber'   },
  { id: 'architect', icon: Building2, color: 'blue'    },
  { id: 'scholar',   icon: BookOpen,  color: 'emerald' },
  { id: 'ruler',     icon: Shield,    color: 'purple'  },
  { id: 'artisan',   icon: Palette,   color: 'rose'    },
  { id: 'pilgrim',   icon: Compass,   color: 'cyan'    },
]

const LENGTHS = [
  { id: 'short',  icon: Zap,       readTime: '~2 min' },
  { id: 'medium', icon: Clock,     readTime: '~5 min' },
  { id: 'long',   icon: AlignLeft, readTime: '~10 min' },
]

const CHAR_COLOR_CLASSES = {
  amber:   'border-amber-400   bg-amber-50   dark:bg-amber-900/20  text-amber-700   dark:text-amber-300',
  blue:    'border-blue-400    bg-blue-50    dark:bg-blue-900/20   text-blue-700    dark:text-blue-300',
  emerald: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  purple:  'border-purple-400  bg-purple-50  dark:bg-purple-900/20 text-purple-700  dark:text-purple-300',
  rose:    'border-rose-400    bg-rose-50    dark:bg-rose-900/20   text-rose-700    dark:text-rose-300',
  cyan:    'border-cyan-400    bg-cyan-50    dark:bg-cyan-900/20   text-cyan-700    dark:text-cyan-300',
}

function useAudio() {
  const [speaking, setSpeaking] = useState(false)
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  const speak = useCallback((text, langCode) => {
    if (!synth) return
    synth.cancel()
    const utterance      = new SpeechSynthesisUtterance(text)
    utterance.lang       = langCode
    utterance.rate       = 0.88
    utterance.pitch      = 1.05
    utterance.onstart    = () => setSpeaking(true)
    utterance.onend      = () => setSpeaking(false)
    utterance.onerror    = () => setSpeaking(false)
    synth.speak(utterance)
  }, [synth])

  const stop = useCallback(() => {
    synth?.cancel()
    setSpeaking(false)
  }, [synth])

  useEffect(() => () => { synth?.cancel() }, [synth])

  return { speak, stop, speaking, supported: !!synth }
}

function StoryParagraphs({ text }) {
  if (!text) return null
  return (
    <div className="space-y-4">
      {text.split(/\n+/).filter(Boolean).map((para, i) => (
        <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
          {para}
        </p>
      ))}
    </div>
  )
}

function HistoryCard({ item }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const date     = new Date(item.created_at).toLocaleDateString()
  const charData = CHARACTERS.find((c) => c.id === item.character_type)
  const Icon     = charData?.icon || User

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <div className="w-9 h-9 shrink-0 rounded-lg bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gold-600 dark:text-gold-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
            {item.attraction_name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            {item.character_type} · {item.story_length} · {date}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && item.story_text && (
        <div className="px-3 pb-4 animate-fade-in">
          {item.character_intro && (
            <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-2 border-l-2 border-gold-400 pl-2">
              {item.character_intro}
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-6">
            {item.story_text}
          </p>
        </div>
      )}
    </div>
  )
}

export default function StoryMode() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()

  const [attractionName, setAttractionName] = useState(searchParams.get('name')     || '')
  const [location,       setLocation]       = useState(searchParams.get('location') || '')
  const [era,            setEra]            = useState(
    searchParams.get('year') ? `circa ${searchParams.get('year')}` : ''
  )
  const [character,   setCharacter]   = useState('merchant')
  const [storyLength, setStoryLength] = useState('medium')
  const [language,    setLanguage]    = useState(i18n.language.slice(0, 2))

  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [history,     setHistory]     = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [copied,      setCopied]      = useState(false)

  const { speak, stop, speaking, supported: audioSupported } = useAudio()
  const fromGuide = searchParams.has('name')

  useEffect(() => {
    storyService.getHistory()
      .then((data) => setHistory(data.history || []))
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!attractionName.trim()) {
      toast.error(t('story.error_name_required'))
      return
    }
    setLoading(true)
    setResult(null)
    stop()
    try {
      const data = await storyService.generate({
        attraction_name: attractionName.trim(),
        location:        location.trim(),
        era:             era.trim(),
        character_type:  character,
        story_length:    storyLength,
        language,
      })
      setResult(data)
      storyService.getHistory()
        .then((d) => setHistory(d.history || []))
        .catch(() => {})
    } catch {
      toast.error(t('story.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAudio = () => {
    if (speaking) {
      stop()
      return
    }
    if (result?.story) {
      const fullText = result.character_intro
        ? `${result.character_intro}  ${result.story}`
        : result.story
      const langOpt  = LANG_OPTIONS.find((l) => l.code === language) || LANG_OPTIONS[0]
      speak(fullText, langOpt.speechCode)
    }
  }

  const handleCopy = () => {
    if (!result?.story) return
    const text = result.character_intro
      ? `${result.character_intro}\n\n${result.story}`
      : result.story
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReset = () => {
    setResult(null)
    stop()
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-amber-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Scroll className="w-4 h-4 text-gold-400" />
            {t('story.powered_by')}
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">{t('story.title')}</h1>
          <p className="text-primary-200 text-lg">{t('story.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">
        {/* From Guide banner */}
        {fromGuide && !result && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex items-center gap-3">
            <Camera className="w-5 h-5 text-primary-500 shrink-0" />
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {t('story.from_guide')}
            </span>
          </div>
        )}

        {/* Input card — hidden once result is shown */}
        {!result && (
          <div className="card p-6 sm:p-8 space-y-6 animate-fade-in">
            {/* Attraction & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('story.attraction_label')}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={attractionName}
                  onChange={(e) => setAttractionName(e.target.value)}
                  placeholder={t('story.attraction_placeholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('story.location_label')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('story.location_placeholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>
            </div>

            {/* Era */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('story.era_label')}
              </label>
              <input
                type="text"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder={t('story.era_placeholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>

            {/* Character selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t('story.character_label')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHARACTERS.map(({ id, icon: Icon, color }) => {
                  const selected = character === id
                  const colorCls = selected ? CHAR_COLOR_CLASSES[color] : ''
                  return (
                    <button
                      key={id}
                      onClick={() => setCharacter(id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-150 ${
                        selected
                          ? `${colorCls} shadow-sm`
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div>
                        <p className="text-xs font-semibold leading-tight">
                          {t(`story.char_${id}`)}
                        </p>
                        <p className="text-xs opacity-70 leading-tight mt-0.5 hidden sm:block">
                          {t(`story.char_${id}_desc`)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Story length */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t('story.length_label')}
              </label>
              <div className="flex gap-3">
                {LENGTHS.map(({ id, icon: Icon, readTime }) => (
                  <button
                    key={id}
                    onClick={() => setStoryLength(id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                      storyLength === id
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(`story.length_${id}`)}</span>
                    <span className="text-xs opacity-70">{readTime}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('story.language_label')}
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

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={!attractionName.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('story.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('story.generate_btn')}
                </>
              )}
            </button>
          </div>
        )}

        {/* Story result */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            <div className="card p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {result.attraction_name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {result.location && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        {result.location}
                      </span>
                    )}
                    {result.era_description && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        {result.era_description}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('story.new_story')}
                </button>
              </div>

              {/* Character intro */}
              {result.character_intro && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-gold-400 rounded-r-xl px-4 py-3">
                  <p className="text-sm italic text-amber-800 dark:text-amber-200 leading-relaxed">
                    {result.character_intro}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700" />

              {/* Story text */}
              <StoryParagraphs text={result.story} />

              {/* Actions */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-5 flex flex-wrap gap-3">
                {audioSupported && result.story && (
                  <button
                    onClick={handleAudio}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                      speaking
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400'
                        : 'bg-gold-50 dark:bg-gold-900/20 border-gold-400 text-gold-700 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-gold-900/30'
                    }`}
                  >
                    {speaking ? (
                      <><Square className="w-3.5 h-3.5 fill-current" /> {t('story.audio_stop')}</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 fill-current" /> {t('story.audio_play')}</>
                    )}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 transition-all duration-150"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-green-500" /> {t('story.copied')}</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> {t('story.copy')}</>
                  )}
                </button>
              </div>
            </div>

            {/* New story prompt */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-600 dark:hover:text-primary-400 transition-all"
            >
              + {t('story.new_story')}
            </button>
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
                <Scroll className="w-4 h-4 text-gold-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {t('story.history_title')}
                </span>
                <span className="badge badge-primary">{history.length}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              />
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
