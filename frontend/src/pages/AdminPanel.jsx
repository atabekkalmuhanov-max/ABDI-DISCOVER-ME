import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Users, MapPin, Star, Shield,
  Search, Trash2, Edit3, ChevronLeft, ChevronRight,
  UserCheck, UserX, Crown, Eye, EyeOff, Plus, X, Check,
  TrendingUp, MessageSquare, Route, Globe,
} from 'lucide-react'
import { adminService } from '@/services/api'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  admin:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  moderator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  guide:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  user:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const ROLE_ICONS = {
  admin:     Crown,
  moderator: Shield,
  guide:     Globe,
  user:      Users,
}

const TABS = [
  { id: 'overview',      label: 'Overview',      Icon: LayoutDashboard },
  { id: 'users',         label: 'Users',          Icon: Users           },
  { id: 'destinations',  label: 'Destinations',   Icon: MapPin          },
  { id: 'reviews',       label: 'Reviews',        Icon: Star            },
]

function StatCard({ label, value, icon: Icon, color = 'primary', sub }) {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    gold:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    rose:    'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    cyan:    'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  }
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ stats }) {
  if (!stats) return <div className="text-center py-16 text-slate-400">Loading stats...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Users"          value={stats.stats.users}         icon={Users}          color="primary" />
        <StatCard label="Destinations"   value={stats.stats.destinations}   icon={MapPin}         color="emerald" />
        <StatCard label="Reviews"        value={stats.stats.reviews}        icon={Star}           color="gold"    />
        <StatCard label="Routes"         value={stats.stats.routes}         icon={Route}          color="purple"  />
        <StatCard label="Chat Sessions"  value={stats.stats.chatSessions}   icon={MessageSquare}  color="cyan"    />
        <StatCard label="Passport Visits" value={stats.stats.passportVisits} icon={TrendingUp}    color="rose"    />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Role breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" /> User Roles
          </h3>
          <div className="space-y-2">
            {stats.roleBreakdown?.map(({ role, count }) => {
              const Icon = ROLE_ICONS[role] || Users
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[role] || ROLE_COLORS.user}`}>{role}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top destinations */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Most Visited Destinations
          </h3>
          <div className="space-y-2">
            {stats.topDestinations?.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.name}</p>
                  {d.region && <p className="text-xs text-slate-400">{d.region}</p>}
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0">{d.visit_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Name</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Role</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.recentUsers?.map(u => (
                <tr key={u.id}>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                  </td>
                  <td className="py-2.5 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Users Tab ──────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers({ page, limit: LIMIT, search: debouncedSearch })
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const changeRole = async (userId, role) => {
    try {
      const data = await adminService.updateUser(userId, { role })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u))
      toast.success(`Role updated to ${role}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role')
    }
  }

  const toggleActive = async (user) => {
    try {
      const data = await adminService.updateUser(user.id, { is_active: !user.is_active })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data.user } : u))
      toast.success(data.user.is_active ? 'User activated' : 'User deactivated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user')
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await adminService.deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setTotal(t => t - 1)
      toast.success('User deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">User</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Joined</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}
                    >
                      {['user', 'guide', 'moderator', 'admin'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {u.is_active ? <><UserCheck className="w-3 h-3" /> Active</> : <><UserX className="w-3 h-3" /> Inactive</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(u)} className={`p-1.5 rounded-lg transition-colors ${
                        u.is_active
                          ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`} title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete user">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>
    </div>
  )
}

// ── Destinations Tab ───────────────────────────────────────────
function DestinationsTab() {
  const [destinations, setDestinations] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editDest, setEditDest] = useState(null)
  const [formData, setFormData] = useState({ name: '', region: '', category: '', description: '', image_url: '', featured: false })
  const [saving, setSaving] = useState(false)
  const LIMIT = 20

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchDests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getDestinations({ page, limit: LIMIT, search: debouncedSearch })
      setDestinations(data.destinations || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchDests() }, [fetchDests])
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const openCreate = () => { setEditDest(null); setFormData({ name: '', region: '', category: '', description: '', image_url: '', featured: false }); setShowForm(true) }
  const openEdit = (dest) => { setEditDest(dest); setFormData({ name: dest.name, region: dest.region || '', category: dest.category || '', description: dest.description || '', image_url: dest.image_url || '', featured: dest.featured || false }); setShowForm(true) }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editDest) {
        const data = await adminService.updateDestination(editDest.id, formData)
        setDestinations(prev => prev.map(d => d.id === editDest.id ? { ...d, ...data.destination } : d))
        toast.success('Destination updated')
      } else {
        const data = await adminService.createDestination(formData)
        setDestinations(prev => [data.destination, ...prev])
        setTotal(t => t + 1)
        toast.success('Destination created')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination?')) return
    try {
      await adminService.deleteDestination(id)
      setDestinations(prev => prev.filter(d => d.id !== id))
      setTotal(t => t - 1)
      toast.success('Destination deleted')
    } catch {
      toast.error('Failed to delete destination')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
          />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Region</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Category</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Featured</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : destinations.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{d.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{d.region || '—'}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">{d.category || '—'}</span></td>
                  <td className="px-4 py-3">
                    {d.featured
                      ? <span className="text-xs text-amber-600 font-medium">⭐ Yes</span>
                      : <span className="text-xs text-slate-400">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">{editDest ? 'Edit Destination' : 'Add Destination'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'name',        label: 'Name *',      type: 'text'  },
                { key: 'region',      label: 'Region',      type: 'text'  },
                { key: 'category',    label: 'Category',    type: 'text'  },
                { key: 'image_url',   label: 'Image URL',   type: 'url'   },
                { key: 'description', label: 'Description', type: 'textarea' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <input type={type} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Featured destination</span>
              </label>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50">
                <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reviews Tab ─────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getReviews({ page, limit: LIMIT })
      setReviews(data.reviews || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await adminService.deleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
      setTotal(t => t - 1)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    }
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Rating</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Comment</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : reviews.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{r.user_name}</p>
                    <p className="text-xs text-slate-400">{r.user_email}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">{r.entity_type}</span></td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      {'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}
                      <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">{r.rating}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[240px]"><p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-xs">{r.comment || r.title || '—'}</p></td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteReview(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Platform management &amp; moderation</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'     && <OverviewTab stats={stats} />}
      {activeTab === 'users'        && <UsersTab />}
      {activeTab === 'destinations' && <DestinationsTab />}
      {activeTab === 'reviews'      && <ReviewsTab />}
    </div>
  )
}
