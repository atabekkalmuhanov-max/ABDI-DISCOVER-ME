import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/context/ThemeContext'
import App from './App'
import './i18n'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-slate-100',
              style: { borderRadius: '12px' },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
