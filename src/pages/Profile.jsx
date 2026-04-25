import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiEdit2, FiFileText } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TopicCard from '../components/TopicCard'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState({ topics: 0, comments: 0, likes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    const { data: t } = await supabase
      .from('topics')
      .select('*, users(username, avatar_url), images(url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const { count: commentCount } = await supabase
      .from('comments').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const totalLikes = (t || []).reduce((sum, tp) => sum + (tp.likes_count || 0), 0)

    setTopics(t || [])
    setStats({ topics: t?.length || 0, comments: commentCount || 0, likes: totalLikes })
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar')
    navigate('/')
  }

  const initials = profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || '?'

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <div className="avatar-lg">{initials}</div>
        <p className="profile-name">{profile?.full_name || profile?.username || 'Pengguna'}</p>
        <p className="profile-email">@{profile?.username || '—'}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</p>

        <div className="profile-stats">
          <div className="p-stat">
            <strong>{stats.topics}</strong>
            <span>Topik</span>
          </div>
          <div className="p-stat">
            <strong>{stats.comments}</strong>
            <span>Komentar</span>
          </div>
          <div className="p-stat">
            <strong>{stats.likes}</strong>
            <span>Suka diterima</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-secondary" style={{ flex: 1 }}>
            <FiEdit2 size={14} /> Edit Profil
          </button>
          <button className="btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={handleLogout}>
            <FiLogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      {/* My Topics */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiFileText color="var(--accent)" />
        <span className="section-title" style={{ margin: 0 }}>Topik Saya</span>
      </div>
      <div className="divider" />

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : topics.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-text">Belum ada topik. Mulai buat topikmu!</p>
        </div>
      ) : (
        <div className="topic-list">
          {topics.map((t, i) => (
            <div key={t.id}>
              <TopicCard topic={t} />
              {i < topics.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
