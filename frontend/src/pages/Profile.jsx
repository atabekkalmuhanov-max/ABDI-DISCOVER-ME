import { useState } from 'react'
import { User, Mail, Calendar, Edit2, Check, X, Camera, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/authStore'
import { userService } from '@/services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const { t } = useTranslation()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' })

  const [changingPw, setChangingPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateProfile(form)
      setUser({ ...user, ...updated }, useAuthStore.getState().token)
      toast.success(t('profile.saved'))
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name: user?.name || '', bio: user?.bio || '' })
    setEditing(false)
  }

  const handlePwSave = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error(t('profile.pw_mismatch'))
      return
    }
    setSavingPw(true)
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      toast.success(t('profile.password_changed'))
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setChangingPw(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  const handlePwCancel = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setChangingPw(false)
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-600 h-40" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-20 space-y-4">
        {/* Profile card */}
        <div className="card p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex items-end gap-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-3xl font-bold font-display shadow-lg border-4 border-white dark:border-dark-800">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-dark-700 rounded-full border-2 border-primary-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:text-primary-600 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('profile.traveler')}</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-4 shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {t('profile.edit')}
              </button>
            )}
          </div>

          {/* Info / Edit form */}
          {editing ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.bio')}</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder={t('profile.bio_placeholder')}
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                  <Check className="w-4 h-4" />
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
                <button onClick={handleCancel} className="btn-secondary flex items-center gap-2 text-sm py-2 px-5">
                  <X className="w-4 h-4" />
                  {t('profile.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {user?.bio && (
                <div className="bg-sand-50 dark:bg-dark-850 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border border-sand-200 dark:border-slate-700">
                  {user.bio}
                </div>
              )}

              <div className="divider" />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('profile.name')}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('profile.email')}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('profile.joined')}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change password card */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">{t('profile.change_password')}</h2>
            </div>
            {!changingPw && (
              <button
                onClick={() => setChangingPw(true)}
                className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-4"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {t('profile.edit')}
              </button>
            )}
          </div>

          {changingPw ? (
            <div className="space-y-4">
              {[
                { key: 'currentPassword', label: t('profile.current_password') },
                { key: 'newPassword', label: t('profile.new_password') },
                { key: 'confirmPassword', label: t('profile.confirm_new_password') },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder="••••••••"
                    className="input"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button onClick={handlePwSave} disabled={savingPw} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                  <Check className="w-4 h-4" />
                  {savingPw ? t('profile.saving') : t('profile.save')}
                </button>
                <button onClick={handlePwCancel} className="btn-secondary flex items-center gap-2 text-sm py-2 px-5">
                  <X className="w-4 h-4" />
                  {t('profile.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('profile.password_hint')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
