import { memo, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Comment } from '../types/comment'
import { UserAvatar } from './UserAvatar'

interface CommentItemProps {
  comment: Comment
  onLike: (id: number) => void
  onUpdate: (id: number, changes: Partial<Pick<Comment, 'body' | 'postId'>>) => void
  onRequestDelete: (comment: Comment) => void
}

/**
 * Один комментарий. Имеет собственное локальное состояние — режим редактирования.
 * memo: компонент перерисуется, только если изменились его props.
 */
export const CommentItem = memo(function CommentItem({ comment, onLike, onUpdate, onRequestDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftBody, setDraftBody] = useState(comment.body)
  const [draftPostId, setDraftPostId] = useState(comment.postId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Когда включается режим редактирования — ставим фокус в поле
  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  const startEditing = () => {
    setDraftBody(comment.body)
    setDraftPostId(comment.postId)
    setIsEditing(true)
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    const body = draftBody.trim()
    if (!body) return
    onUpdate(comment.id, { body, postId: draftPostId })
    setIsEditing(false)
  }

  return (
    <li className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={comment.user} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{comment.user.fullName}</div>
            <div className="text-xs text-base-content/60">
              @{comment.user.username} · #{comment.id}
            </div>
          </div>
          <span className="badge badge-outline">Пост #{comment.postId}</span>
        </div>

        {/* Условный рендеринг: форма редактирования или текст */}
        {isEditing ? (
          <form onSubmit={save} className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              className="textarea w-full"
              rows={3}
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
              maxLength={500}
            />
            <div className="flex flex-wrap gap-2 items-center">
              <label className="input input-sm w-32">
                <span className="label">postId</span>
                <input
                  type="number"
                  min={1}
                  value={draftPostId}
                  onChange={(e) => setDraftPostId(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <div className="flex-1" />
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setIsEditing(false)}>
                Отмена
              </button>
              <button type="submit" className="btn btn-sm btn-success" disabled={!draftBody.trim()}>
                Сохранить
              </button>
            </div>
          </form>
        ) : (
          <p className="break-words">{comment.body}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button className="btn btn-sm btn-ghost" onClick={() => onLike(comment.id)} aria-label="Лайк">
              <span className="text-error">♥</span> {comment.likes}
            </button>
            <div className="flex-1" />
            <button className="btn btn-sm btn-ghost" onClick={startEditing}>
              Изменить
            </button>
            <button className="btn btn-sm btn-ghost text-error" onClick={() => onRequestDelete(comment)}>
              Удалить
            </button>
          </div>
        )}
      </div>
    </li>
  )
})
