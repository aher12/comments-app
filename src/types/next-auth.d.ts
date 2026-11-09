import type { DefaultSession } from 'next-auth'
import type { Role } from '@/lib/schemas'

// Расширяем типы Auth.js: у пользователя приложения есть логин и роль
declare module 'next-auth' {
  interface User {
    username?: string
    role?: Role
  }

  interface Session {
    user: {
      id: string
      username?: string
      role?: Role
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string
    role?: Role
  }
}
