import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUploadCloud, FiX } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { filterContent, validateContent } from '../lib/wordFilter'
import toast from 'react-hot-toast'

const CATEGORIES = ['Infrastruktur', 'Pendidikan', 'Kesehatan', 'Hukum', 'Ekonomi', 'Sosial', 'Lainnya', 'BPS', 'PPPK', 'MBG']

export default function CreateTopic() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', category: '' })
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Hanya file gambar!'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran maks. 5MB'); return }
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validasi & filter kata kasar
      validateContent(form.title, 'Judul')
      validateContent(form.content, 'Isi topik')
    } catch (err) {
      toast.error(err.message); return
    }

    setLoading(true)
    try {
      // Filter kata kasar sebelum simpan
      const cleanTitle = filterContent(form.title.trim())
      const cleanContent = filterContent(form.content.trim())

      const { data: topic, error } = await supabase
        .from('topics')
        .insert({
          user_id: user.id,
          title: cleanTitle,
          content: cleanContent,
          category: form.category || 'Lainnya',
          likes_count: 0,
          comments_count: 0,
        })
        .select().single()
      if (error) throw error

      if (imgFile) {
        const ext = imgFile.name.split('.').pop()
        const path = `topics/${topic.id}.${ext}`
        const { error: upErr } = await supabase.storage.from('images').upload(path, imgFile)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
        await supabase.from('images').insert({ topic_id: topic.id, user_id: user.id, url: urlData.publicUrl })
      }

      toast.success('Topik berhasil dipublikasikan!')
      navigate(`/topic/${topic.id}`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat topik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page fade-in">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}><FiArrowLeft /></button>
        <h1 className="page-title">Buat Topik Baru</h1>
      </div>

      {/* Peringatan moderasi */}
      <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
        🤖 <strong style={{ color: 'var(--text)' }}>Moderasi Otomatis:</strong> Konten akan difilter. Kata kasar, SARA, dan ujaran kebencian dilarang.
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        {imgPreview ? (
          <div className="preview-img-wrap">
            <img src={imgPreview} alt="preview" className="preview-img" />
            <button type="button" className="remove-img" onClick={() => { setImgFile(null); setImgPreview(null) }}><FiX /></button>
          </div>
        ) : (
          <div className={`upload-area${dragging ? ' dragging' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}>
            <FiUploadCloud className="upload-icon" />
            <p className="upload-text"><strong>Klik atau seret gambar</strong><br />PNG, JPG — maks. 5MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select id="topic-category" className="category-select" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">-- Pilih Kategori --</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Judul Topik</label>
          <input id="topic-title" className="form-input" type="text"
            placeholder="Tulis judul yang jelas dan singkat..."
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={120} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{form.title.length}/120</span>
        </div>

        <div className="form-group">
          <label className="form-label">Isi Topik / Kritik</label>
          <textarea id="topic-content" className="form-textarea"
            placeholder="Sampaikan kritik atau aspirasimu secara jelas, sopan, dan bertanggung jawab..."
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} />
        </div>

        <button id="btn-submit-topic" className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Mempublikasikan...' : 'Publikasikan Topik'}
        </button>
      </form>
    </div>
  )
}
