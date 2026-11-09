import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Proxy (бывший middleware) — быстрая «оптимистичная» проверка до рендера страницы:
 * анонима сразу отправляем на /login, не тратя время на рендер защищённой страницы.
 *
 * Это НЕ единственный уровень защиты: страницы ещё раз вызывают requireViewer(),
 * а Server Functions и Route Handlers — checkPermission() (lib/dal.ts).
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === 'https:',
  })
  if (token) return NextResponse.next()

  const loginUrl = new URL('/login', request.nextUrl)
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Страницы создания и изменения закрыты для анонимов
  matcher: ['/comments/new', '/comments/:id/edit'],
}
