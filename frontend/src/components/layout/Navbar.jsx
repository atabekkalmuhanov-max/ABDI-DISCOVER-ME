import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Globe, Menu, X, User, LogOut, Sun, Moon, ChevronDown, Map, LayoutDashboard, Sparkles, Camera, Scroll, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/api'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'kk', label: 'Qaraqalpaq', flag: '🇺🇿' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try { await authService.logout() } catch {} // best-effort server logout
    logout()
    navigate('/')
  }
  const handleLang = (code) => { i18n.changeLanguage(code); setLangOpen(false) }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/destinations', label: t('nav.destinations') },
    { to: '/map', label: t('nav.map'), icon: Map },
    ...(user ? [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/ai', label: t('nav.ai'), icon: Sparkles },
    { to: '/guide', label: t('nav.guide'), icon: Camera },
    { to: '/story', label: t('nav.story'), icon: Scroll },
    { to: '/time-travel', label: t('nav.timeTravel'), icon: Zap },
  ] : []),
  ]

  return (
    <nav className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary-700 dark:text-primary-400 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-white" />
            </div>
            Discover Me
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 card shadow-lg py-1 z-50 animate-fade-in">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLang(lang.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                        lang.code === i18n.language
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">{t('nav.register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-700 dark:text-slate-300'
                }`
              }
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </NavLink>
          ))}

          <div className="divider pt-2 mt-2">
            <div className="flex flex-wrap gap-2 pt-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { handleLang(lang.code); setMenuOpen(false) }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    lang.code === i18n.language
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>

          {user ? (
            <div className="pt-2 flex items-center justify-between">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                {user.name}
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-sm text-red-500 flex items-center gap-1">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm py-2 px-4 flex-1 text-center">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm py-2 px-4 flex-1 text-center">{t('nav.register')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
