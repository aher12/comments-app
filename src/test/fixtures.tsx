import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DeleteDialog } from '@/components/delete-dialog'
import { Toaster } from '@/components/toaster'
import { CommentsStoreProvider } from '@/store/provider'

export { adminUser, comment, regularUser } from './data'

/** Рендер внутри настоящего store-провайдера — с диалогом удаления и уведомлениями, как в приложении */
export function renderWithStore(ui: ReactNode) {
  return render(
    <CommentsStoreProvider>
      {ui}
      <DeleteDialog />
      <Toaster />
    </CommentsStoreProvider>,
  )
}
