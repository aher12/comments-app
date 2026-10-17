import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center text-center">
          <span className="text-5xl">🔎</span>
          <h1 className="card-title">Страница не найдена</h1>
          <Link href="/" className="btn btn-primary">
            К списку комментариев
          </Link>
        </div>
      </div>
    </main>
  )
}
