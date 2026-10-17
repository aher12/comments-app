'use client'

import { catchError, type ErrorInfo } from 'next/error'

/**
 * Локальный error boundary: если упала только часть страницы (например, DummyJSON
 * не ответил при загрузке списка), остальной интерфейс продолжает работать.
 */
function SectionError({ title }: { title: string; children?: React.ReactNode }, { error, retry }: ErrorInfo) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div role="alert" className="alert alert-error alert-soft flex flex-col sm:flex-row items-start sm:items-center">
      <div className="flex-1">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm opacity-80">{message}</p>
      </div>
      <button className="btn btn-sm" onClick={() => retry()}>
        Повторить
      </button>
    </div>
  )
}

export const SectionErrorBoundary = catchError(SectionError)
