'use client'

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { createCommentsStore, type CommentsStore, type CommentsStoreApi } from './comments-store'

const CommentsStoreContext = createContext<CommentsStoreApi | null>(null)

/** Провайдер по рекомендации Zustand для Next.js: свой store на каждый рендер дерева */
export function CommentsStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCommentsStore)

  // Подтягиваем сохранённые изменения из localStorage после гидратации
  useEffect(() => {
    void store.persist.rehydrate()
  }, [store])

  return <CommentsStoreContext value={store}>{children}</CommentsStoreContext>
}

function useStoreApi() {
  const store = useContext(CommentsStoreContext)
  if (!store) throw new Error('useCommentsStore нужно вызывать внутри CommentsStoreProvider')
  return store
}

/** Подписка на часть состояния: компонент перерисуется, только если выбранное значение изменилось */
export function useCommentsStore<T>(selector: (state: CommentsStore) => T): T {
  return useStore(useStoreApi(), selector)
}

/** Прямой доступ к store (getState) — для обработчиков, которым не нужна подписка */
export const useCommentsStoreApi = useStoreApi

/** true, когда данные из localStorage уже загружены в store (на сервере — всегда false) */
export function useStoreHydrated() {
  const store = useStoreApi()
  // На сервере нет localStorage, и persist-middleware не добавляет store.persist — отсюда `?.`
  const subscribe = useCallback((onChange: () => void) => store.persist?.onFinishHydration(onChange) ?? (() => {}), [store])
  return useSyncExternalStore(subscribe, () => store.persist?.hasHydrated() ?? false, () => false)
}
