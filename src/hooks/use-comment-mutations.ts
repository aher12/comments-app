'use client'

import { useCallback } from 'react'
import { deleteCommentAction, updateCommentAction } from '@/lib/actions'
import { useCommentsStoreApi } from '@/store/provider'
import type { Comment } from '@/types/comment'

/**
 * Мутации карточки: Server Function + запись результата в store.
 *  - лайк — optimistic update: счётчик растёт сразу, при ошибке (в т.ч. 401/403) откатываем;
 *  - удаление — пессимистичное: ждём ответа сервера, кнопка показывает отправку.
 * Права и данные проверяет сервер (lib/comment-service.ts), в том числе для локальных записей.
 */
export function useCommentMutations() {
  const store = useCommentsStoreApi()

  const like = useCallback(
    async (comment: Comment) => {
      const { applyChanges, setPending, showToast } = store.getState()
      applyChanges(comment.id, { likes: comment.likes + 1 }) // оптимистично

      setPending(comment.id, 'like')
      const result = await updateCommentAction(comment.id, { likes: comment.likes + 1 })
      setPending(comment.id, null)

      if (!result.ok) {
        applyChanges(comment.id, { likes: comment.likes }) // откат
        showToast('error', result.error)
        return false
      }
      return true
    },
    [store],
  )

  const remove = useCallback(
    async (comment: Comment) => {
      const { markDeleted, setPending, showToast } = store.getState()
      setPending(comment.id, 'delete')
      const result = await deleteCommentAction(comment.id)
      setPending(comment.id, null)
      if (!result.ok) {
        showToast('error', result.error)
        return false
      }
      markDeleted(comment.id)
      showToast('success', `Комментарий #${comment.id} удалён`)
      return true
    },
    [store],
  )

  return { like, remove }
}
