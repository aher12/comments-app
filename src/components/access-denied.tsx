import Link from 'next/link'

/** Экран 403: пользователь вошёл, но у его роли нет права на это действие */
export function AccessDenied({ message = 'У вашей роли нет прав на это действие.' }: { message?: string }) {
  return (
    <div role="alert" className="card bg-base-100 border border-dashed border-error/40">
      <div className="card-body items-center text-center">
        <span className="text-4xl">⛔</span>
        <h2 className="font-semibold">Доступ запрещён (403)</h2>
        <p className="text-base-content/60">{message}</p>
        <Link href="/" className="btn btn-sm">
          К списку
        </Link>
      </div>
    </div>
  )
}
