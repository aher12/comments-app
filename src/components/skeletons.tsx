// Плейсхолдеры загрузки. Server Components: попадают в статическую оболочку страницы.

export function CommentCardSkeleton() {
  return (
    <li className="card bg-base-100 shadow-sm" aria-hidden>
      <div className="card-body p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-5 w-20" />
        </div>
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </li>
  )
}

export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="flex flex-col gap-3" aria-busy="true" aria-label="Загрузка комментариев">
      <div className="skeleton h-5 w-56" />
      <ul className="flex flex-col gap-3">
        {Array.from({ length: count }, (_, i) => (
          <CommentCardSkeleton key={i} />
        ))}
      </ul>
    </section>
  )
}

export function FormSkeleton() {
  return (
    <div className="card bg-base-100 shadow" aria-hidden>
      <div className="card-body gap-3">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-20 w-full" />
        <div className="flex gap-2">
          <div className="skeleton h-10 flex-1" />
          <div className="skeleton h-10 w-36" />
          <div className="skeleton h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

export function FiltersSkeleton() {
  return <div className="skeleton h-28 w-full" aria-hidden />
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Загрузка комментария">
      <ul>
        <CommentCardSkeleton />
      </ul>
      <div className="skeleton h-40 w-full" />
    </div>
  )
}
