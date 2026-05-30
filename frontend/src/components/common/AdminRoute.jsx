import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function AdminRoute() {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
