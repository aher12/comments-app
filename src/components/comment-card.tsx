'use client'

import Link from 'next/link'
import { memo } from 'react'
import { useCommentMutations } from '@/hooks/use-comment-mutations'
import { isLocalId } from '@/lib/constants'
import { can } from '@/lib/permissions'
import { useCommentsStore } from '@/store/provider'
import type { Comment, Viewer } from '@/types/comment'
import { UserAvatar } from './user-avatar'

const PENDING_LABEL = { update: 'Сохранение…', delete: 'Удаление…', like: 'Отправка…' } as const

interface CommentCardProps {
  comment: Comment
  /** Текущий пользователь (null — аноним). По его роли решаем, какие действия показать */
  viewer: Viewer | null
  detailed?: boolean
}

/**
 * Карточка комментария. Недоступные действия не показываются вовсе:
 * аноним только читает, пользователь может лайкать и изменять, администратор — ещё и удалять.
 * Сервер всё равно перепроверяет права в каждой Server Function.
 */
export const CommentCard = memo(function CommentCard({ comment, viewer, detailed = false }: CommentCardProps) {
  const pending = useCommentsStore((s) => s.pending[comment.id])
  const requestDelete = useCommentsStore((s) => s.requestDelete)
  const { like } = useCommentMutations()

  const canUpdate = can(viewer, 'comment:update')
  const canDelete = can(viewer, 'comment:delete')

  return (
    <li className={`card bg-base-100 shadow-sm transition-opacity ${pending === 'delete' ? 'opacity-50' : ''}`}>
      <article className={`card-body gap-3 ${detailed ? 'p-6' : 'p-4'}`} aria-label={`Комментарий #${comment.id}`}>
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

        <p className={`break-words ${detailed ? 'text-lg' : ''}`}>{comment.body}</p>

        <div className="flex items-center gap-1">
          {canUpdate ? (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => like(comment)}
              disabled={pending === 'like' || pending === 'delete'}
              aria-label={`Нравится, сейчас ${comment.likes}`}
            >
              <span className="text-error">♥</span> {comment.likes}
            </button>
          ) : (
            <span className="px-3 text-sm" title="Войдите, чтобы ставить лайки">
              <span className="text-error">♥</span> {comment.likes}
            </span>
          )}
          {!detailed && (
            <Link href={`/comments/${comment.id}`} className="btn btn-sm btn-ghost">
              Открыть
            </Link>
          )}
          <div className="flex-1" />
          {canUpdate && (
            <Link
              href={`/comments/${comment.id}/edit`}
              className={`btn btn-sm btn-ghost ${pending ? 'btn-disabled' : ''}`}
              aria-disabled={pending !== undefined}
            >
              Изменить
            </Link>
          )}
          {canDelete && (
            <button className="btn btn-sm btn-ghost text-error" onClick={() => requestDelete(comment)} disabled={pending !== undefined}>
              Удалить
            </button>
          )}
        </div>
      </article>
    </li>
  )
})
