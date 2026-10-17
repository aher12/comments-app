import type { Metadata } from 'next'
import Link from 'next/link'
import { LocalChanges } from '@/components/local-changes'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Комментарии', template: '%s · Комментарии' },
  description: 'ЛР2: приложение комментариев на Next.js App Router и DummyJSON',
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
              <span className="hidden sm:inline text-sm text-base-content/60">Next.js · DummyJSON</span>
              <div className="flex-1" />
              <LocalChanges />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  )
}
