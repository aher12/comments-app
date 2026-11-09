import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { deleteCommentAction, updateCommentAction } from '@/lib/actions'
import { adminUser, comment, regularUser, renderWithStore } from '@/test/fixtures'
import type { Viewer } from '@/types/comment'
import { CommentCard } from '../comment-card'

// Мок: вместо настоящих Server Functions (сеть, сессия, DummyJSON) — функции-шпионы,
// по которым проверяем, что компонент вызвал нужный обработчик с нужными аргументами
vi.mock('@/lib/actions', () => ({
  updateCommentAction: vi.fn(),
  deleteCommentAction: vi.fn(),
}))

function renderCard(viewer: Viewer | null) {
  return renderWithStore(
    <ul>
      <CommentCard comment={comment} viewer={viewer} />
    </ul>,
  )
}

describe('CommentCard', () => {
  it('отображает переданные данные комментария', () => {
    renderCard(null)

    const card = screen.getByRole('article', { name: 'Комментарий #7' })
    expect(within(card).getByText('Emma Wilson')).toBeInTheDocument()
    expect(within(card).getByText(/@emmac/)).toBeInTheDocument()
    expect(within(card).getByText('Отличная статья, спасибо!')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'Пост #42' })).toHaveAttribute('href', '/?postId=42')
    expect(within(card).getByText('5')).toBeInTheDocument()
  })

  it('аноним только читает: нет кнопок лайка, изменения и удаления', () => {
    renderCard(null)

    expect(screen.queryByRole('button', { name: /нравится/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Изменить' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Удалить' })).not.toBeInTheDocument()
  })

  it('обычный пользователь может изменять, но не видит удаление (только для admin)', () => {
    renderCard(regularUser)

    expect(screen.getByRole('link', { name: 'Изменить' })).toHaveAttribute('href', '/comments/7/edit')
    expect(screen.queryByRole('button', { name: 'Удалить' })).not.toBeInTheDocument()
  })

  it('пользователь ставит лайк — вызывается Server Function с likes + 1', async () => {
    vi.mocked(updateCommentAction).mockResolvedValue({ ok: true, data: { likes: 6 } })
    const user = userEvent.setup()
    renderCard(regularUser)

    await user.click(screen.getByRole('button', { name: 'Нравится, сейчас 5' }))

    expect(updateCommentAction).toHaveBeenCalledWith(7, { likes: 6 })
  })

  it('администратор видит «Удалить» и может удалить комментарий после подтверждения', async () => {
    vi.mocked(deleteCommentAction).mockResolvedValue({ ok: true, data: { id: 7 } })
    const user = userEvent.setup()
    renderCard(adminUser)

    await user.click(screen.getByRole('button', { name: 'Удалить' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Отличная статья, спасибо!/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }))

    expect(deleteCommentAction).toHaveBeenCalledWith(7)
    expect(await screen.findByRole('status')).toHaveTextContent('Комментарий #7 удалён')
  })

  it('если сервер запретил удаление (403), показывает понятную ошибку', async () => {
    vi.mocked(deleteCommentAction).mockResolvedValue({ ok: false, status: 403, error: 'Недостаточно прав для этого действия' })
    const user = userEvent.setup()
    renderCard(adminUser)

    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Недостаточно прав для этого действия')
  })
})
