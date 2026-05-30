import { Link } from 'react-router-dom'
import { Globe, Instagram, Facebook, Youtube, MapPin, Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-slate-900 dark:bg-dark-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-display font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5 text-white" />
              </div>
              Discover Me
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Your gateway to the hidden gems and iconic wonders of Uzbekistan — the Pearl of Central Asia and heart of the ancient Silk Road.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-primary-700 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{t('nav.destinations')}</h4>
            <ul className="space-y-2.5 text-sm">
              {['Samarkand', 'Bukhara', 'Khiva', 'Tashkent', 'Chimgan'].map((city) => (
                <li key={city}>
                  <Link to={`/destinations?search=${city}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MapPin className="w-3 h-3 text-gold-500" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/map" className="hover:text-white transition-colors">{t('nav.map')}</Link></li>
              <li><Link to="/ai" className="hover:text-white transition-colors">{t('nav.ai')}</Link></li>
              <li><Link to="/guide" className="hover:text-white transition-colors">{t('nav.guide')}</Link></li>
              <li><Link to="/destinations" className="hover:text-white transition-colors">{t('nav.destinations')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">{t('nav.register')}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Travel Guides</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <span className="text-slate-400">1 Amir Temur Square, Tashkent, Uzbekistan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href="mailto:hello@discoverme.uz" className="text-slate-400 hover:text-white transition-colors">hello@discoverme.uz</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span className="text-slate-400">+998 71 200 00 00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Discover Me Uzbekistan. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
