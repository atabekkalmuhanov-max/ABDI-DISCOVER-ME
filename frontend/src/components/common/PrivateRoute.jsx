import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function PrivateRoute() {
  const { user, initialized } = useAuthStore()

  // Show spinner while the refresh-on-load attempt is in flight
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
