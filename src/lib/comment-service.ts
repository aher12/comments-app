import 'server-only'
import { ApiError, addComment, deleteComment, updateComment } from './comments-api'
import { isLocalId } from './constants'
import { checkPermission } from './dal'
import { commentCreateSchema, commentIdSchema, commentUpdateSchema, toFieldErrors, toFormError, type Comment, type CommentChanges } from './schemas'
import type { ActionResult } from '@/types/comment'

/**
 * Сервисный слой мутаций. Порядок проверок для каждой операции одинаковый:
 *   1) кто это и есть ли у него право (401 / 403);
 *   2) Zod-проверка входных данных (400) — даже если форма уже проверила их в браузере;
 *   3) только потом запрос к DummyJSON.
 * Его вызывают и Server Functions (lib/actions.ts), и Route Handlers (app/api/comments),
 * поэтому правила доступа и валидации не дублируются.
 *
 * Аргументы имеют тип unknown: в Server Function может прийти что угодно,
 * TypeScript-тип на клиенте ничего не гарантирует в рантайме.
 */

function apiFailure(e: unknown): ActionResult<never> {
  if (e instanceof ApiError && e.status === 404) return { ok: false, status: 404, error: 'Комментарий не найден' }
  return { ok: false, status: 502, error: e instanceof ApiError ? e.message : 'Не удалось выполнить запрос' }
}

export async function createComment(input: unknown): Promise<ActionResult<Comment>> {
  const access = await checkPermission('comment:create')
  if (!access.ok) return access

  const parsed = commentCreateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, status: 400, error: toFormError(parsed.error) ?? 'Проверьте поля формы', fieldErrors: toFieldErrors(parsed.error) }
  }

  try {
    // Автор — текущий пользователь из сессии, а не значение из формы
    return { ok: true, data: await addComment({ ...parsed.data, userId: access.viewer.id }) }
  } catch (e) {
    return apiFailure(e)
  }
}

export async function editComment(id: unknown, input: unknown): Promise<ActionResult<CommentChanges>> {
  const access = await checkPermission('comment:update')
  if (!access.ok) return access

  const commentId = commentIdSchema.safeParse(id)
  if (!commentId.success) return { ok: false, status: 400, error: 'Некорректный id' }
  const parsed = commentUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, status: 400, error: toFormError(parsed.error) ?? 'Проверьте поля формы', fieldErrors: toFieldErrors(parsed.error) }
  }

  // Локально созданные комментарии DummyJSON не знает — проверки пройдены, менять будет клиентский store
  if (isLocalId(commentId.data)) return { ok: true, data: parsed.data }

  try {
    await updateComment(commentId.data, parsed.data)
    return { ok: true, data: parsed.data }
  } catch (e) {
    return apiFailure(e)
  }
}

export async function removeComment(id: unknown): Promise<ActionResult<{ id: number }>> {
  const access = await checkPermission('comment:delete')
  if (!access.ok) return access

  const commentId = commentIdSchema.safeParse(id)
  if (!commentId.success) return { ok: false, status: 400, error: 'Некорректный id' }
  if (isLocalId(commentId.data)) return { ok: true, data: { id: commentId.data } }

  try {
    await deleteComment(commentId.data)
    return { ok: true, data: { id: commentId.data } }
  } catch (e) {
    return apiFailure(e)
  }
}
