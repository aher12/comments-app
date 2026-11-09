import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ActionResult } from '@/types/comment'
import { CommentForm } from '../comment-form'

// Стаб: обработчик просто возвращает заранее заданный ответ «сервера»
const ok = (): Promise<ActionResult<unknown>> => Promise.resolve({ ok: true, data: null })

function renderForm(onSubmit = vi.fn(ok), defaultValues?: { body?: string; postId?: number }) {
  render(<CommentForm submitLabel="Опубликовать" onSubmit={onSubmit} defaultValues={defaultValues} />)
  return {
    onSubmit,
    body: screen.getByLabelText('Текст комментария'),
    postId: screen.getByLabelText('Номер поста'),
    submit: screen.getByRole('button', { name: 'Опубликовать' }),
  }
}

describe('CommentForm', () => {
  it('показывает сообщение Zod, если текст пустой, и не вызывает обработчик', async () => {
    const user = userEvent.setup()
    const { onSubmit, body, submit } = renderForm()

    await user.type(body, '   ')
    await user.click(submit)

    expect(screen.getByText('Введите текст комментария')).toBeInTheDocument()
    expect(body).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('проверяет правила предметной области: ссылки запрещены, пост должен существовать', async () => {
    const user = userEvent.setup()
    const { onSubmit, body, postId, submit } = renderForm()

    await user.type(body, 'Заходите на https://spam.example')
    await user.clear(postId)
    await user.type(postId, '300')
    await user.click(submit)

    expect(screen.getByText('Ссылки в комментариях запрещены')).toBeInTheDocument()
    expect(screen.getByText('Такого поста нет: в DummyJSON всего 251 постов')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('при корректном вводе вызывает обработчик с проверенными данными', async () => {
    const user = userEvent.setup()
    const { onSubmit, body, postId, submit } = renderForm()

    await user.type(body, '  Очень полезный пост  ')
    await user.clear(postId)
    await user.type(postId, '12')
    await user.click(submit)

    // trim и преобразование строки в число сделала схема
    expect(onSubmit).toHaveBeenCalledWith({ body: 'Очень полезный пост', postId: 12 })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('показывает ошибки, которые вернул сервер (например, 401)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(
      (): Promise<ActionResult<unknown>> =>
        Promise.resolve({ ok: false, status: 401, error: 'Войдите в систему, чтобы выполнить это действие' }),
    )
    const { body, submit } = renderForm(onSubmit)

    await user.type(body, 'Нормальный комментарий')
    await user.click(submit)

    expect(await screen.findByRole('alert')).toHaveTextContent('Войдите в систему, чтобы выполнить это действие')
  })

  it('в режиме изменения заполняет поля текущими значениями', () => {
    const { body, postId } = renderForm(undefined, { body: 'Старый текст', postId: 42 })

    expect(body).toHaveValue('Старый текст')
    expect(postId).toHaveValue(42)
  })
})
