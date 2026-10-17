'use server'

import { updateTag } from 'next/cache'
import {
  ApiError,
  addComment,
  COMMENTS_TAG,
  commentTag,
  deleteComment,
  updateComment,
  validateDraft,
} from './comments-api'
import { BODY_MAX_LENGTH } from './constants'
import type { ActionResult, Comment, CommentChanges } from '@/types/comment'

/**
 * Server Functions (Server Actions) — мутации, вызываемые из интерфейса.
 * Выполняются только на сервере; клиент получает ссылку на функцию, а не её код.
 * Вся работа с API — в общем модуле comments-api (его же использует Route Handler).
 */

const failure = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof ApiError ? e.message : 'Не удалось выполнить запрос',
})

export async function createCommentAction(formData: FormData): Promise<ActionResult<Comment>> {
  const { errors, draft } = validateDraft({
    body: formData.get('body'),
    postId: formData.get('postId'),
    userId: formData.get('userId'),
  })
  if (Object.keys(errors).length > 0) return { ok: false, error: 'Проверьте поля формы', fieldErrors: errors }

  try {
    const comment = await addComment(draft)
    // Сбрасываем кэш списка: следующий запрос получит свежие данные (read-your-own-writes)
    updateTag(COMMENTS_TAG)
    return { ok: true, data: comment }
  } catch (e) {
    return failure(e)
  }
}

export async function updateCommentAction(id: number, changes: CommentChanges): Promise<ActionResult<Comment>> {
  if (changes.body !== undefined) {
    const body = changes.body.trim()
    if (!body || body.length > BODY_MAX_LENGTH) return { ok: false, error: 'Некорректный текст комментария' }
    changes = { ...changes, body }
  }
  if (changes.postId !== undefined && (!Number.isInteger(changes.postId) || changes.postId < 1)) {
    return { ok: false, error: 'Некорректный postId' }
  }

  try {
    const comment = await updateComment(id, changes)
    updateTag(commentTag(id))
    return { ok: true, data: comment }
  } catch (e) {
    return failure(e)
  }
}

export async function deleteCommentAction(id: number): Promise<ActionResult<{ id: number }>> {
  try {
    await deleteComment(id)
    updateTag(commentTag(id))
    return { ok: true, data: { id } }
  } catch (e) {
    return failure(e)
  }
}
