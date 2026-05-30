import { useState } from 'react'
import { Sparkles, Send, Loader2, MapPin, Star, RefreshCw, Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { aiService } from '@/services/api'
import toast from 'react-hot-toast'

const INTERESTS = ['interest_history', 'interest_nature', 'interest_adventure', 'interest_cuisine', 'interest_art', 'interest_budget']

function RecommendationCard({ rec, index }) {
  return (
    <div
      className="card p-6 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400 font-bold font-display">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 font-display">{rec.name}</h3>
          {rec.category && (
            <span className="badge badge-primary mt-1">{rec.category}</span>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed">{rec.description}</p>
          {rec.why && (
            <div className="mt-3 flex items-start gap-2 bg-gold-50 dark:bg-gold-900/20 rounded-xl p-3">
              <Lightbulb className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gold-700 dark:text-gold-300">{rec.why}</p>
            </div>
          )}
          {rec.best_time && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400" />
              Best time: {rec.best_time}
            </p>
          )}
          {rec.destination_id && (
            <Link to={`/destinations/${rec.destination_id}`} className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 mt-3 hover:underline font-medium">
              <MapPin className="w-3.5 h-3.5" />
              View destination details
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AiRecommend() {
  const { t } = useTranslation()
  const [selectedInterests, setSelectedInterests] = useState([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const toggleInterest = (key) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userInput = prompt.trim() || selectedInterests.map((k) => t(`ai.${k}`)).join(', ')
    if (!userInput) {
      toast.error('Please describe your interests or select some options above.')
      return
    }

    setLoading(true)
    setResults(null)
    try {
      const res = await aiService.getRecommendations({ prompt: userInput, interests: selectedInterests })
      setResults(res.recommendations)
    } catch {
      toast.error(t('ai.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleExample = () => {
    setPrompt(t('ai.example_prompt'))
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Powered by Claude AI
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">{t('ai.title')}</h1>
          <p className="text-primary-200 text-lg">{t('ai.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Input form */}
        <div className="card p-6 sm:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interest chips */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('ai.interests_title')}</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInterest(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                      selectedInterests.includes(key)
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    {t(`ai.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Describe your perfect trip</label>
                <button type="button" onClick={handleExample} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />{t('ai.try_example')}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('ai.placeholder')}
                rows={4}
                className="input resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('ai.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('ai.generate')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">{t('ai.results_title')}</h2>
              <button
                onClick={() => { setResults(null); setPrompt(''); setSelectedInterests([]) }}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start over
              </button>
            </div>

            {typeof results === 'string' ? (
              <div className="card p-6">
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {results}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
