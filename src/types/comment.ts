// Типы выводятся из Zod-схем (z.infer) — см. lib/schemas.ts
export type {
  Comment,
  CommentChanges,
  CommentFormValues,
  CommentInput,
  CommentsPage,
  CommentUser,
  FieldErrors,
  Role,
  Viewer,
} from '@/lib/schemas'

import type { FieldErrors } from '@/lib/schemas'

export interface CommentsQuery {
  skip: number
  limit: number
  postId: number | null
}

/** Код ответа при ошибке: 400 — неверные данные, 401 — не вошёл, 403 — нет прав, 404, 502 — DummyJSON */
export type ErrorStatus = 400 | 401 | 403 | 404 | 502

// Результат Server Action / сервисного слоя: ошибки возвращаются значением, а не исключением
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: ErrorStatus; error: string; fieldErrors?: FieldErrors }
