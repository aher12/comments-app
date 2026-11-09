import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LocalChanges } from '@/components/local-changes'
import { Providers } from '@/components/providers'
import { UserMenu } from '@/components/user-menu'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Комментарии', template: '%s · Комментарии' },
  description: 'ЛР3: комментарии на Next.js — Zod, Auth.js, роли и тесты',
}

// Корневой layout — Server Component. Клиентские провайдеры получают серверный контент через children.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-base-200 antialiased">
        <Providers>
          <header className="navbar bg-base-100 shadow-sm px-4">
            <div className="max-w-3xl w-full mx-auto flex items-center gap-3">
              <Link href="/" className="text-xl font-bold">
                💬 Комментарии
              </Link>
              <span className="hidden md:inline text-sm text-base-content/60">Next.js · DummyJSON</span>
              <div className="flex-1" />
              <LocalChanges />
              {/* Сессия читается на каждый запрос — поэтому за границей Suspense, остальной layout статичен */}
              <Suspense fallback={<div className="skeleton h-8 w-28" />}>
                <UserMenu />
              </Suspense>
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  )
}
