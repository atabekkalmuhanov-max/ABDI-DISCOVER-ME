import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/api'
import useAuthStore from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, token } = await authService.login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      })
      setUser(user, token)
      toast.success(t('auth.welcome_back'))
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-sand-50 dark:bg-dark-900 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">{t('auth.login_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">{t('auth.login_subtitle')}</p>
        </div>

        <div className="card p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-dark-800 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('auth.remember_me')}</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">{t('auth.sign_up_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
