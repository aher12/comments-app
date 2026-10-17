'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo } from 'react'
import { PAGE_SIZE } from '@/lib/constants'
import { applyLocalChanges } from '@/store/comments-store'
import { useCommentsStore } from '@/store/provider'
import type { Comment, CommentsPage } from '@/types/comment'
import { CommentCard } from './comment-card'
import { CommentCardSkeleton } from './skeletons'

/** Запрос следующей страницы через наш Route Handler, а не напрямую к DummyJSON */
async function fetchCommentsPage(skip: number, postId: number | null): Promise<CommentsPage> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(PAGE_SIZE) })
  if (postId !== null) params.set('postId', String(postId))
  const res = await fetch(`/api/comments?${params}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message ?? `Ошибка ${res.status}`)
  return data as CommentsPage
}

interface CommentsFeedProps {
  initialPage: CommentsPage // первая страница, загруженная Server Component
  postId: number | null
}

/**
 * Infinite query: первая страница приходит с сервера (initialData),
 * следующие догружаются кнопкой «Загрузить ещё» через GET /api/comments.
 */
export function CommentsFeed({ initialPage, postId }: CommentsFeedProps) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError, isRefetching, isRefetchError, refetch } =
    useInfiniteQuery({
      queryKey: ['comments', { postId }],
      queryFn: ({ pageParam }) => fetchCommentsPage(pageParam, postId),
      initialPageParam: 0,
      initialData: { pages: [initialPage], pageParams: [0] },
      // Конец списка: получили пустую страницу или дошли до total
      getNextPageParam: (last) => {
        const next = last.skip + last.comments.length
        return last.comments.length > 0 && next < last.total ? next : undefined
      },
    })

  const created = useCommentsStore((s) => s.created)
  const updated = useCommentsStore((s) => s.updated)
  const deleted = useCommentsStore((s) => s.deleted)
  const search = useCommentsStore((s) => s.query)

  const serverTotal = data.pages[data.pages.length - 1].total

  const { loaded, visible } = useMemo(() => {
    // Дедупликация по id: при сдвиге данных между запросами одна запись могла прийти дважды
    const unique = new Map<number, Comment>()
    for (const page of data.pages) for (const c of page.comments) if (!unique.has(c.id)) unique.set(c.id, c)

    let list = applyLocalChanges([...created, ...unique.values()], { updated, deleted })
    if (postId !== null) list = list.filter((c) => c.postId === postId)

    const q = search.trim().toLowerCase()
    const filtered = q
      ? list.filter(
          (c) =>
            c.body.toLowerCase().includes(q) ||
            c.user.username.toLowerCase().includes(q) ||
            c.user.fullName.toLowerCase().includes(q),
        )
      : list
    return { loaded: unique.size, visible: filtered }
  }, [data.pages, created, updated, deleted, postId, search])

  const isEmpty = serverTotal === 0 && visible.length === 0 && !search

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
        <span>
          {postId === null ? 'Все комментарии' : `Комментарии к посту #${postId}`} · загружено {loaded} из {serverTotal}
        </span>
        {isRefetching && !isFetchingNextPage && (
          <span className="badge badge-info badge-soft gap-1">
            <span className="loading loading-spinner loading-xs" /> Обновление…
          </span>
        )}
        <div className="flex-1" />
        <button className="btn btn-xs btn-ghost" onClick={() => refetch()} disabled={isRefetching}>
          ↻ Обновить
        </button>
      </div>

      {isRefetchError && (
        <div role="alert" className="alert alert-warning alert-soft">
          <span>Не удалось обновить список: {error?.message}. Показаны ранее загруженные данные.</span>
        </div>
      )}

      {isEmpty ? (
        <div className="card bg-base-100 border border-dashed border-base-300">
          <div className="card-body items-center text-center">
            <span className="text-4xl">💬</span>
            <h3 className="font-semibold">{postId === null ? 'Комментариев пока нет' : `У поста #${postId} пока нет комментариев`}</h3>
            <p className="text-base-content/60">Станьте первым — добавьте комментарий через форму выше.</p>
            {postId !== null && (
              <Link href="/" className="btn btn-sm btn-ghost">
                Показать все посты
              </Link>
            )}
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          По запросу «{search}» среди загруженных комментариев ничего не найдено
          {hasNextPage && '. Загрузите ещё, чтобы искать дальше.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {/* key — стабильный id записи, а не индекс */}
          {visible.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
          {isFetchingNextPage && Array.from({ length: 3 }, (_, i) => <CommentCardSkeleton key={`skeleton-${i}`} />)}
        </ul>
      )}

      {isFetchNextPageError && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>Не удалось загрузить следующую страницу: {error?.message}</span>
          <button className="btn btn-sm" onClick={() => fetchNextPage()}>
            Повторить
          </button>
        </div>
      )}

      {!isEmpty && (
        <div className="flex justify-center py-2">
          {hasNextPage ? (
            <button className="btn btn-primary btn-outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage && <span className="loading loading-spinner loading-sm" />}
              {isFetchingNextPage ? 'Загрузка…' : 'Загрузить ещё'}
            </button>
          ) : (
            <span className="text-sm text-base-content/50">Это все комментарии</span>
          )}
        </div>
      )}
    </section>
  )
}
