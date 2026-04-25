import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiThumbsUp, FiMessageCircle } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import ReportButton from './ReportButton'

export default function TopicCard({ topic }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [likes, setLikes] = useState(topic.likes_count || 0)
  const [liked, setLiked] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: id })
  const initials = topic.users?.username?.[0]?.toUpperCase() || 'A'
  const thumb = topic.images?.[0]?.url

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    const newLikes = liked ? likes - 1 : likes + 1
    setLiked(!liked)
    setLikes(newLikes)
    await supabase.from('topics').update({ likes_count: newLikes }).eq('id', topic.id)
  }

  return (
    <article className="topic-card" onClick={() => navigate(`/topic/${topic.id}`)}>
      <div className="topic-card-header">
        <div className="avatar">{initials}</div>
        <div className="topic-meta">
          <div className="topic-username">{topic.users?.username || 'anonim'}</div>
          <div className="topic-time">• {timeAgo}</div>
        </div>
        {topic.category && <span className="category-badge">{topic.category}</span>}
      </div>

      <div className="topic-card-body">
        <div className="topic-card-text">
          <h2 className="topic-title">{topic.title}</h2>
          <p className="topic-preview">{topic.content}</p>
        </div>
        {thumb && <img src={thumb} alt="" className="topic-thumb" />}
      </div>

      <div className="topic-stats">
        <button className={`stat-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
          <FiThumbsUp /> {likes}
        </button>
        <button className="stat-btn" onClick={e => { e.stopPropagation(); navigate(`/topic/${topic.id}`) }}>
          <FiMessageCircle /> {topic.comments_count || 0}
        </button>
        {/* Report button */}
        <div style={{ marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
          <ReportButton topicId={topic.id} />
        </div>
      </div>
    </article>
  )
}
