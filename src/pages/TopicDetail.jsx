import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiThumbsUp, FiMessageCircle, FiShare2, FiArrowLeft, FiCamera } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CommentCard from '../components/CommentCard'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function TopicDetail() {
  const { id: topicId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [topic, setTopic] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const fileRef = useRef()

  useEffect(() => { fetchTopic() }, [topicId])

  const fetchTopic = async () => {
    setLoading(true)
    const { data: t } = await supabase
      .from('topics')
      .select('*, users(username, avatar_url), images(url)')
      .eq('id', topicId)
      .single()

    const { data: c } = await supabase
      .from('comments')
      .select('*, users(username, avatar_url), images(url)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })

    setTopic(t)
    setLikes(t?.likes_count || 0)
    setComments(c || [])
    setLoading(false)
  }

  const handleLike = async () => {
    if (!user) { navigate('/login'); return }
    const newLikes = liked ? likes - 1 : likes + 1
    setLiked(!liked); setLikes(newLikes)
    await supabase.from('topics').update({ likes_count: newLikes }).eq('id', topicId)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link disalin!')
  }

  const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleSendComment = async () => {
    if (!user) { navigate('/login'); return }
    if (!commentText.trim() && !imgFile) return
    setSending(true)
    try {
      let imageUrl = null
      // Upload image if attached
      if (imgFile) {
        const ext = imgFile.name.split('.').pop()
        const path = `comments/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('images').upload(path, imgFile)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }

      // Insert comment
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({ topic_id: topicId, user_id: user.id, content: commentText.trim() || null })
        .select('*, users(username, avatar_url)')
        .single()
      if (error) throw error

      // Insert image record if any
      if (imageUrl) {
        await supabase.from('images').insert({ comment_id: newComment.id, user_id: user.id, url: imageUrl })
        newComment.images = [{ url: imageUrl }]
      } else {
        newComment.images = []
      }

      // Update comments count
      await supabase.from('topics').update({ comments_count: comments.length + 1 }).eq('id', topicId)

      setComments(prev => [...prev, newComment])
      setCommentText('')
      setImgFile(null)
      setImgPreview(null)
    } catch (err) {
      toast.error('Gagal mengirim komentar')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Memuat...</p></div>
  if (!topic) return <div className="empty-state"><div className="empty-icon">😕</div><p className="empty-text">Topik tidak ditemukan</p></div>

  const timeAgo = formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: id })
  const initials = topic.users?.username?.[0]?.toUpperCase() || 'A'
  const thumb = topic.images?.[0]?.url

  return (
    <div className="detail-container fade-in">
      {/* Back */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-back" onClick={() => navigate(-1)}><FiArrowLeft /></button>
        <span style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 600 }}>Topik</span>
      </div>

      {/* Header */}
      <h1 className="detail-title">{topic.title}</h1>
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar">{initials}</div>
          <div className="topic-meta">
            <div className="topic-username">{topic.users?.username || 'anonim'}</div>
            <div className="topic-time">• {timeAgo}</div>
          </div>
          {topic.category && <span className="category-badge">{topic.category}</span>}
        </div>
      </div>

      {/* Image */}
      {thumb && <img src={thumb} alt={topic.title} className="detail-image" />}

      {/* Body */}
      <div className="detail-body">{topic.content}</div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className={`action-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
          <FiThumbsUp /> {likes}
        </button>
        <button className="action-btn">
          <FiMessageCircle /> {comments.length} komentar
        </button>
        <button className="action-btn share" onClick={handleShare} style={{ marginLeft: 'auto' }}>
          <FiShare2 />
        </button>
      </div>

      {/* Comment Input */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="comment-input-wrap">
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {profile?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <input
            className="comment-input"
            placeholder="Tulis komentar..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
          />
          <button className="btn-img-attach" onClick={() => fileRef.current.click()} title="Lampirkan gambar">
            <FiCamera />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgChange} />
          <button className="btn-send" onClick={handleSendComment} disabled={sending || (!commentText.trim() && !imgFile)}>
            {sending ? '...' : 'Kirim'}
          </button>
        </div>
        {imgPreview && (
          <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={imgPreview} alt="preview" style={{ height: 60, borderRadius: 8, objectFit: 'cover' }} />
            <button onClick={() => { setImgFile(null); setImgPreview(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}>
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-icon">💬</div>
            <p className="empty-text">Jadilah yang pertama berkomentar!</p>
          </div>
        ) : (
          comments.map(c => <CommentCard key={c.id} comment={c} />)
        )}
      </div>
    </div>
  )
}
