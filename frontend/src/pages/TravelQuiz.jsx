import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Sparkles, ChevronRight, ChevronLeft, Loader2, RotateCcw,
  MapPin, Star, Lightbulb, Wallet, Clock, Thermometer,
  Landmark, Users, Hotel, Zap, CheckCircle2,
} from 'lucide-react'
import { quizService } from '@/services/api'
import toast from 'react-hot-toast'

const QUESTIONS = [
  {
    key: 'budget',
    icon: Wallet,
    options: ['budget', 'midrange', 'premium', 'luxury'],
  },
  {
    key: 'duration',
    icon: Clock,
    options: ['weekend', 'short', 'week', 'extended'],
  },
  {
    key: 'climate',
    icon: Thermometer,
    options: ['hot', 'mild', 'cool', 'any'],
  },
  {
    key: 'interest',
    icon: Landmark,
    options: ['history', 'nature', 'adventure', 'mixed'],
  },
  {
    key: 'group',
    icon: Users,
    options: ['solo', 'couple', 'family', 'friends'],
  },
  {
    key: 'comfort',
    icon: Hotel,
    options: ['economy', 'comfort', 'luxury'],
  },
  {
    key: 'adventure',
    icon: Zap,
    options: ['low', 'moderate', 'high'],
  },
]

const OPTION_EMOJI = {
  budget: '💰', midrange: '💳', premium: '✨', luxury: '👑',
  weekend: '⚡', short: '🗓️', week: '📅', extended: '🌍',
  hot: '☀️', mild: '🌤️', cool: '🏔️', any: '🌈',
  history: '🏛️', nature: '🌿', adventure: '🧗', mixed: '🎭',
  solo: '🧳', couple: '💑', family: '👨‍👩‍👧', friends: '👥',
  economy: '🏠', comfort: '🏨', luxury: '🏰',
  low: '☕', moderate: '🚵', high: '🪂',
}

function ProgressBar({ current, total }) {
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
      <div
        className="bg-gradient-to-r from-primary-500 to-gold-500 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  )
}

function QuestionStep({ question, answer, onSelect }) {
  const { t } = useTranslation()
  const Icon = question.icon

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
          {t(`quiz.q${QUESTIONS.findIndex((q) => q.key === question.key) + 1}_title`)}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const selected = answer === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                selected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="text-2xl shrink-0">{OPTION_EMOJI[opt]}</span>
              <span className={`font-medium text-sm ${
                selected
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {t(`quiz.q${QUESTIONS.findIndex((q) => q.key === question.key) + 1}_${opt}`)}
              </span>
              {selected && (
                <CheckCircle2 className="w-4 h-4 text-primary-500 ml-auto shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResultCard({ rec, index }) {
  return (
    <div
      className="card p-6 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0 text-gold-600 dark:text-gold-400 font-bold font-display text-sm">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 font-display">
            {rec.name}
          </h3>
          {rec.category && (
            <span className="badge badge-primary mt-1">{rec.category}</span>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed">
            {rec.description}
          </p>
          {rec.why && (
            <div className="mt-3 flex items-start gap-2 bg-gold-50 dark:bg-gold-900/20 rounded-xl p-3">
              <Lightbulb className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gold-700 dark:text-gold-300">{rec.why}</p>
            </div>
          )}
          {rec.budget_fit && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {rec.budget_fit}
            </p>
          )}
          {rec.best_time && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400" />
              Best time: {rec.best_time}
            </p>
          )}
          {rec.destination_id && (
            <Link
              to={`/destinations/${rec.destination_id}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 mt-3 hover:underline font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              View destination details
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TravelQuiz() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const currentQuestion = QUESTIONS[step]
  const currentAnswer = answers[currentQuestion?.key]
  const isLastStep = step === QUESTIONS.length - 1
  const total = QUESTIONS.length

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }))
  }

  const handleNext = () => {
    if (!currentAnswer) {
      toast.error('Please select an option before continuing.')
      return
    }
    if (isLastStep) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await quizService.submit(answers)
      setResults(res.recommendations)
      toast.success(t('quiz.saved'))
    } catch {
      toast.error(t('quiz.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(0)
    setAnswers({})
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Powered by Claude AI
          </div>
          <h1 className="text-4xl font-display font-bold mb-3">{t('quiz.title')}</h1>
          <p className="text-primary-200 text-lg">{t('quiz.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Quiz card */}
        {!results && (
          <div className="card p-6 sm:p-8">
            {/* Step indicator + progress */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t('quiz.step', { current: step + 1, total })}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {Math.round(((step + 1) / total) * 100)}%
                </span>
              </div>
              <ProgressBar current={step + 1} total={total} />
            </div>

            {/* Question */}
            <QuestionStep
              question={currentQuestion}
              answer={currentAnswer}
              onSelect={handleSelect}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('quiz.back')}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !currentAnswer}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('quiz.submitting')}
                  </>
                ) : isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t('quiz.submit')}
                  </>
                ) : (
                  <>
                    {t('quiz.next')}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                {t('quiz.results_title')}
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('quiz.start_over')}
              </button>
            </div>

            {/* Answer summary chips */}
            <div className="card p-4 mb-5">
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).map(([key, val]) => (
                  <span key={key} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-100 dark:border-primary-800">
                    <span>{OPTION_EMOJI[val]}</span>
                    {t(`quiz.q${QUESTIONS.findIndex((q) => q.key === key) + 1}_${val}`)}
                  </span>
                ))}
              </div>
            </div>

            {typeof results === 'string' ? (
              <div className="card p-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{results}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((rec, i) => (
                  <ResultCard key={i} rec={rec} index={i} />
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={handleReset} className="btn-gold flex items-center justify-center gap-2 flex-1 py-3">
                <RotateCcw className="w-4 h-4" />
                {t('quiz.start_over')}
              </button>
              <Link to="/destinations" className="btn-primary flex items-center justify-center gap-2 flex-1 py-3">
                <MapPin className="w-4 h-4" />
                Explore Destinations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
