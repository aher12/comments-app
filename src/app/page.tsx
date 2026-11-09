import Link from 'next/link'
import { Suspense } from 'react'
import { CommentFilters } from '@/components/comment-filters'
import { CommentsFeed } from '@/components/comments-feed'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { FeedSkeleton, FiltersSkeleton } from '@/components/skeletons'
import { getComments } from '@/lib/comments-api'
import { PAGE_SIZE } from '@/lib/constants'
import { getViewer } from '@/lib/dal'
import { can } from '@/lib/permissions'
import { parsePositiveInt } from '@/lib/schemas'

/**
 * Главная страница — Server Component. Статичная оболочка (заголовок, скелетоны)
 * отдаётся сразу, а части, зависящие от данных, сессии и searchParams, стримятся в <Suspense>.
 */
export default function HomePage({ searchParams }: PageProps<'/'>) {
  const postId = searchParams.then((sp) => parsePositiveInt(sp.postId))

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-60">
          <h1 className="text-3xl font-bold">Комментарии</h1>
          <p className="text-base-content/60">Просмотр и управление комментариями из dummyjson.com/comments</p>
        </div>
        <Suspense fallback={<div className="skeleton h-10 w-48" />}>
          {postId.then((id) => (
            <NewCommentAction postId={id} />
          ))}
        </Suspense>
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        {postId.then((id) => (
          <CommentFilters key={id ?? 'all'} postId={id} />
        ))}
      </Suspense>

      <SectionErrorBoundary title="Не удалось загрузить комментарии">
        <Suspense fallback={<FeedSkeleton />}>
          {postId.then((id) => (
            // key: при смене фильтра — новая граница Suspense, и снова показывается скелетон
            <Suspense key={id ?? 'all'} fallback={<FeedSkeleton />}>
              <FeedSection postId={id} />
            </Suspense>
          ))}
        </Suspense>
      </SectionErrorBoundary>
    </main>
  )
}

/** Кнопка создания видна только тем, у кого есть право; аноним видит приглашение войти */
async function NewCommentAction({ postId }: { postId: number | null }) {
  const viewer = await getViewer()
  if (can(viewer, 'comment:create')) {
    return (
      <Link href={postId ? `/comments/new?postId=${postId}` : '/comments/new'} className="btn btn-primary">
        + Новый комментарий
      </Link>
    )
  }
  return (
    <Link href="/login" className="btn btn-outline">
      Войдите, чтобы комментировать
    </Link>
  )
}

async function FeedSection({ postId }: { postId: number | null }) {
  const [firstPage, viewer] = await Promise.all([getComments({ skip: 0, limit: PAGE_SIZE, postId }), getViewer()])
  return <CommentsFeed key={postId ?? 'all'} initialPage={firstPage} postId={postId} viewer={viewer} />
}
