import 'server-only'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/auth'
import { can, type Permission } from './permissions'
import { viewerSchema, type Viewer } from './schemas'

/**
 * Data Access Layer: единственное место, где сервер узнаёт текущего пользователя
 * и проверяет его права. Его вызывают страницы, Server Functions и Route Handlers —
 * проверка не зависит от того, что показал или скрыл интерфейс.
 */

/** Текущий пользователь или null. cache — сессия читается один раз за запрос */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Сессия зависит от запроса: явно говорим Next.js не пытаться пререндерить этот участок
  // (Auth.js внутри использует crypto.getRandomValues, что запрещено при пререндере)
  await connection()
  const session = await auth()
  // Сессия — тоже внешние данные (cookie): проверяем форму, а не приводим через `as`
  const parsed = viewerSchema.safeParse({
    id: session?.user.id,
    username: session?.user.username,
    name: session?.user.name,
    role: session?.user.role,
  })
  return parsed.success ? parsed.data : null
})

/** Для страниц: аноним уходит на /login, после входа вернётся на callbackUrl */
export async function requireViewer(callbackUrl: string): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  return viewer
}

export type AccessResult = { ok: true; viewer: Viewer } | { ok: false; status: 401 | 403; error: string }

/**
 * Для мутаций: 401 — пользователь не вошёл (не знаем, кто это),
 * 403 — вошёл, но у его роли нет такого права.
 */
export async function checkPermission(permission: Permission): Promise<AccessResult> {
  const viewer = await getViewer()
  if (!viewer) return { ok: false, status: 401, error: 'Войдите в систему, чтобы выполнить это действие' }
  if (!can(viewer, permission)) return { ok: false, status: 403, error: 'Недостаточно прав для этого действия' }
  return { ok: true, viewer }
}
