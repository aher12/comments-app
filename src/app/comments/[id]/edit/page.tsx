import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AccessDenied } from '@/components/access-denied'
import { EditCommentForm } from '@/components/edit-comment-form'
import { FormSkeleton } from '@/components/skeletons'
import { getComment } from '@/lib/comments-api'
import { isLocalId } from '@/lib/constants'
import { requireViewer } from '@/lib/dal'
import { can } from '@/lib/permissions'
import { parsePositiveInt } from '@/lib/schemas'

export const metadata: Metadata = { title: 'Изменение комментария' }

/** Страница изменения /comments/[id]/edit — только для вошедших пользователей */
export default function EditCommentPage({ params }: PageProps<'/comments/[id]/edit'>) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Suspense fallback={<div className="skeleton h-5 w-64" />}>
        {params.then(({ id }) => (
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/">Комментарии</Link>
              </li>
              <li>
                <Link href={`/comments/${id}`}>Комментарий #{id}</Link>
              </li>
              <li>Изменение</li>
            </ul>
          </div>
        ))}
      </Suspense>
      <h1 className="text-3xl font-bold">Изменение комментария</h1>
      <Suspense fallback={<FormSkeleton />}>
        {params.then(({ id }) => (
          <EditSection rawId={id} />
        ))}
      </Suspense>
    </main>
  )
}

async function EditSection({ rawId }: { rawId: string }) {
  const id = parsePositiveInt(rawId)
  if (id === null) notFound()

  const viewer = await requireViewer(`/comments/${id}/edit`)
  if (!can(viewer, 'comment:update')) return <AccessDenied />

  // Созданные в браузере комментарии есть только в store клиента
  if (isLocalId(id)) return <EditCommentForm id={id} initial={null} />

  const comment = await getComment(id)
  if (!comment) notFound()
  return <EditCommentForm id={id} initial={comment} />
}
