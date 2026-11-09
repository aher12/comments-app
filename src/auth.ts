import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { env } from '@/lib/env'
import { loginSchema } from '@/lib/schemas'
import { verifyCredentials } from '@/lib/users'

/**
 * Auth.js (next-auth v5). Вход по логину и паролю (Credentials).
 *
 * Сессия — JWT-стратегия: после входа Auth.js кладёт данные пользователя (id, роль)
 * в зашифрованный токен (JWE) и записывает его в cookie `authjs.session-token`:
 *   httpOnly — JavaScript страницы не может прочитать cookie (защита от кражи через XSS);
 *   sameSite=lax — cookie не уходит с POST-запросами с чужих сайтов (защита от CSRF);
 *   secure — по HTTPS в production (имя cookie получает префикс __Secure-).
 * Браузер присылает cookie с каждым запросом, поэтому после обновления страницы сессия сохраняется.
 * В localStorage ни пароль, ни токен не попадают.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true, // приложение запускается локально (next start), а не на Vercel
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 часов
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Логин' },
        password: { label: 'Пароль', type: 'password' },
      },
      // Данные формы входа — внешний ввод: проверяем схемой ещё раз на сервере
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null
        const viewer = await verifyCredentials(parsed.data)
        if (!viewer) return null
        return { id: String(viewer.id), name: viewer.name, username: viewer.username, role: viewer.role }
      },
    }),
  ],
  callbacks: {
    // Вызывается при входе (есть user) и при каждом чтении сессии: переносим роль в токен
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    // Что увидит приложение в auth(): только нужные поля, без служебных данных токена
    session({ session, token }) {
      session.user.id = token.sub ?? ''
      session.user.role = token.role
      session.user.username = token.username
      return session
    },
  },
})
