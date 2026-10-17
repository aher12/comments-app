'use client'

import { useCommentsStore } from '@/store/provider'

/** Сколько изменений хранится локально (DummyJSON их не сохраняет) + сброс к данным сервера */
export function LocalChanges() {
  const created = useCommentsStore((s) => s.created.length)
  const updated = useCommentsStore((s) => Object.keys(s.updated).length)
  const deleted = useCommentsStore((s) => s.deleted.length)
  const reset = useCommentsStore((s) => s.resetLocalChanges)

  const total = created + updated + deleted
  if (total === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="badge badge-soft badge-warning" title={`Создано: ${created}, изменено: ${updated}, удалено: ${deleted}`}>
        Локальных изменений: {total}
      </span>
      <button className="btn btn-xs btn-ghost" onClick={reset}>
        Сбросить
      </button>
    </div>
  )
}
