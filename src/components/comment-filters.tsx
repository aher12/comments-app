import Form from 'next/form'
import Link from 'next/link'
import { SearchInput } from './search-input'
import { SubmitButton } from './submit-button'

/**
 * Панель фильтров — Server Component. Фильтр по посту — обычная GET-форма (next/form):
 * postId попадает в URL (?postId=6), и сервер загружает /comments/post/6.
 * Интерактивны только два маленьких клиентских острова: поиск и кнопка с pending-состоянием.
 */
export function CommentFilters({ postId }: { postId: number | null }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 gap-3">
        <Form action="/" className="flex flex-col sm:flex-row gap-2">
          <label className="input sm:flex-1">
            <span className="label">Пост №</span>
            <input name="postId" type="number" min={1} placeholder="например, 242" defaultValue={postId ?? ''} />
          </label>
          <SubmitButton pendingText="Загрузка…">Показать</SubmitButton>
          {postId !== null && (
            <Link href="/" className="btn btn-ghost">
              Все посты
            </Link>
          )}
        </Form>
        <SearchInput />
      </div>
    </div>
  )
}
