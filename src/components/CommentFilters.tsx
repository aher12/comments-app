import type { CommentSort } from '../types/comment'

interface CommentFiltersProps {
  postIds: number[]
  postId: number | null
  onPostIdChange: (postId: number | null) => void
  query: string
  onQueryChange: (query: string) => void
  sort: CommentSort
  onSortChange: (sort: CommentSort) => void
}

const SORT_OPTIONS: { value: CommentSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'likes', label: 'По лайкам' },
]

export function CommentFilters({ postIds, postId, onPostIdChange, query, onQueryChange, sort, onSortChange }: CommentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="search"
        className="input sm:flex-1"
        placeholder="Поиск по тексту или автору…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <select
        className="select sm:w-44"
        value={postId ?? ''}
        onChange={(e) => onPostIdChange(e.target.value === '' ? null : Number(e.target.value))}
      >
        <option value="">Все посты</option>
        {postIds.map((id) => (
          <option key={id} value={id}>
            Пост #{id}
          </option>
        ))}
      </select>
      <select className="select sm:w-44" value={sort} onChange={(e) => onSortChange(e.target.value as CommentSort)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
