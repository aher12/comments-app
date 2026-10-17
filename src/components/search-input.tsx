'use client'

import { useCommentsStore } from '@/store/provider'

/** Поиск по тексту и автору среди загруженных комментариев. Значение живёт в store — его читает список */
export function SearchInput() {
  const query = useCommentsStore((s) => s.query)
  const setQuery = useCommentsStore((s) => s.setQuery)

  return (
    <label className="input w-full">
      <span aria-hidden>🔍</span>
      <input type="search" placeholder="Поиск по тексту или автору…" value={query} onChange={(e) => setQuery(e.target.value)} />
    </label>
  )
}
