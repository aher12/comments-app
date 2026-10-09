import { useCallback, useMemo } from 'react'
import { mockCommentsResponse } from '../data/mockComments'
import type { Comment, CommentDraft } from '../types/comment'
import { useLocalStorage } from './useLocalStorage'

/**
 * Вся бизнес-логика работы с комментариями: CRUD-операции и статистика.
 * Компоненты не знают, где хранятся данные, — только вызывают колбэки.
 */
export function useComments() {
  const [comments, setComments] = useLocalStorage<Comment[]>('comments', mockCommentsResponse.comments)

  // useCallback сохраняет ссылки на функции между рендерами,
  // поэтому мемоизированные дочерние компоненты (React.memo) не перерисовываются зря.
  // Везде используется функциональное обновление prev => ..., чтобы не зависеть от comments.
  const addComment = useCallback(
    (draft: CommentDraft) => {
      setComments((prev) => {
        const nextId = prev.reduce((max, c) => Math.max(max, c.id), 0) + 1
        return [...prev, { id: nextId, likes: 0, ...draft }]
      })
    },
    [setComments],
  )

  const updateComment = useCallback(
    (id: number, changes: Partial<Pick<Comment, 'body' | 'postId'>>) => {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)))
    },
    [setComments],
  )

  const likeComment = useCallback(
    (id: number) => {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)))
    },
    [setComments],
  )

  const deleteComment = useCallback(
    (id: number) => {
      setComments((prev) => prev.filter((c) => c.id !== id))
    },
    [setComments],
  )

  const resetToMock = useCallback(() => {
    setComments(mockCommentsResponse.comments)
  }, [setComments])

  // Производные данные не храним в состоянии, а вычисляем из comments
  const stats = useMemo(
    () => ({
      total: comments.length,
      likes: comments.reduce((sum, c) => sum + c.likes, 0),
      posts: new Set(comments.map((c) => c.postId)).size,
    }),
    [comments],
  )

  const postIds = useMemo(() => [...new Set(comments.map((c) => c.postId))].sort((a, b) => a - b), [comments])

  return { comments, stats, postIds, addComment, updateComment, likeComment, deleteComment, resetToMock }
}
