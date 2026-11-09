import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { editComment, removeComment } from '@/lib/comment-service'
import { commentTag, getComment } from '@/lib/comments-api'
import { parsePositiveInt } from '@/lib/schemas'

type Ctx = RouteContext<'/api/comments/[id]'>

/** GET /api/comments/:id — один комментарий (прокси к DummyJSON с кэшем), доступен всем */
export async function GET(_request: NextRequest, ctx: Ctx) {
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

/** PATCH /api/comments/:id — изменение: нужен вход (иначе 401) */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const id = parsePositiveInt((await ctx.params).id)
  const body: unknown = await request.json().catch(() => null)
  const result = await editComment(id, body)
  if (!result.ok) return Response.json(result, { status: result.status })

  if (id !== null) revalidateTag(commentTag(id), 'max')
  return Response.json(result.data)
}

/** DELETE /api/comments/:id — только администратор: аноним получит 401, пользователь — 403 */
export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const id = parsePositiveInt((await ctx.params).id)
  const result = await removeComment(id)
  if (!result.ok) return Response.json(result, { status: result.status })

  revalidateTag(commentTag(result.data.id), 'max')
  return Response.json(result.data)
}
