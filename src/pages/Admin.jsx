import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiCheck, FiX, FiAlertTriangle, FiUsers, FiFileText, FiMessageCircle } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function Admin() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [topics, setTopics] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ reports: 0, topics: 0, users: 0, comments: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    if (!profile.is_admin) { navigate('/'); toast.error('Akses ditolak!'); return }
    fetchAll()
  }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    const [r, t, u, cm] = await Promise.all([
      supabase.from('reports').select('*, users!reporter_id(username), topics(title), comments(content)').order('created_at', { ascending: false }),
      supabase.from('topics').select('*, users(username)').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
    ])
    setReports(r.data || [])
    setTopics(t.data || [])
    setUsers(u.data || [])
    setStats({
      reports: r.data?.length || 0,
      topics: t.data?.length || 0,
      users: u.data?.length || 0,
      comments: cm.count || 0,
    })
    setLoading(false)
  }

  const deleteTopic = async (id) => {
    if (!window.confirm('Hapus topik ini?')) return
    await supabase.from('topics').delete().eq('id', id)
    toast.success('Topik dihapus')
    setTopics(prev => prev.filter(t => t.id !== id))
  }

  const deleteComment = async (id) => {
    if (!window.confirm('Hapus komentar ini?')) return
    await supabase.from('comments').delete().eq('id', id)
    toast.success('Komentar dihapus')
  }

  const updateReport = async (id, status) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    toast.success(status === 'reviewed' ? 'Laporan ditandai selesai' : 'Laporan diabaikan')
  }

  const dismissReportAndDelete = async (report) => {
    if (!window.confirm('Hapus konten yang dilaporkan?')) return
    if (report.topic_id) await supabase.from('topics').delete().eq('id', report.topic_id)
    if (report.comment_id) await supabase.from('comments').delete().eq('id', report.comment_id)
    await supabase.from('reports').update({ status: 'reviewed' }).eq('id', report.id)
    toast.success('Konten dihapus & laporan diselesaikan')
    fetchAll()
  }

  const toggleAdmin = async (userId, current) => {
    await supabase.from('users').update({ is_admin: !current }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !current } : u))
    toast.success(!current ? 'User dijadikan admin' : 'Akses admin dicabut')
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  const pendingReports = reports.filter(r => r.status === 'pending')

  return (
    <div className="admin-page fade-in">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">🧹 Admin Panel</h1>
        <p className="admin-sub">Moderasi konten Ruang Kritik</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { icon: <FiAlertTriangle />, label: 'Laporan Pending', value: pendingReports.length, color: '#ef4444' },
          { icon: <FiFileText />,      label: 'Total Topik',     value: stats.topics,           color: '#2563eb' },
          { icon: <FiMessageCircle />, label: 'Total Komentar',  value: stats.comments,         color: '#6366f1' },
          { icon: <FiUsers />,         label: 'Total User',      value: stats.users,            color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div className="admin-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { key: 'reports', label: `🚫 Laporan (${pendingReports.length})` },
          { key: 'topics',  label: `📝 Topik` },
          { key: 'users',   label: `👥 Pengguna` },
        ].map(t => (
          <button key={t.key} className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Reports Tab ── */}
      {tab === 'reports' && (
        <div className="admin-list">
          {reports.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><p className="empty-text">Tidak ada laporan</p></div>
          ) : reports.map(r => (
            <div key={r.id} className={`admin-card${r.status !== 'pending' ? ' reviewed' : ''}`}>
              <div className="admin-card-top">
                <span className={`report-status ${r.status}`}>{r.status}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
              <p className="admin-card-meta">
                <strong>Pelapor:</strong> @{r.users?.username || '?'} &nbsp;|&nbsp;
                <strong>Alasan:</strong> {r.reason}
              </p>
              {r.topics && <p className="admin-card-content">📝 Topik: <em>"{r.topics.title}"</em></p>}
              {r.comments && <p className="admin-card-content">💬 Komentar: <em>"{r.comments.content?.slice(0,80)}..."</em></p>}
              {r.status === 'pending' && (
                <div className="admin-card-actions">
                  <button className="admin-btn danger" onClick={() => dismissReportAndDelete(r)}>
                    <FiTrash2 /> Hapus Konten
                  </button>
                  <button className="admin-btn success" onClick={() => updateReport(r.id, 'reviewed')}>
                    <FiCheck /> Abaikan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Topics Tab ── */}
      {tab === 'topics' && (
        <div className="admin-list">
          {topics.map(t => (
            <div key={t.id} className="admin-card">
              <div className="admin-card-top">
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>#{t.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
              <p className="admin-card-content" style={{ fontWeight: 700, color: 'var(--text)' }}>{t.title}</p>
              <p className="admin-card-meta">oleh @{t.users?.username || '?'}</p>
              <div className="admin-card-actions">
                <button className="admin-btn danger" onClick={() => deleteTopic(t.id)}>
                  <FiTrash2 /> Hapus Topik
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Users Tab ── */}
      {tab === 'users' && (
        <div className="admin-list">
          {users.map(u => (
            <div key={u.id} className="admin-card">
              <div className="admin-card-top">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  @{u.username || '—'}
                  {u.is_admin && <span className="admin-badge">ADMIN</span>}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</span>
              </div>
              <p className="admin-card-meta">{u.full_name || 'Tanpa nama'}</p>
              {u.id !== user?.id && (
                <div className="admin-card-actions">
                  <button
                    className={`admin-btn ${u.is_admin ? 'danger' : 'success'}`}
                    onClick={() => toggleAdmin(u.id, u.is_admin)}
                  >
                    {u.is_admin ? <><FiX /> Cabut Admin</> : <><FiCheck /> Jadikan Admin</>}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
