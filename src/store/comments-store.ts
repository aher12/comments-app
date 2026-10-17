import { createStore } from 'zustand/vanilla'
import { devtools, persist } from 'zustand/middleware'
import { LOCAL_ID_START } from '@/lib/constants'
import type { Comment, CommentChanges } from '@/types/comment'

/**
 * Общее клиентское состояние приложения (Zustand).
 *
 * DummyJSON только имитирует POST/PUT/DELETE и ничего не сохраняет, поэтому
 * результаты мутаций храним здесь как "слой изменений" поверх данных сервера:
 * созданные, изменённые и удалённые записи. Слой сохраняется в localStorage (persist).
 * Также здесь — состояние интерфейса, нужное нескольким далёким друг от друга
 * компонентам (поиск, диалог удаления, уведомления), чтобы не пробрасывать его через props.
 */

export type PendingKind = 'update' | 'delete' | 'like'

export interface Toast {
  id: number
  type: 'success' | 'error'
  text: string
}

export interface CommentsState {
  created: Comment[]
  updated: Record<number, CommentChanges>
  deleted: number[]
  pending: Record<number, PendingKind>
  query: string
  commentToDelete: Comment | null
  toast: Toast | null
}

export interface CommentsActions {
  addCreated: (comment: Comment) => Comment
  applyChanges: (id: number, changes: CommentChanges) => void
  markDeleted: (id: number) => void
  setPending: (id: number, kind: PendingKind | null) => void
  setQuery: (query: string) => void
  requestDelete: (comment: Comment | null) => void
  showToast: (type: Toast['type'], text: string) => void
  hideToast: () => void
  resetLocalChanges: () => void
}

export type CommentsStore = CommentsState & CommentsActions

const initialState: CommentsState = {
  created: [],
  updated: {},
  deleted: [],
  pending: {},
  query: '',
  commentToDelete: null,
  toast: null,
}

// Фабрика, а не глобальный store: в Next.js модуль общий для всех запросов на сервере,
// поэтому store создаётся на каждый рендер дерева в провайдере.
export const createCommentsStore = () =>
  createStore<CommentsStore>()(
    devtools(
      persist(
        (set) => ({
          ...initialState,

          addCreated: (comment) => {
            let saved = comment
            set((s) => {
              const nextId = s.created.reduce((max, c) => Math.max(max, c.id), LOCAL_ID_START - 1) + 1
              saved = { ...comment, id: nextId }
              return { created: [saved, ...s.created] }
            })
            return saved
          },

          applyChanges: (id, changes) =>
            set((s) => ({ updated: { ...s.updated, [id]: { ...s.updated[id], ...changes } } })),

          markDeleted: (id) =>
            set((s) => ({
              deleted: s.deleted.includes(id) ? s.deleted : [...s.deleted, id],
              created: s.created.filter((c) => c.id !== id),
            })),

          setPending: (id, kind) =>
            set((s) => {
              const pending = { ...s.pending }
              if (kind) pending[id] = kind
              else delete pending[id]
              return { pending }
            }),

          setQuery: (query) => set({ query }),
          requestDelete: (commentToDelete) => set({ commentToDelete }),
          showToast: (type, text) => set({ toast: { id: Date.now(), type, text } }),
          hideToast: () => set({ toast: null }),
          resetLocalChanges: () => set({ created: [], updated: {}, deleted: [] }),
        }),
        {
          name: 'comments-local-changes',
          // В localStorage — только данные, без временного состояния интерфейса
          partialize: (s) => ({ created: s.created, updated: s.updated, deleted: s.deleted }),
          // Читаем localStorage уже после гидратации, иначе HTML сервера и клиента не совпадут
          skipHydration: true,
        },
      ),
      { name: 'CommentsStore', enabled: process.env.NODE_ENV !== 'production' },
    ),
  )

export type CommentsStoreApi = ReturnType<typeof createCommentsStore>

/** Накладывает локальные изменения на комментарии с сервера */
export function applyLocalChanges(
  comments: Comment[],
  { updated, deleted }: Pick<CommentsState, 'updated' | 'deleted'>,
): Comment[] {
  const deletedIds = new Set(deleted)
  return comments.filter((c) => !deletedIds.has(c.id)).map((c) => (updated[c.id] ? { ...c, ...updated[c.id] } : c))
}
