import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CommentDetail } from '@/components/comment-detail'
import { DetailSkeleton } from '@/components/skeletons'
import { UserAvatar } from '@/components/user-avatar'
import { getComment, getComments } from '@/lib/comments-api'
import { isLocalId, parsePositiveInt } from '@/lib/constants'

/** Страница отдельного комментария: динамический маршрут /comments/[id] */
export default function CommentPage({ params }: PageProps<'/comments/[id]'>) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Комментарии</Link>
          </li>
          <li>
            <Suspense fallback="…">{params.then(({ id }) => <span>Комментарий #{id}</span>)}</Suspense>
          </li>
        </ul>
      </div>

      {/* params — данные запроса, поэтому их чтение обёрнуто в Suspense */}
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <CommentSection rawId={id} />
        ))}
      </Suspense>
    </main>
  )
}

async function CommentSection({ rawId }: { rawId: string }) {
  const id = parsePositiveInt(rawId)
  if (id === null) notFound()

  // Созданные в браузере комментарии есть только в store клиента
  if (isLocalId(id)) return <CommentDetail id={id} initial={null} />

  const comment = await getComment(id)
  if (!comment) notFound()

  return (
    <>
      <CommentDetail id={id} initial={comment} />
      <Suspense fallback={<div className="skeleton h-40 w-full" />}>
        <RelatedComments postId={comment.postId} excludeId={id} />
      </Suspense>
    </>
  )
}

/** Чисто серверный блок: без состояния и обработчиков, в клиентский бандл не попадает */
async function RelatedComments({ postId, excludeId }: { postId: number; excludeId: number }) {
  const { comments, total } = await getComments({ skip: 0, limit: 6, postId })
  const others = comments.filter((c) => c.id !== excludeId).slice(0, 5)

  return (
    <section className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-3">
        <h2 className="card-title text-base">
          Другие комментарии к посту #{postId}
          <span className="badge badge-ghost">{Math.max(total - 1, 0)}</span>
        </h2>
        {others.length === 0 ? (
          <p className="text-base-content/60">Других комментариев к этому посту нет.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-base-200">
            {others.map((c) => (
              <li key={c.id}>
                <Link href={`/comments/${c.id}`} className="flex items-center gap-3 py-2 hover:bg-base-200 rounded-box px-2">
                  <UserAvatar user={c.user} />
                  <span className="flex-1 min-w-0 truncate">{c.body}</span>
                  <span className="text-xs text-base-content/60">♥ {c.likes}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/?postId=${postId}`} className="link link-primary text-sm">
          Все комментарии к посту #{postId} →
        </Link>
      </div>
    </section>
  )
}
