import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquare, Send, Plus, Trash2, Loader2, Sparkles,
  MapPin, Hotel, UtensilsCrossed, Train, Calculator, Map,
  Clock, ChevronLeft, Bot, User, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { chatService } from '@/services/api'
import toast from 'react-hot-toast'

const QUICK_ACTIONS = [
  { icon: Map, label: 'Plan a 7-day itinerary', prompt: 'Plan me a 7-day itinerary for Uzbekistan covering the main Silk Road cities.' },
  { icon: Hotel, label: 'Hotel recommendations', prompt: 'What are the best hotels in Samarkand for a mid-range budget?' },
  { icon: UtensilsCrossed, label: 'Food & restaurants', prompt: 'What local dishes must I try in Uzbekistan and where are the best restaurants?' },
  { icon: Train, label: 'Transportation guide', prompt: 'How do I travel between Tashkent, Samarkand, Bukhara, and Khiva?' },
  { icon: Calculator, label: 'Budget calculation', prompt: 'How much does a 10-day trip to Uzbekistan cost on a mid-range budget?' },
  { icon: MapPin, label: 'Historical sites', prompt: 'What are the most important historical sites and monuments to visit in Uzbekistan?' },
]

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      const content = line.slice(2, -2)
      elements.push(<p key={key++} className="font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-1 first:mt-0">{content}</p>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.slice(2)
      elements.push(
        <li key={key++} className="ml-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {renderInline(content)}
        </li>
      )
    } else if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '')
      elements.push(
        <li key={key++} className="ml-4 list-decimal text-slate-700 dark:text-slate-300 leading-relaxed">
          {renderInline(content)}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
    } else {
      elements.push(
        <p key={key++} className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
  }

  return elements
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-primary-600 text-white'
          : 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
        }`}>
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
          )}
        </div>
        {msg.created_at && (
          <span className="text-xs text-slate-400 dark:text-slate-500 px-1">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function SessionItem({ session, isActive, onSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(session.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  return (
    <button
      onClick={() => onSelect(session.id)}
      className={`w-full text-left px-3 py-2.5 rounded-xl group flex items-center gap-2 transition-colors ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
      <span className="text-sm truncate flex-1">{session.title}</span>
      <button
        onClick={handleDelete}
        className={`shrink-0 p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
          confirmDelete
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20 opacity-100'
            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
        title={confirmDelete ? 'Click again to confirm' : 'Delete conversation'}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </button>
  )
}

export default function TravelAssistant() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  useEffect(() => {
    chatService.getSessions()
      .then((data) => setSessions(data.sessions || []))
      .catch(() => {})
  }, [])

  const loadSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId)
    setLoadingMessages(true)
    setMessages([])
    try {
      const data = await chatService.getMessages(sessionId)
      setMessages(data.messages || [])
    } catch {
      toast.error('Failed to load conversation')
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const startNewChat = useCallback(() => {
    setActiveSessionId(null)
    setMessages([])
    inputRef.current?.focus()
  }, [])

  const handleSend = useCallback(async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    const userMsg = { role: 'user', content, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await chatService.sendMessage({ message: content, sessionId: activeSessionId })

      if (!activeSessionId) {
        setActiveSessionId(data.sessionId)
        const sessionsData = await chatService.getSessions()
        setSessions(sessionsData.sessions || [])
      } else {
        setSessions((prev) =>
          prev.map((s) => s.id === activeSessionId ? { ...s, updated_at: new Date().toISOString() } : s)
        )
      }

      setMessages((prev) => [...prev, { ...data.message, created_at: new Date().toISOString() }])
    } catch {
      toast.error('Failed to send message. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
      setInput(content)
    } finally {
      setLoading(false)
    }
  }, [input, loading, activeSessionId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        startNewChat()
      }
    } catch {
      toast.error('Failed to delete conversation')
    }
  }, [activeSessionId, startNewChat])

  const isEmpty = messages.length === 0 && !loading && !loadingMessages

  return (
    <div className="flex flex-1 overflow-hidden bg-sand-50 dark:bg-dark-900">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 flex flex-col`}>
        <div className="p-4 flex flex-col gap-3 h-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Conversations</span>
            </div>
          </div>

          {/* New chat button */}
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                No conversations yet
              </div>
            ) : (
              sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  onSelect={loadSession}
                  onDelete={handleDeleteSession}
                />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="shrink-0 h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">AI Travel Assistant</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Uzbekistan Expert</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Powered by Claude AI</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">

            {isEmpty ? (
              <div className="text-center">
                {/* Welcome */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Your Uzbekistan Travel Assistant
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">
                  Ask me anything about traveling in Uzbekistan — from hotels and restaurants to historical sites and budget tips.
                </p>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => handleSend(prompt)}
                      className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={msg.id || i} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 p-4">
          <div className="max-w-2xl mx-auto">
            {!isEmpty && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_ACTIONS.slice(0, 3).map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-40"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about hotels, routes, history, budget..."
                  rows={1}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60"
                  style={{ minHeight: '48px', maxHeight: '160px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                  }}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white flex items-center justify-center transition-colors shrink-0"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
