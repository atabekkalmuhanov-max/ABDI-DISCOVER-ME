import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-sand-50 dark:bg-dark-900">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-8xl font-display font-bold text-primary-600 dark:text-primary-400 mb-2">404</h1>
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-3">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          Looks like this destination doesn't exist on our map. Let's get you back on the Silk Road.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/destinations" className="btn-secondary">Explore Destinations</Link>
        </div>
      </div>
    </div>
  )
}
