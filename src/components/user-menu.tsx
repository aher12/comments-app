import Link from 'next/link'
import { logoutAction } from '@/lib/actions'
import { getViewer } from '@/lib/dal'
import { ROLE_LABEL } from '@/lib/permissions'
import { UserAvatar } from './user-avatar'

/**
 * Текущий пользователь в шапке — Server Component: сессию читает сервер,
 * в браузер уходит только готовая разметка. Выход — Server Function в обычной форме.
 */
export async function UserMenu() {
  const viewer = await getViewer()

  if (!viewer) {
    return (
      <Link href="/login" className="btn btn-sm btn-primary">
        Войти
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <UserAvatar user={{ id: viewer.id, username: viewer.username, fullName: viewer.name }} />
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-sm font-semibold">{viewer.name}</span>
        <span className="text-xs text-base-content/60">
          @{viewer.username} · {ROLE_LABEL[viewer.role]}
        </span>
      </div>
      {viewer.role === 'admin' && <span className="badge badge-secondary badge-sm sm:hidden">admin</span>}
      <form action={logoutAction}>
        <button type="submit" className="btn btn-sm btn-ghost">
          Выйти
        </button>
      </form>
    </div>
  )
}
