import type { NextRequest } from 'next/server'
import { ApiError, getComments } from '@/lib/comments-api'
import { PAGE_SIZE, parsePositiveInt } from '@/lib/constants'

/**
 * Route Handler: GET /api/comments?skip=0&limit=10&postId=6
 * HTTP-эндпоинт, из которого клиент (TanStack useInfiniteQuery) догружает следующие страницы.
 * Использует тот же getComments, что и Server Component, поэтому ответы кэшируются вместе.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const skip = Number(params.get('skip') ?? 0)
  const limit = Number(params.get('limit') ?? PAGE_SIZE)
  const postIdParam = params.get('postId')
  const postId = postIdParam === null ? null : parsePositiveInt(postIdParam)

  if (!Number.isInteger(skip) || skip < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return Response.json({ message: 'skip ≥ 0, 1 ≤ limit ≤ 50' }, { status: 400 })
  }
  if (postIdParam !== null && postId === null) {
    return Response.json({ message: 'postId должен быть положительным числом' }, { status: 400 })
  }

  try {
    return Response.json(await getComments({ skip, limit, postId }))
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return Response.json({ message: e instanceof Error ? e.message : 'Ошибка сервера' }, { status: status >= 500 ? 502 : status })
  }
}
