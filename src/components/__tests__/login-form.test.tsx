import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { loginAction } from '@/lib/actions'
import { LoginForm } from '../login-form'

vi.mock('@/lib/actions', () => ({ loginAction: vi.fn() }))

describe('LoginForm', () => {
  it('не отправляет пустую форму и показывает сообщения Zod', async () => {
    const user = userEvent.setup()
    render(<LoginForm callbackUrl="/" />)

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByText('Введите логин')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
    expect(loginAction).not.toHaveBeenCalled()
  })

  it('отправляет данные в Server Function и показывает ошибку входа', async () => {
    vi.mocked(loginAction).mockResolvedValue({ error: 'Неверный логин или пароль', username: 'user' })
    const user = userEvent.setup()
    render(<LoginForm callbackUrl="/comments/new" />)

    await user.type(screen.getByLabelText('Логин'), 'user')
    await user.type(screen.getByLabelText('Пароль'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный логин или пароль')
    const formData = vi.mocked(loginAction).mock.calls[0][1]
    expect(formData.get('username')).toBe('user')
    expect(formData.get('callbackUrl')).toBe('/comments/new')
  })
})
