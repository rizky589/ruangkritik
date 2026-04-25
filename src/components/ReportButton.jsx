import { useState } from 'react'
import { FiFlag } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const REASONS = [
  'Spam / Promosi',
  'Fitnah / Hoaks',
  'Kata kasar / Toxic',
  'SARA / Hate Speech',
  'Konten tidak pantas',
  'Lainnya',
]

export default function ReportButton({ topicId, commentId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReport = async () => {
    if (!user) { navigate('/login'); return }
    if (!reason) { toast.error('Pilih alasan laporan!'); return }
    setLoading(true)
    try {
      const payload = {
        reporter_id: user.id,
        reason,
        status: 'pending',
        ...(topicId   ? { topic_id: topicId }     : {}),
        ...(commentId ? { comment_id: commentId }  : {}),
      }
      const { error } = await supabase.from('reports').insert(payload)
      if (error) throw error
      toast.success('Laporan berhasil dikirim. Tim kami akan meninjau.')
      setOpen(false)
      setReason('')
    } catch {
      toast.error('Gagal mengirim laporan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="report-btn"
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        title="Laporkan konten ini"
      >
        <FiFlag size={13} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 299 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="report-dropdown" onClick={e => e.stopPropagation()}>
            <p className="report-title">🚫 Laporkan Konten</p>
            <div className="report-reasons">
              {REASONS.map(r => (
                <label key={r} className="report-reason">
                  <input
                    type="radio" name="report-reason" value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <button
              className="report-submit"
              onClick={handleReport}
              disabled={loading || !reason}
            >
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
