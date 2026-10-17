'use client' // Error boundaries — всегда Client Components

import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div role="alert" className="card bg-base-100 shadow">
        <div className="card-body items-center text-center">
          <span className="text-5xl">⚠️</span>
          <h1 className="card-title">Что-то пошло не так</h1>
          <p className="text-base-content/70">{error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={() => retry()}>
              Попробовать снова
            </button>
            <Link href="/" className="btn btn-ghost">
              На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
