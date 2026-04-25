import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const HERO_LOGIN = '/silen.jpg'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Isi semua field!'); return }
    setLoading(true)
    try {
      await login(form)
      toast.success('Berhasil masuk!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      {/* Hero Image */}
      <div className="auth-hero-img">
        <img src={HERO_LOGIN} alt="Ruang Kritik" />
        <div className="auth-hero-gradient" />
      </div>

      {/* Form Panel */}
      <div className="auth-panel">
        {/* Brand — tanpa icon emoji */}
        <div className="auth-brand slide-up" style={{ animationDelay: '0.1s' }}>

          <span className="auth-brand-name"></span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field slide-up" style={{ animationDelay: '0.2s' }}>
            <input id="login-email" type="email" placeholder=" " required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label>Email</label>
            <FiUser className="field-icon" />
          </div>

          <div className="auth-field slide-up" style={{ animationDelay: '0.3s' }}>
            <input id="login-password" type="password" placeholder=" " required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <label>Password</label>
            <FiLock className="field-icon" />
          </div>

          <button id="btn-login-submit" className="auth-btn slide-up" type="submit"
            disabled={loading} style={{ animationDelay: '0.4s' }}>
            {loading ? 'Masuk...' : 'Login'}
          </button>

          <p className="auth-switch slide-up" style={{ animationDelay: '0.5s' }}>
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </form>

        <div className="auth-lang slide-up" style={{ animationDelay: '0.6s' }}>

        </div>
      </div>
    </div>
  )
}
