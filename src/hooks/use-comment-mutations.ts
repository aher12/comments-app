'use client'

import { useCallback } from 'react'
import { deleteCommentAction, updateCommentAction } from '@/lib/actions'
import { isLocalId } from '@/lib/constants'
import { useCommentsStoreApi } from '@/store/provider'
import type { Comment, CommentChanges } from '@/types/comment'

/**
 * Мутации существующих комментариев: Server Action + запись результата в store.
 *  - лайк и изменение — optimistic update: интерфейс меняется сразу, при ошибке откатываем;
 *  - удаление — пессимистичное: ждём ответа сервера, кнопка показывает отправку.
 * Локально созданные комментарии сервер не знает, их меняем только в store.
 */
export function useCommentMutations() {
  const store = useCommentsStoreApi()

  const update = useCallback(
    async (comment: Comment, changes: CommentChanges, successText?: string) => {
      const { applyChanges, setPending, showToast } = store.getState()
      const previous: CommentChanges = Object.fromEntries(
        Object.keys(changes).map((key) => [key, comment[key as keyof CommentChanges]]),
      )

      applyChanges(comment.id, changes) // оптимистично
      if (isLocalId(comment.id)) {
        if (successText) showToast('success', successText)
        return true
      }

      setPending(comment.id, changes.likes !== undefined ? 'like' : 'update')
      const result = await updateCommentAction(comment.id, changes)
      setPending(comment.id, null)

      if (!result.ok) {
        applyChanges(comment.id, previous) // откат
        showToast('error', result.error)
        return false
      }
      if (successText) showToast('success', successText)
      return true
    },
    [store],
  )

  const like = useCallback((comment: Comment) => update(comment, { likes: comment.likes + 1 }), [update])

  const remove = useCallback(
    async (comment: Comment) => {
      const { markDeleted, setPending, showToast } = store.getState()
      if (!isLocalId(comment.id)) {
        setPending(comment.id, 'delete')
        const result = await deleteCommentAction(comment.id)
        setPending(comment.id, null)
        if (!result.ok) {
          showToast('error', result.error)
          return false
        }
      }
      markDeleted(comment.id)
      showToast('success', `Комментарий #${comment.id} удалён`)
      return true
    },
    [store],
  )

  return { update, like, remove }
}
