'use client'

import Link from 'next/link'
import { applyLocalChanges } from '@/store/comments-store'
import { useCommentsStore, useStoreHydrated } from '@/store/provider'
import type { Comment } from '@/types/comment'
import { CommentCard } from './comment-card'
import { DetailSkeleton } from './skeletons'

/**
 * Клиентская часть страницы записи: накладывает локальные изменения из store
 * на комментарий, загруженный сервером (или берёт локально созданный).
 */
export function CommentDetail({ id, initial }: { id: number; initial: Comment | null }) {
  const created = useCommentsStore((s) => s.created)
  const updated = useCommentsStore((s) => s.updated)
  const deleted = useCommentsStore((s) => s.deleted)
  const hydrated = useStoreHydrated()

  const base = initial ?? created.find((c) => c.id === id) ?? null
  const [comment] = base ? applyLocalChanges([base], { updated, deleted }) : []

  if (deleted.includes(id)) {
    return (
      <div role="alert" className="alert alert-info alert-soft">
        <span>Комментарий #{id} удалён.</span>
        <Link href="/" className="btn btn-sm">
          К списку
        </Link>
      </div>
    )
  }

  if (!comment) {
    // Локальные комментарии появляются в store только после чтения localStorage
    if (!hydrated) return <DetailSkeleton />
    return (
      <div className="card bg-base-100 border border-dashed border-base-300">
        <div className="card-body items-center text-center">
          <h2 className="font-semibold">Комментарий #{id} не найден</h2>
          <p className="text-base-content/60">Возможно, он был создан в другом браузере или локальные изменения сброшены.</p>
          <Link href="/" className="btn btn-sm">
            К списку
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ul>
      <CommentCard comment={comment} detailed />
    </ul>
  )
}
