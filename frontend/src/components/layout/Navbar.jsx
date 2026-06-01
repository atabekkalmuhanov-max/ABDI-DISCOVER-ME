import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Menu, X, LogOut, ChevronDown, Globe, Sun, Moon,
  Wand2, LayoutDashboard, BookOpen, Route, Heart, Shield,
  Sparkles, Camera, Brain, Scroll, Zap, Compass, MessageSquare,
  Map,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/api'

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'uz', label: "O'zbek",     flag: '🇺🇿' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'kk', label: 'Qaraqalpaq', flag: '🇺🇿' },
]

const AI_LINKS = [
  { to: '/ai',          label: 'AI Рекомендации',     Icon: Sparkles },
  { to: '/guide',       label: 'AI Гид',              Icon: Camera },
  { to: '/quiz',        label: 'Тест путешественника', Icon: Brain },
  { to: '/story',       label: 'Режим историй',        Icon: Scroll },
  { to: '/time-travel', label: 'Машина времени',       Icon: Zap },
  { to: '/hidden',      label: 'Тайные места',         Icon: Compass },
  { to: '/assistant',   label: 'AI Ассистент',         Icon: MessageSquare },
]

const MY_TRAVEL_LINKS = [
  { to: '/dashboard', label: 'Дашборд',       Icon: LayoutDashboard },
  { to: '/passport',  label: 'Мой паспорт',   Icon: BookOpen },
  { to: '/routes',    label: 'Мои маршруты',  Icon: Route },
  { to: '/favorites', label: 'Избранное',     Icon: Heart },
]

function useClickOutside(cb) {
  const ref = useRef(null)
  const stable = useCallback(cb, [])
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) stable() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [stable])
  return ref
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [openMenu, setOpenMenu] = useState(null) // 'user' | 'lang' | 'ai' | null
  const [searchQuery, setSearchQuery] = useState('')

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]
  const dropdownRef = useClickOutside(() => setOpenMenu(null))

  useEffect(() => { setMenuOpen(false); setMobileSection(null); setOpenMenu(null) }, [location.pathname])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/')
  }

  const toggle = (name) => setOpenMenu((p) => (p === name ? null : name))

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3 lg:gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="text-primary-500">DISCOVER</span>
              <span className="text-gray-900">-ME</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm xl:max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Куда вы хотите пойти?"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div ref={dropdownRef} className="hidden md:flex items-center gap-0.5">
            <NavLink
              to="/destinations"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }
            >
              Экскурсии
            </NavLink>
            <NavLink
              to="/routes"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }
            >
              Туры
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }
            >
              <Map className="w-3.5 h-3.5" /> Маршруты
            </NavLink>

            {/* AI dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('ai')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${openMenu === 'ai' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                AI
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMenu === 'ai' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'ai' && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-[220px] animate-fade-in">
                  {AI_LINKS.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`
                      }
                    >
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => toggle('lang')}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMenu === 'lang' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'lang' && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[160px] animate-fade-in">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setOpenMenu(null) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${lang.code === i18n.language ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => toggle('user')}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden lg:block">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openMenu === 'user' ? 'rotate-180' : ''}`} />
                </button>
                {openMenu === 'user' && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-[210px] animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    {MY_TRAVEL_LINKS.map(({ to, label, Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`
                        }
                      >
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                    {user.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <NavLink
                          to="/admin"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-red-600 bg-red-50' : 'text-red-500 hover:bg-red-50'}`
                          }
                        >
                          <Shield className="w-4 h-4 shrink-0" /> Admin Panel
                        </NavLink>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 shrink-0" /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
              >
                Войти
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMenuOpen(!menuOpen); setMobileSection(null) }}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-0.5 animate-fade-in max-h-[80vh] overflow-y-auto">
          <NavLink to="/destinations" className={({ isActive }) => `flex px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}>Экскурсии</NavLink>
          <NavLink to="/routes"       className={({ isActive }) => `flex px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}>Туры</NavLink>
          <NavLink to="/map"          className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}><Map className="w-4 h-4" /> Маршруты</NavLink>

          {/* AI accordion */}
          <button
            onClick={() => setMobileSection(mobileSection === 'ai' ? null : 'ai')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> AI Инструменты</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileSection === 'ai' ? 'rotate-180' : ''}`} />
          </button>
          {mobileSection === 'ai' && (
            <div className="pl-4 space-y-0.5 pb-1">
              {AI_LINKS.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'}`
                  }
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </NavLink>
              ))}
            </div>
          )}

          {user && (
            <>
              <button
                onClick={() => setMobileSection(mobileSection === 'travel' ? null : 'travel')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Мои путешествия</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSection === 'travel' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSection === 'travel' && (
                <div className="pl-4 space-y-0.5 pb-1">
                  {MY_TRAVEL_LINKS.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'}`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="border-t border-gray-100 pt-3 mt-1 space-y-3">
            {/* Language */}
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-colors ${lang.code === i18n.language ? 'border-primary-400 text-primary-600 bg-primary-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center justify-between">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-500 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"    className="flex-1 text-center bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-full transition-colors">Войти</Link>
                <Link to="/register" className="flex-1 text-center border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-full hover:bg-gray-50 transition-colors">Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
