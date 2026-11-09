'use client'

import { useId, useState, useTransition, type FormEvent } from 'react'
import { BODY_MAX_LENGTH, POSTS_TOTAL } from '@/lib/constants'
import { commentCreateSchema, toFieldErrors, type FieldErrors } from '@/lib/schemas'
import type { ActionResult, CommentInput } from '@/types/comment'

interface CommentFormProps {
  defaultValues?: { body?: string; postId?: number }
  submitLabel: string
  pendingLabel?: string
  /** Вызывается только с данными, прошедшими Zod-проверку. Сервер проверит их ещё раз */
  onSubmit: (values: CommentInput) => Promise<ActionResult<unknown>>
  onCancel?: () => void
}

/**
 * Форма комментария — одна для создания и изменения.
 * Ввод проверяется той же Zod-схемой, что и на сервере: ошибка сразу видна рядом с полем.
 * Ошибки, которые вернул сервер (400/401/403), показываются так же.
 */
export function CommentForm({ defaultValues, submitLabel, pendingLabel = 'Сохранение…', onSubmit, onCancel }: CommentFormProps) {
  const id = useId()
  const [body, setBody] = useState(defaultValues?.body ?? '')
  const [postId, setPostId] = useState(String(defaultValues?.postId ?? 1))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const parsed = commentCreateSchema.safeParse({ body, postId })
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }
    setErrors({})

    startTransition(async () => {
      const result = await onSubmit(parsed.data)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        setFormError(result.error)
      }
    })
  }

  const bodyId = `${id}-body`
  const postIdId = `${id}-postId`

  return (
    <form onSubmit={submit} noValidate className="card bg-base-100 shadow">
      <fieldset className="card-body gap-4" disabled={isPending}>
        <div className="flex flex-col gap-1">
          <label htmlFor={bodyId} className="font-medium">
            Текст комментария
          </label>
          <textarea
            id={bodyId}
            name="body"
            className={`textarea w-full ${errors.body ? 'textarea-error' : ''}`}
            placeholder="Что вы думаете об этом посте?"
            rows={4}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setErrors((prev) => ({ ...prev, body: undefined }))
            }}
            aria-invalid={errors.body ? true : undefined}
            aria-describedby={errors.body ? `${bodyId}-error` : undefined}
          />
          <div className="flex justify-between gap-2 text-sm">
            <span id={`${bodyId}-error`} className="text-error">
              {errors.body}
            </span>
            <span className={body.length > BODY_MAX_LENGTH ? 'text-error' : 'text-base-content/50'}>
              {body.length}/{BODY_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={postIdId} className="font-medium">
            Номер поста
          </label>
          <input
            id={postIdId}
            name="postId"
            type="number"
            inputMode="numeric"
            className={`input w-full sm:w-48 ${errors.postId ? 'input-error' : ''}`}
            value={postId}
            onChange={(e) => {
              setPostId(e.target.value)
              setErrors((prev) => ({ ...prev, postId: undefined }))
            }}
            aria-invalid={errors.postId ? true : undefined}
            aria-describedby={`${postIdId}-hint`}
          />
          <span id={`${postIdId}-hint`} className={`text-sm ${errors.postId ? 'text-error' : 'text-base-content/50'}`}>
            {errors.postId ?? `От 1 до ${POSTS_TOTAL}`}
          </span>
        </div>

        {formError && (
          <div role="alert" className="alert alert-error alert-soft">
            <span>{formError}</span>
          </div>
        )}

        <div className="card-actions justify-end">
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Отмена
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {isPending && <span className="loading loading-spinner loading-sm" />}
            {isPending ? pendingLabel : submitLabel}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
