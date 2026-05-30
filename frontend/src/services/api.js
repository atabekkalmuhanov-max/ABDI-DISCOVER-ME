import axios from 'axios'
import useAuthStore from '@/store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly refresh token cookie
})

// Attach access token from store to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Queue of requests waiting for token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const original = err.config

    // On 401, try to refresh — but skip if this IS the refresh call
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { token, user } = await api.post('/auth/refresh')
        useAuthStore.getState().setUser(user, token)
        processQueue(null, token)
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        useAuthStore.getState().logout()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
}

export const destinationService = {
  getAll: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  create: (data) => api.post('/destinations', data),
  update: (id, data) => api.put(`/destinations/${id}`, data),
  delete: (id) => api.delete(`/destinations/${id}`),
}

export const reviewService = {
  getByDestination: (destinationId) => api.get(`/reviews/destination/${destinationId}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
}

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  getProfile: () => api.get('/users/profile'),
  changePassword: (data) => api.put('/users/password', data),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
}

export const aiService = {
  getRecommendations: (data) => api.post('/ai/recommend', data),
}

export const guideService = {
  analyze: (formData) =>
    api.post('/guide/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: () => api.get('/guide/history'),
}

export const quizService = {
  submit: (answers) => api.post('/quiz/submit', { answers }),
  getHistory: () => api.get('/quiz/history'),
}

export const storyService = {
  generate: (data) => api.post('/story/generate', data),
  getHistory: () => api.get('/story/history'),
}

export const timeTravelService = {
  analyze: (formData) =>
    api.post('/time-travel/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: () => api.get('/time-travel/history'),
}

export default api
