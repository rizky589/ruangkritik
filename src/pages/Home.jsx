import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TopicCard from '../components/TopicCard'

const TAGS = ['#Semua', '#Infrastruktur', '#Pendidikan', '#Kesehatan', '#Hukum', '#Ekonomi', '#Sosial', '#BPS', 'PPPK']

// Pakai gambar hooded figure dengan tanda X merah
const HERO_BG = '/kritik/diam.jpg'

export default function Home() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('#Semua')
  const [infoOpen, setInfoOpen] = useState(false)
  const q = searchParams.get('q') || ''

  useEffect(() => { fetchTopics() }, [activeTag, q])

  const fetchTopics = async () => {
    setLoading(true)
    let query = supabase
      .from('topics')
      .select('*, users(username, avatar_url), images(url)')
      .order('created_at', { ascending: false })
    if (activeTag !== '#Semua') query = query.eq('category', activeTag.replace('#', ''))
    if (q) query = query.ilike('title', `%${q}%`)
    const { data } = await query
    setTopics(data || [])
    setLoading(false)
  }

  return (
    <div className="fade-in">
      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        <img src={HERO_BG} alt="Ruang Kritik — Suarakan Pendapatmu" />
        <div className="hero-overlay" />
        {/* Teks di atas gambar */}
        <div className="hero-text">

        </div>
        <div className="hero-cta">
          <Link to={user ? '/create-topic' : '/login'} className="btn-primary">
            <FiPlus /> Buat Topik Baru
          </Link>
        </div>
      </div>

      {/* ── Trending Tags ── */}
      <div className="trending-section">
        <div className="section-title">Trending</div>
        <div className="tags-row">
          {TAGS.map(tag => (
            <button
              key={tag}
              className={`tag-pill${activeTag === tag ? ' active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── Topic List ── */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Memuat topik...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <p className="empty-text">
            {q ? `Tidak ada topik untuk "${q}"` : 'Belum ada topik. Jadilah yang pertama!'}
          </p>
          <Link to={user ? '/create-topic' : '/login'}
            className="btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: 8 }}>
            <FiPlus /> Buat Topik
          </Link>
        </div>
      ) : (
        <div className="topic-list">
          {topics.map((topic, i) => (
            <div key={topic.id}>
              <TopicCard topic={topic} />
              {i < topics.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 16 }} />

      {/* ── Info Box ── */}
      <div className="info-box">
        <div className="info-box-header" onClick={() => setInfoOpen(!infoOpen)}>
          <span className="info-box-title">📋 Aturan Komunitas</span>
          {infoOpen
            ? <FiChevronUp size={16} color="var(--text-muted)" />
            : <FiChevronDown size={16} color="var(--text-muted)" />}
        </div>
        {infoOpen && (
          <div className="info-box-body">
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 6 }}>Ruang Kritik</strong>
            adalah platform diskusi terbuka untuk menyampaikan kritik dan aspirasi kepada pemerintah
            dan masyarakat. Sampaikan pendapatmu dengan santun, berbasis fakta, dan bertanggung jawab.
            Dilarang menyebarkan SARA, hoaks, dan ujaran kebencian.
            "Ketakutan adalah bentuk pembiaran pada penindasan"
          </div>
        )}
      </div>
    </div>
  )
}
