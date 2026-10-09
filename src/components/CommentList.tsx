import type { Comment } from '../types/comment'
import { CommentItem } from './CommentItem'

interface CommentListProps {
  comments: Comment[]
  onLike: (id: number) => void
  onUpdate: (id: number, changes: Partial<Pick<Comment, 'body' | 'postId'>>) => void
  onRequestDelete: (comment: Comment) => void
}

export function CommentList({ comments, onLike, onUpdate, onRequestDelete }: CommentListProps) {
  // Условный рендеринг: пустое состояние
  if (comments.length === 0) {
    return <div className="text-center py-10 text-base-content/60">Комментариев не найдено</div>
  }

  return (
    <ul className="flex flex-col gap-3">
      {/* key = стабильный id из данных, а не индекс массива */}
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={onLike}
          onUpdate={onUpdate}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </ul>
  )
}
