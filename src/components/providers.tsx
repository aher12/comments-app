'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CommentsStoreProvider } from '@/store/provider'
import { DeleteDialog } from './delete-dialog'
import { Toaster } from './toaster'

let browserQueryClient: QueryClient | undefined

// На сервере — новый клиент на каждый рендер, в браузере — один на всё время жизни вкладки
function getQueryClient() {
  const create = () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } })
  if (typeof window === 'undefined') return create()
  browserQueryClient ??= create()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <CommentsStoreProvider>
        {children}
        <DeleteDialog />
        <Toaster />
      </CommentsStoreProvider>
    </QueryClientProvider>
  )
}
