import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoginForm } from '@/components/login-form'
import { getViewer } from '@/lib/dal'
import { callbackUrlSchema } from '@/lib/schemas'

export const metadata: Metadata = { title: 'Вход' }

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <main className="max-w-md mx-auto px-4 py-12 flex flex-col gap-4">
      <Suspense fallback={<div className="skeleton h-80 w-full" />}>
        <LoginSection searchParams={searchParams} />
      </Suspense>

      <div className="card bg-base-100 border border-dashed border-base-300">
        <div className="card-body p-4 text-sm gap-1">
          <h2 className="font-semibold">Демо-доступ</h2>
          <p>
            <code>admin</code> / <code>admin123</code> — администратор (может удалять)
          </p>
          <p>
            <code>user</code> / <code>user123</code> — пользователь (создание и изменение)
          </p>
        </div>
      </div>
    </main>
  )
}

async function LoginSection({ searchParams }: Pick<PageProps<'/login'>, 'searchParams'>) {
  const { callbackUrl: raw } = await searchParams
  const callbackUrl = callbackUrlSchema.parse(raw)

  // Уже вошедшему пользователю форма не нужна
  if (await getViewer()) redirect(callbackUrl)

  return <LoginForm callbackUrl={callbackUrl} />
}
