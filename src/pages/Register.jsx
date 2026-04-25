import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiMail, FiEdit3 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const HERO_REG = '/kritik/silen.jpg'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.username) {
      toast.error('Email, username, dan password wajib diisi!'); return
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter!'); return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Akun berhasil dibuat! Cek email untuk verifikasi.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-hero-img" style={{ height: '32vh' }}>
        <img src={HERO_REG} alt="Ruang Kritik" />
        <div className="auth-hero-gradient" />
      </div>

      <div className="auth-panel" style={{ paddingTop: 20 }}>
        {/* Brand — tanpa emoji */}
        <div className="auth-brand slide-up" style={{ animationDelay: '0.1s' }}>

          <span className="auth-brand-name"></span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field slide-up" style={{ animationDelay: '0.15s' }}>
            <input id="reg-fullname" type="text" placeholder=" " value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <label>Nama Lengkap</label>
            <FiEdit3 className="field-icon" />
          </div>

          <div className="auth-field slide-up" style={{ animationDelay: '0.2s' }}>
            <input id="reg-username" type="text" placeholder=" " required value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} />
            <label>Username</label>
            <FiUser className="field-icon" />
          </div>

          <div className="auth-field slide-up" style={{ animationDelay: '0.25s' }}>
            <input id="reg-email" type="email" placeholder=" " required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
            <label>Email</label>
            <FiMail className="field-icon" />
          </div>

          <div className="auth-field slide-up" style={{ animationDelay: '0.3s' }}>
            <input id="reg-password" type="password" placeholder=" " required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
            <label>Password (min. 6 karakter)</label>
            <FiLock className="field-icon" />
          </div>

          <button id="btn-register-submit" className="auth-btn slide-up" type="submit"
            disabled={loading} style={{ animationDelay: '0.35s' }}>
            {loading ? 'Mendaftar...' : 'Buat Akun'}
          </button>

          <p className="auth-switch slide-up" style={{ animationDelay: '0.4s' }}>
            Sudah punya akun? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
