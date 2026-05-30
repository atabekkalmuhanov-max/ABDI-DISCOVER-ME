import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/api'
import useAuthStore from '@/store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { user, token } = await authService.register({ name: form.name, email: form.email, password: form.password })
      setUser(user, token)
      toast.success(t('auth.account_created'))
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name', label: t('auth.full_name'), type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: t('auth.email'), type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: t('auth.password'), type: showPw ? 'text' : 'password', placeholder: '••••••••', hasToggle: true },
    { name: 'confirmPassword', label: t('auth.confirm_password'), type: showPw ? 'text' : 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-sand-50 dark:bg-dark-900 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">{t('auth.register_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">{t('auth.register_subtitle')}</p>
        </div>

        <div className="card p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ name, label, type, placeholder, hasToggle }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required
                    className="input"
                  />
                  {hasToggle && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? t('auth.creating') : t('auth.create_account')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">{t('auth.sign_in_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
