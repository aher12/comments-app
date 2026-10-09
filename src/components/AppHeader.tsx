interface AppHeaderProps {
  total: number
  likes: number
  posts: number
}

export function AppHeader({ total, likes, posts }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Комментарии</h1>
        <p className="text-base-content/60">Данные в формате dummyjson.com/comments</p>
      </div>

      <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-100">
        <div className="stat">
          <div className="stat-title">Комментариев</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Лайков</div>
          <div className="stat-value text-error">{likes}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Постов</div>
          <div className="stat-value text-primary">{posts}</div>
        </div>
      </div>
    </header>
  )
}
