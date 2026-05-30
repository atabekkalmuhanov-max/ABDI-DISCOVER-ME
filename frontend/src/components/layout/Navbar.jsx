import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Globe, Menu, X, User, LogOut, Sun, Moon, ChevronDown,
  Map, LayoutDashboard, Sparkles, Camera, Scroll, Zap,
  MessageSquare, Compass, BookOpen, Route, Heart, Shield,
  Brain, Wand2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/api'

const LANGUAGES = [
  { code: 'en', label: 'English',      flag: '🇬🇧' },
  { code: 'uz', label: "O'zbek",       flag: '🇺🇿' },
  { code: 'ru', label: 'Русский',      flag: '🇷🇺' },
  { code: 'kk', label: 'Qaraqalpaq',   flag: '🇺🇿' },
]

const AI_LINKS = [
  { to: '/ai',          label: 'AI Recommend',   Icon: Sparkles,     desc: 'Personalized destination picks' },
  { to: '/guide',       label: 'AI Guide',        Icon: Camera,       desc: 'Analyze landmarks with photos' },
  { to: '/quiz',        label: 'Travel Quiz',     Icon: Brain,        desc: 'Find your travel personality' },
  { to: '/story',       label: 'Story Mode',      Icon: Scroll,       desc: 'AI-generated travel stories' },
  { to: '/time-travel', label: 'Time Travel',     Icon: Zap,          desc: 'Visit monuments through history' },
  { to: '/hidden',      label: 'Hidden Places',   Icon: Compass,      desc: 'Off-the-beaten-path gems' },
  { to: '/assistant',   label: 'AI Assistant',    Icon: MessageSquare, desc: 'Your Uzbekistan travel chatbot' },
]

const MY_TRAVEL_LINKS = [
  { to: '/dashboard',  label: 'Dashboard',     Icon: LayoutDashboard },
  { to: '/passport',   label: 'My Passport',   Icon: BookOpen         },
  { to: '/routes',     label: 'My Routes',     Icon: Route            },
  { to: '/favorites',  label: 'Favorites',     Icon: Heart            },
]

function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return { open, setOpen, ref }
}

function DropdownMenu({ trigger, children, align = 'left' }) {
  const { open, setOpen, ref } = useDropdown()
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          open
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {trigger}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} card shadow-xl py-1.5 z-50 animate-fade-in min-w-[220px]`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const langDropdown = useDropdown()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setMobileSection(null) }, [location.pathname])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/')
  }

  const aiActive = AI_LINKS.some(l => location.pathname.startsWith(l.to))
  const myTravelActive = MY_TRAVEL_LINKS.some(l => location.pathname.startsWith(l.to))

  return (
    <nav className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary-700 dark:text-primary-400 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            Discover Me
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`
            }>
              {t('nav.home')}
            </NavLink>

            <NavLink to="/destinations" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`
            }>
              {t('nav.destinations')}
            </NavLink>

            <NavLink to="/map" className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`
            }>
              <Map className="w-3.5 h-3.5" /> {t('nav.map')}
            </NavLink>

            {user && (
              <>
                {/* AI Features dropdown */}
                <DropdownMenu
                  trigger={
                    <span className={`flex items-center gap-1.5 ${aiActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      <Wand2 className="w-3.5 h-3.5" /> AI Features
                    </span>
                  }
                >
                  <div className="px-2 pb-1">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-2 py-1.5 uppercase tracking-wider">AI-Powered Tools</p>
                  </div>
                  {AI_LINKS.map(({ to, label, Icon, desc }) => (
                    <NavLink key={to} to={to} className={({ isActive }) =>
                      `flex items-start gap-3 px-3 py-2.5 mx-1 rounded-lg transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`
                    }>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{label}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{desc}</p>
                      </div>
                    </NavLink>
                  ))}
                </DropdownMenu>

                {/* My Travel dropdown */}
                <DropdownMenu
                  trigger={
                    <span className={`flex items-center gap-1.5 ${myTravelActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      <BookOpen className="w-3.5 h-3.5" /> My Travel
                    </span>
                  }
                >
                  {MY_TRAVEL_LINKS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`
                    }>
                      <Icon className="w-4 h-4 opacity-70" />
                      {label}
                    </NavLink>
                  ))}
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                      <NavLink to="/admin" className={({ isActive }) =>
                        `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`
                      }>
                        <Shield className="w-4 h-4" /> Admin Panel
                      </NavLink>
                    </>
                  )}
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language picker */}
            <div ref={langDropdown.ref} className="relative">
              <button
                onClick={() => langDropdown.setOpen(!langDropdown.open)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langDropdown.open ? 'rotate-180' : ''}`} />
              </button>
              {langDropdown.open && (
                <div className="absolute right-0 top-full mt-1.5 w-44 card shadow-lg py-1 z-50 animate-fade-in">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); langDropdown.setOpen(false) }}
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
            <button
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => { setMenuOpen(!menuOpen); setMobileSection(null) }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 px-4 py-4 space-y-1 animate-fade-in max-h-[80vh] overflow-y-auto">
          {/* Public links */}
          {[
            { to: '/', label: t('nav.home'), end: true },
            { to: '/destinations', label: t('nav.destinations') },
            { to: '/map', label: t('nav.map') },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-700 dark:text-slate-300'}`
              }
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <>
              {/* AI Features accordion */}
              <button
                onClick={() => setMobileSection(mobileSection === 'ai' ? null : 'ai')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileSection === 'ai' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-700 dark:text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> AI Features</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSection === 'ai' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSection === 'ai' && (
                <div className="pl-4 space-y-0.5">
                  {AI_LINKS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-600 dark:text-slate-400'}`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* My Travel accordion */}
              <button
                onClick={() => setMobileSection(mobileSection === 'travel' ? null : 'travel')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileSection === 'travel' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-700 dark:text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> My Travel</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSection === 'travel' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSection === 'travel' && (
                <div className="pl-4 space-y-0.5">
                  {MY_TRAVEL_LINKS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-600 dark:text-slate-400'}`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </NavLink>
                  ))}
                  {user?.role === 'admin' && (
                    <NavLink to="/admin"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-red-600 dark:text-red-400'}`
                      }
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin Panel
                    </NavLink>
                  )}
                </div>
              )}
            </>
          )}

          {/* Language + auth */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
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

            {user ? (
              <div className="flex items-center justify-between">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-500 flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center">{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
