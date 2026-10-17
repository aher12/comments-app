import { Suspense } from 'react'
import { CommentFilters } from '@/components/comment-filters'
import { CommentForm } from '@/components/comment-form'
import { CommentsFeed } from '@/components/comments-feed'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { FeedSkeleton, FiltersSkeleton, FormSkeleton } from '@/components/skeletons'
import { getComments, getUsers } from '@/lib/comments-api'
import { PAGE_SIZE, parsePositiveInt } from '@/lib/constants'

/**
 * Главная страница — Server Component. Статичная оболочка (заголовок, скелетоны)
 * отдаётся сразу, а части, зависящие от данных и searchParams, стримятся в <Suspense>.
 */
export default function HomePage({ searchParams }: PageProps<'/'>) {
  const postId = searchParams.then((sp) => parsePositiveInt(sp.postId))

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Комментарии</h1>
        <p className="text-base-content/60">Просмотр и управление комментариями из dummyjson.com/comments</p>
      </div>

      <SectionErrorBoundary title="Не удалось загрузить форму">
        <Suspense fallback={<FormSkeleton />}>
          <CommentFormSection />
        </Suspense>
      </SectionErrorBoundary>

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

async function CommentFormSection() {
  const users = await getUsers()
  return <CommentForm users={users} />
}

async function FeedSection({ postId }: { postId: number | null }) {
  const firstPage = await getComments({ skip: 0, limit: PAGE_SIZE, postId })
  return <CommentsFeed key={postId ?? 'all'} initialPage={firstPage} postId={postId} />
}
