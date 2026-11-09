'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateCommentAction } from '@/lib/actions'
import { applyLocalChanges } from '@/store/comments-store'
import { useCommentsStore, useStoreHydrated } from '@/store/provider'
import type { Comment } from '@/types/comment'
import { CommentForm } from './comment-form'
import { DetailSkeleton } from './skeletons'

/**
 * Страница /comments/[id]/edit. Комментарий приходит с сервера (или из store, если создан локально),
 * поверх накладываются локальные изменения — форма открывается с актуальным текстом.
 */
export function EditCommentForm({ id, initial }: { id: number; initial: Comment | null }) {
  const router = useRouter()
  const created = useCommentsStore((s) => s.created)
  const updated = useCommentsStore((s) => s.updated)
  const deleted = useCommentsStore((s) => s.deleted)
  const applyChanges = useCommentsStore((s) => s.applyChanges)
  const showToast = useCommentsStore((s) => s.showToast)
  const hydrated = useStoreHydrated()

  const base = initial ?? created.find((c) => c.id === id) ?? null
  const [comment] = base ? applyLocalChanges([base], { updated, deleted }) : []

  if (!hydrated) return <DetailSkeleton />
  if (!comment) {
    return (
      <div role="alert" className="alert alert-warning alert-soft">
        <span>Комментарий #{id} не найден или удалён.</span>
        <Link href="/" className="btn btn-sm">
          К списку
        </Link>
      </div>
    )
  }

  return (
    <CommentForm
      // key: после загрузки локальных изменений форма заполняется заново
      key={`${comment.body}-${comment.postId}`}
      defaultValues={{ body: comment.body, postId: comment.postId }}
      submitLabel="Сохранить"
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        const result = await updateCommentAction(id, values)
        if (result.ok) {
          applyChanges(id, result.data)
          showToast('success', `Комментарий #${id} сохранён`)
          router.push(`/comments/${id}`)
        }
        return result
      }}
    />
  )
}
