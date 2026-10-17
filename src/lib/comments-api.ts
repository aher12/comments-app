import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { BODY_MAX_LENGTH } from './constants'
import type { Comment, CommentChanges, CommentDraft, CommentsPage, CommentsQuery, CommentUser } from '@/types/comment'

/**
 * Единственный слой работы с DummyJSON. Его вызывают и Server Components,
 * и Route Handler (/api/comments), и Server Actions — бизнес-логика не дублируется.
 * `import 'server-only'` ломает сборку, если модуль случайно импортируют в Client Component.
 */
const API_URL = 'https://dummyjson.com'

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError('Сервер DummyJSON недоступен', 503)
  }
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(payload?.message ?? `Ошибка API: ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
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
    return await request<CommentsPage>(`${path}?${params}`)
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
    return await request<Comment>(`/comments/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/** Пользователи для выбора автора — меняются редко, кэшируем надолго */
export async function getUsers(): Promise<CommentUser[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('users')

  const data = await request<{ users: { id: number; username: string; firstName: string; lastName: string }[] }>(
    '/users?limit=20&select=id,username,firstName,lastName',
  )
  return data.users.map((u) => ({ id: u.id, username: u.username, fullName: `${u.firstName} ${u.lastName}` }))
}

// ---------- Изменение (DummyJSON только имитирует запись) ----------

export function validateDraft(draft: { body: unknown; postId: unknown; userId: unknown }) {
  const errors: Record<string, string> = {}
  const body = typeof draft.body === 'string' ? draft.body.trim() : ''
  const postId = Number(draft.postId)
  const userId = Number(draft.userId)

  if (!body) errors.body = 'Введите текст комментария'
  else if (body.length > BODY_MAX_LENGTH) errors.body = `Не больше ${BODY_MAX_LENGTH} символов`
  if (!Number.isInteger(postId) || postId < 1) errors.postId = 'postId — целое число от 1'
  if (!Number.isInteger(userId) || userId < 1) errors.userId = 'Выберите автора'

  return { errors, draft: { body, postId, userId } satisfies CommentDraft }
}

export async function addComment(draft: CommentDraft): Promise<Comment> {
  const created = await request<Omit<Comment, 'likes'>>('/comments/add', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
  return { likes: 0, ...created }
}

export async function updateComment(id: number, changes: CommentChanges): Promise<Comment> {
  return request<Comment>(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(changes) })
}

export async function deleteComment(id: number): Promise<{ id: number; isDeleted: boolean }> {
  return request(`/comments/${id}`, { method: 'DELETE' })
}
