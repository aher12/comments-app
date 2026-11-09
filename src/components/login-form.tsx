'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { loginAction } from '@/lib/actions'
import { loginSchema, toFieldErrors, type FieldErrors } from '@/lib/schemas'

/**
 * Форма входа. Отправка — Server Function через useActionState (работает и без JS).
 * Перед отправкой поля проверяются Zod-схемой в браузере; сервер проверяет их снова.
 * Пароль уходит только в POST-запросе и нигде на клиенте не сохраняется.
 */
export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null)

  const validate = (e: FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget)
    const parsed = loginSchema.safeParse({ username: data.get('username'), password: data.get('password') })
    if (!parsed.success) {
      e.preventDefault() // не отправляем заведомо неверные данные
      setClientErrors(toFieldErrors(parsed.error))
    } else {
      setClientErrors(null)
    }
  }

  const errors = clientErrors ?? state?.fieldErrors ?? {}
  const serverError = clientErrors ? null : state?.error

  return (
    <form action={formAction} onSubmit={validate} noValidate className="card bg-base-100 shadow w-full">
      <fieldset className="card-body gap-4" disabled={isPending}>
        <h1 className="card-title text-2xl">Вход</h1>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="flex flex-col gap-1">
          <label htmlFor="login-username" className="font-medium">
            Логин
          </label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            defaultValue={state?.username}
            className={`input w-full ${errors.username ? 'input-error' : ''}`}
            aria-invalid={errors.username ? true : undefined}
            aria-describedby="login-username-error"
          />
          <span id="login-username-error" className="text-error text-sm">
            {errors.username}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="login-password" className="font-medium">
            Пароль
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`input w-full ${errors.password ? 'input-error' : ''}`}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby="login-password-error"
          />
          <span id="login-password-error" className="text-error text-sm">
            {errors.password}
          </span>
        </div>

        {serverError && (
          <div role="alert" className="alert alert-error alert-soft">
            <span>{serverError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          {isPending && <span className="loading loading-spinner loading-sm" />}
          {isPending ? 'Вход…' : 'Войти'}
        </button>
      </fieldset>
    </form>
  )
}
