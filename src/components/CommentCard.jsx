import { useState } from 'react'
import { FiThumbsUp } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import ReportButton from './ReportButton'

export default function CommentCard({ comment }) {
  const [likes, setLikes] = useState(comment.likes_count || 0)
  const [liked, setLiked] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })
  const initials = comment.users?.username?.[0]?.toUpperCase() || 'A'

  return (
    <div className="comment-card">
      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials}</div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-user">{comment.users?.username || 'anonim'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="comment-time">{timeAgo}</span>
            <ReportButton commentId={comment.id} />
          </div>
        </div>
        <p className="comment-text">{comment.content}</p>
        {comment.images?.[0]?.url && (
          <img src={comment.images[0].url} alt="" className="comment-image" />
        )}
        <div className="comment-stats">
          <button
            className={`stat-btn${liked ? ' liked' : ''}`}
            onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1) }}
            style={{ fontSize: 12 }}
          >
            <FiThumbsUp size={12} /> {likes}
          </button>
        </div>
      </div>
    </div>
  )
}
