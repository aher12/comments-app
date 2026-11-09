import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createCommentAction, updateCommentAction } from '@/lib/actions'
import { CommentsStoreProvider } from '@/store/provider'
import { comment } from '@/test/data'
import { CreateCommentForm } from '../create-comment-form'
import { EditCommentForm } from '../edit-comment-form'

vi.mock('@/lib/actions', () => ({ createCommentAction: vi.fn(), updateCommentAction: vi.fn() }))

// Фейковый роутер Next.js: в тесте нет App Router, запоминаем переходы
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, back: vi.fn() }) }))

describe('CreateCommentForm', () => {
  it('отправляет проверенные данные в Server Function и переходит к списку поста', async () => {
    vi.mocked(createCommentAction).mockResolvedValue({ ok: true, data: { ...comment, id: 341, likes: 0, postId: 6 } })
    const user = userEvent.setup()
    render(
      <CommentsStoreProvider>
        <CreateCommentForm defaultPostId={6} />
      </CommentsStoreProvider>,
    )

    await user.type(screen.getByLabelText('Текст комментария'), 'Первый!!! Отличная мысль')
    await user.click(screen.getByRole('button', { name: 'Опубликовать' }))

    expect(createCommentAction).toHaveBeenCalledWith({ body: 'Первый!!! Отличная мысль', postId: 6 })
    expect(push).toHaveBeenCalledWith('/?postId=6')
  })
})

describe('EditCommentForm', () => {
  it('открывается с текущим текстом и сохраняет изменения', async () => {
    vi.mocked(updateCommentAction).mockResolvedValue({ ok: true, data: { body: 'Исправленный текст', postId: 42 } })
    const user = userEvent.setup()
    render(
      <CommentsStoreProvider>
        <EditCommentForm id={7} initial={comment} />
      </CommentsStoreProvider>,
    )

    const body = await screen.findByLabelText('Текст комментария')
    expect(body).toHaveValue('Отличная статья, спасибо!')

    await user.clear(body)
    await user.type(body, 'Исправленный текст')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(updateCommentAction).toHaveBeenCalledWith(7, { body: 'Исправленный текст', postId: 42 })
    expect(push).toHaveBeenCalledWith('/comments/7')
  })
})
