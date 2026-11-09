import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AccessDenied } from '@/components/access-denied'
import { CreateCommentForm } from '@/components/create-comment-form'
import { FormSkeleton } from '@/components/skeletons'
import { requireViewer } from '@/lib/dal'
import { can } from '@/lib/permissions'
import { parsePositiveInt } from '@/lib/schemas'

export const metadata: Metadata = { title: 'Новый комментарий' }

/** Страница создания. Закрыта для анонима: proxy.ts перенаправляет заранее, requireViewer — ещё раз на сервере */
export default function NewCommentPage({ searchParams }: PageProps<'/comments/new'>) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Комментарии</Link>
          </li>
          <li>Новый комментарий</li>
        </ul>
      </div>
      <h1 className="text-3xl font-bold">Новый комментарий</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewCommentSection searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function NewCommentSection({ searchParams }: Pick<PageProps<'/comments/new'>, 'searchParams'>) {
  const postId = parsePositiveInt((await searchParams).postId)
  const viewer = await requireViewer(postId ? `/comments/new?postId=${postId}` : '/comments/new')
  if (!can(viewer, 'comment:create')) return <AccessDenied />

  return <CreateCommentForm defaultPostId={postId ?? undefined} />
}
