import type { NextRequest } from 'next/server'
import { getComment } from '@/lib/comments-api'
import { parsePositiveInt } from '@/lib/constants'

/** Route Handler: GET /api/comments/:id — один комментарий (прокси к DummyJSON с кэшем) */
export async function GET(_request: NextRequest, ctx: RouteContext<'/api/comments/[id]'>) {
  const id = parsePositiveInt((await ctx.params).id)
  if (id === null) return Response.json({ message: 'Некорректный id' }, { status: 400 })

  try {
    const comment = await getComment(id)
    if (!comment) return Response.json({ message: `Комментарий #${id} не найден` }, { status: 404 })
    return Response.json(comment)
  } catch {
    return Response.json({ message: 'DummyJSON недоступен' }, { status: 502 })
  }
}
