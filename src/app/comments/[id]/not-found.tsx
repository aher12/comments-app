import Link from 'next/link'

export default function CommentNotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="card bg-base-100 border border-dashed border-base-300">
        <div className="card-body items-center text-center">
          <span className="text-4xl">🔎</span>
          <h1 className="font-semibold">Такого комментария нет</h1>
          <p className="text-base-content/60">DummyJSON не нашёл запись с таким id.</p>
          <Link href="/" className="btn btn-sm">
            К списку
          </Link>
        </div>
      </div>
    </main>
  )
}
