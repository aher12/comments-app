'use client'

import Link from 'next/link'
import { memo, useState, type FormEvent } from 'react'
import { useCommentMutations } from '@/hooks/use-comment-mutations'
import { BODY_MAX_LENGTH, isLocalId } from '@/lib/constants'
import { useCommentsStore } from '@/store/provider'
import type { Comment } from '@/types/comment'
import { UserAvatar } from './user-avatar'

const PENDING_LABEL = { update: 'Сохранение…', delete: 'Удаление…', like: 'Отправка…' } as const

/**
 * Карточка комментария — Client Component: у неё есть локальное состояние (режим
 * редактирования) и обработчики событий. memo — перерисовка только при изменении props.
 */
export const CommentCard = memo(function CommentCard({ comment, detailed = false }: { comment: Comment; detailed?: boolean }) {
  const pending = useCommentsStore((s) => s.pending[comment.id])
  const requestDelete = useCommentsStore((s) => s.requestDelete)
  const { update, like } = useCommentMutations()

  const [isEditing, setIsEditing] = useState(false)
  const [draftBody, setDraftBody] = useState(comment.body)
  const [draftPostId, setDraftPostId] = useState(comment.postId)

  const startEditing = () => {
    setDraftBody(comment.body)
    setDraftPostId(comment.postId)
    setIsEditing(true)
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    const body = draftBody.trim()
    if (!body) return
    setIsEditing(false)
    // Optimistic update: новый текст виден сразу, при ошибке store откатит изменения
    void update(comment, { body, postId: draftPostId }, `Комментарий #${comment.id} сохранён`)
  }

  return (
    <li className={`card bg-base-100 shadow-sm transition-opacity ${pending === 'delete' ? 'opacity-50' : ''}`}>
      <div className={`card-body gap-3 ${detailed ? 'p-6' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <UserAvatar user={comment.user} size={detailed ? 'lg' : 'md'} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{comment.user.fullName}</div>
            <div className="text-xs text-base-content/60">
              @{comment.user.username} · #{comment.id}
            </div>
          </div>
          {isLocalId(comment.id) && <span className="badge badge-accent badge-soft">локальный</span>}
          {pending && (
            <span className="badge badge-ghost gap-1">
              <span className="loading loading-spinner loading-xs" />
              {PENDING_LABEL[pending]}
            </span>
          )}
          <Link href={`/?postId=${comment.postId}`} className="badge badge-outline hover:badge-primary">
            Пост #{comment.postId}
          </Link>
        </div>

        {isEditing ? (
          <form onSubmit={save} className="flex flex-col gap-2">
            <textarea
              autoFocus
              className="textarea w-full"
              rows={3}
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
              maxLength={BODY_MAX_LENGTH}
              aria-label="Текст комментария"
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
          <p className={`break-words ${detailed ? 'text-lg' : ''}`}>{comment.body}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => like(comment)}
              disabled={pending === 'like' || pending === 'delete'}
              aria-label="Лайк"
            >
              <span className="text-error">♥</span> {comment.likes}
            </button>
            {!detailed && (
              <Link href={`/comments/${comment.id}`} className="btn btn-sm btn-ghost">
                Открыть
              </Link>
            )}
            <div className="flex-1" />
            <button className="btn btn-sm btn-ghost" onClick={startEditing} disabled={pending !== undefined}>
              Изменить
            </button>
            <button
              className="btn btn-sm btn-ghost text-error"
              onClick={() => requestDelete(comment)}
              disabled={pending !== undefined}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    </li>
  )
})
