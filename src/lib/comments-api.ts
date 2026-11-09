import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { z } from 'zod'
import { env } from './env'
import {
  apiErrorSchema,
  commentSchema,
  commentsPageSchema,
  createdCommentSchema,
  deletedCommentSchema,
  type Comment,
  type CommentChanges,
  type CommentInput,
  type CommentsPage,
} from './schemas'
import type { CommentsQuery } from '@/types/comment'

/**
 * Единственный слой работы с DummyJSON. Его вызывают Server Components, Route Handlers
 * и сервисный слой мутаций (lib/comment-service.ts).
 * Каждый ответ проверяется Zod-схемой: если DummyJSON вернёт что-то неожиданное,
 * мы получим понятную ошибку здесь, а не undefined в глубине интерфейса.
 * `import 'server-only'` ломает сборку, если модуль случайно импортируют в Client Component.
 */

export const COMMENTS_TAG = 'comments'
export const commentTag = (id: number) => `comment:${id}`

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function request<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.output<S>> {
  let res: Response
  try {
    res = await fetch(`${env.DUMMYJSON_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError('Сервер DummyJSON недоступен', 503)
  }

  const payload: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const error = apiErrorSchema.safeParse(payload)
    throw new ApiError(error.success ? error.data.message : `Ошибка API: ${res.status}`, res.status)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    console.error(`Неожиданный ответ DummyJSON ${path}`, parsed.error.issues)
    throw new ApiError('DummyJSON вернул данные в неожиданном формате', 502)
  }
  return parsed.data
}

// ---------- Чтение (кэшируется через 'use cache') ----------

/** Страница комментариев: все или только к одному посту (limit/skip пагинация) */
export async function getComments({ skip, limit, postId }: CommentsQuery): Promise<CommentsPage> {
  'use cache'
  cacheLife('minutes')
  cacheTag(COMMENTS_TAG)

  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
  const path = postId === null ? '/comments' : `/comments/post/${postId}`
  try {
    return await request(`${path}?${params}`, commentsPageSchema)
  } catch (e) {
    // Пост без комментариев DummyJSON отдаёт как 404 — для нас это успешный пустой результат
    if (postId !== null && e instanceof ApiError && e.status === 404) {
      return { comments: [], total: 0, skip, limit }
    }
    throw e
  }
}

/** Один комментарий или null, если его нет */
export async function getComment(id: number): Promise<Comment | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(COMMENTS_TAG, commentTag(id))

  try {
    return await request(`/comments/${id}`, commentSchema)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

// ---------- Изменение (DummyJSON только имитирует запись) ----------
// Сюда попадают уже проверенные данные: авторизация и Zod — в comment-service.ts

export async function addComment(input: CommentInput & { userId: number }): Promise<Comment> {
  return request('/comments/add', createdCommentSchema, { method: 'POST', body: JSON.stringify(input) })
}

export async function updateComment(id: number, changes: CommentChanges): Promise<Comment> {
  return request(`/comments/${id}`, commentSchema, { method: 'PUT', body: JSON.stringify(changes) })
}

export async function deleteComment(id: number): Promise<{ id: number }> {
  return request(`/comments/${id}`, deletedCommentSchema, { method: 'DELETE' })
}
