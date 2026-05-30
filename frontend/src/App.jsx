import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Destinations from '@/pages/Destinations'
import DestinationDetail from '@/pages/DestinationDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Dashboard from '@/pages/Dashboard'
import MapPage from '@/pages/MapPage'
import AiRecommend from '@/pages/AiRecommend'
import AiGuide from '@/pages/AiGuide'
import TravelQuiz from '@/pages/TravelQuiz'
import StoryMode from '@/pages/StoryMode'
import TimeTravelPage from '@/pages/TimeTravelPage'
import NotFound from '@/pages/NotFound'
import PrivateRoute from '@/components/common/PrivateRoute'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/api'

export default function App() {
  const { user, token, setUser, setInitialized } = useAuthStore()

  useEffect(() => {
    // On mount: if user is persisted but no access token, try to refresh via httpOnly cookie
    if (user && !token) {
      authService.refresh()
        .then(({ token: newToken, user: refreshedUser }) => {
          setUser(refreshedUser, newToken)
        })
        .catch(() => {
          useAuthStore.getState().logout()
        })
    } else {
      setInitialized()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen bg-sand-50 dark:bg-dark-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<MapPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai" element={<AiRecommend />} />
            <Route path="/guide" element={<AiGuide />} />
            <Route path="/quiz" element={<TravelQuiz />} />
            <Route path="/story" element={<StoryMode />} />
            <Route path="/time-travel" element={<TimeTravelPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
