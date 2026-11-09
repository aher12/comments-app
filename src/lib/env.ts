import 'server-only'
import { z } from 'zod'

/**
 * Переменные окружения — тоже внешняя граница: проверяем их Zod-схемой один раз при запуске.
 * Без AUTH_SECRET сервер не стартует с непонятной ошибкой где-то в глубине Auth.js,
 * а сразу сообщает, что именно не так. Модуль 'server-only' — секрет не попадёт в клиентский bundle
 * (к тому же у переменной нет префикса NEXT_PUBLIC_).
 */
const envSchema = z.object({
  AUTH_SECRET: z
    .string({ error: 'AUTH_SECRET не задан — создайте .env.local (см. .env.example)' })
    .min(32, 'AUTH_SECRET должен быть не короче 32 символов (npx auth secret)'),
  DUMMYJSON_URL: z.url({ error: 'DUMMYJSON_URL должен быть URL' }).default('https://dummyjson.com'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(`Некорректные переменные окружения:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
