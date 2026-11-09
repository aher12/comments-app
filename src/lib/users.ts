import 'server-only'
import { compare } from 'bcryptjs'
import type { LoginInput, Role, Viewer } from './schemas'

/**
 * Учётные записи приложения. В учебном проекте нет своей БД, поэтому записи лежат здесь,
 * но пароли хранятся только в виде bcrypt-хешей — открытого пароля в коде и в bundle нет.
 * id совпадает с id пользователя DummyJSON: от его имени создаются комментарии.
 *
 * Демо-доступ:  admin / admin123  (администратор)
 *               user  / user123   (пользователь)
 */
interface Account {
  id: number
  username: string
  name: string
  role: Role
  passwordHash: string
}

const ACCOUNTS: readonly Account[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Emily Johnson',
    role: 'admin',
    passwordHash: '$2b$10$5/aA1S4yCeMJkpGz7aKp/.D65O502FJv2aKM8T722MWNuwRHMl2y2',
  },
  {
    id: 2,
    username: 'user',
    name: 'Michael Williams',
    role: 'user',
    passwordHash: '$2b$10$DorN7mIoDj0QgXRna1SemeeDKyWGBo63.o9LiZEX5IEIvQQcpj14m',
  },
]

// Хеш-пустышка: сравниваем с ним, даже если логина нет, чтобы время ответа
// не подсказывало, существует ли такой пользователь.
const DUMMY_HASH = '$2b$10$1/qtDifROOYE7P207TmOJu77KHSiwOgv5IAwd9QCh7CiH2LZwwza.'

/** Проверка логина и пароля. Возвращает пользователя без хеша или null */
export async function verifyCredentials({ username, password }: LoginInput): Promise<Viewer | null> {
  const account = ACCOUNTS.find((a) => a.username === username.toLowerCase())
  const valid = await compare(password, account?.passwordHash ?? DUMMY_HASH)
  if (!account || !valid) return null
  return { id: account.id, username: account.username, name: account.name, role: account.role }
}
