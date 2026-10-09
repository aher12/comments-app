import { useMemo, useState } from 'react'
import type { Comment, CommentSort } from '../types/comment'

/** Фильтр по посту, поиск по тексту/автору и сортировка. Пересчитывается только при изменении входных данных. */
export function useCommentFilter(comments: Comment[]) {
  const [postId, setPostId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<CommentSort>('newest')

  const visibleComments = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = comments.filter(
      (c) =>
        (postId === null || c.postId === postId) &&
        (q === '' ||
          c.body.toLowerCase().includes(q) ||
          c.user.username.toLowerCase().includes(q) ||
          c.user.fullName.toLowerCase().includes(q)),
    )
    // sort мутирует массив, поэтому сортируем копию
    return [...filtered].sort((a, b) => {
      if (sort === 'likes') return b.likes - a.likes
      if (sort === 'oldest') return a.id - b.id
      return b.id - a.id
    })
  }, [comments, postId, query, sort])

  return { postId, setPostId, query, setQuery, sort, setSort, visibleComments }
}
