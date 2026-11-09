import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import type { NextRequest } from 'next/server'
import { createComment } from '@/lib/comment-service'
import { ApiError, COMMENTS_TAG, getComments } from '@/lib/comments-api'
import { commentsQuerySchema } from '@/lib/schemas'

/**
 * GET /api/comments?skip=0&limit=10&postId=6 — постраничная загрузка (TanStack useInfiniteQuery).
 * Параметры URL — внешняя граница: проверяем их Zod-схемой, на ошибку отвечаем 400.
 */
export async function GET(request: NextRequest) {
  const query = commentsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!query.success) {
    return Response.json({ message: z.prettifyError(query.error) }, { status: 400 })
  }

  try {
    return Response.json(await getComments(query.data))
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return Response.json({ message: e instanceof Error ? e.message : 'Ошибка сервера' }, { status: status >= 500 ? 502 : status })
  }
}

/**
 * POST /api/comments — создание через HTTP (те же проверки, что и в Server Function):
 * 401 — не вошёл, 403 — нет прав, 400 — данные не прошли Zod, 201 — создано.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null)
  const result = await createComment(body)
  if (!result.ok) return Response.json(result, { status: result.status })

  revalidateTag(COMMENTS_TAG, 'max')
  return Response.json(result.data, { status: 201 })
}
