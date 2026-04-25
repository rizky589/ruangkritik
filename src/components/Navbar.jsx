import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiSearch, FiMenu, FiX, FiBell, FiShield } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  const initials = profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || '?'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">

          Diam Bukan Solusi
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              {profile?.is_admin && (
                <Link to="/admin" title="Admin Panel">
                  <button className="btn-icon" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <FiShield />
                  </button>
                </Link>
              )}
              <button className="btn-icon" title="Notifikasi"><FiBell /></button>
              <Link to="/profile">
                <div className="user-avatar-sm">{initials}</div>
              </Link>
              <button className="btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FiX /> : <FiMenu />}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <FiSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Cari topik, kritik, aspirasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/?q=${search}`)}
          />
        </div>
      </div>

      {/* Dropdown */}
      {menuOpen && user && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '8px', minWidth: '180px',
          zIndex: 200, boxShadow: 'var(--shadow-lg)',
        }}>
          {[
            { to: '/profile', label: '👤 Profil Saya' },
            { to: '/create-topic', label: '✏️ Buat Topik' },
            ...(profile?.is_admin ? [{ to: '/admin', label: '🛡️ Admin Panel' }] : []),
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {item.label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
          <button onClick={handleLogout}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            🚪 Keluar
          </button>
        </div>
      )}
    </nav>
  )
}
