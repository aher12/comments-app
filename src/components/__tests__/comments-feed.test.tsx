import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { comment, regularUser } from '@/test/data'
import { CommentsStoreProvider } from '@/store/provider'
import type { CommentsPage } from '@/types/comment'
import { CommentsFeed } from '../comments-feed'
import { SearchInput } from '../search-input'

vi.mock('@/lib/actions', () => ({ updateCommentAction: vi.fn(), deleteCommentAction: vi.fn() }))

const page: CommentsPage = {
  comments: [comment, { ...comment, id: 8, body: 'Не согласен с автором', user: { id: 17, username: 'evelyns', fullName: 'Evelyn Sanchez' } }],
  total: 2,
  skip: 0,
  limit: 10,
}

function renderFeed(initialPage: CommentsPage, postId: number | null = null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  render(
    <QueryClientProvider client={client}>
      <CommentsStoreProvider>
        <SearchInput />
        <CommentsFeed initialPage={initialPage} postId={postId} viewer={regularUser} />
      </CommentsStoreProvider>
    </QueryClientProvider>,
  )
}

describe('CommentsFeed', () => {
  it('показывает комментарии первой страницы и счётчик', () => {
    renderFeed(page)

    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText(/загружено 2 из 2/)).toBeInTheDocument()
    expect(screen.getByText('Это все комментарии')).toBeInTheDocument()
  })

  it('поиск по тексту и автору фильтрует загруженные комментарии', async () => {
    const user = userEvent.setup()
    renderFeed(page)

    await user.type(screen.getByPlaceholderText(/Поиск/), 'evelyn')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Не согласен с автором')).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/Поиск/))
    await user.type(screen.getByPlaceholderText(/Поиск/), 'нет такого')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByText(/ничего не найдено/)).toBeInTheDocument()
  })

  it('показывает пустое состояние, если у поста нет комментариев', () => {
    renderFeed({ comments: [], total: 0, skip: 0, limit: 10 }, 99)

    expect(screen.getByText('У поста #99 пока нет комментариев')).toBeInTheDocument()
  })
})
