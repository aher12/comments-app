'use client'

import { useActionState, useRef, useState } from 'react'
import { createCommentAction } from '@/lib/actions'
import { BODY_MAX_LENGTH } from '@/lib/constants'
import { useCommentsStore } from '@/store/provider'
import type { ActionResult, Comment, CommentUser } from '@/types/comment'

type FormState = Extract<ActionResult<Comment>, { ok: false }> | null

/**
 * Форма создания. Отправка — Server Action через useActionState (даёт pending и результат).
 * Список авторов приходит пропсом из Server Component.
 */
export function CommentForm({ users }: { users: CommentUser[] }) {
  const addCreated = useCommentsStore((s) => s.addCreated)
  const showToast = useCommentsStore((s) => s.showToast)
  const [body, setBody] = useState('')
  const [postId, setPostId] = useState(1)
  const [userId, setUserId] = useState(users[0]?.id ?? 1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(async (_prev, formData) => {
    const result = await createCommentAction(formData)
    if (!result.ok) {
      showToast('error', result.error)
      return result
    }
    // DummyJSON вернул созданную запись, но не сохранил её — кладём в store
    const saved = addCreated(result.data)
    showToast('success', `Комментарий #${saved.id} добавлен`)
    setBody('')
    textareaRef.current?.focus()
    return null
  }, null)

  const fieldErrors = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="card bg-base-100 shadow">
      <fieldset className="card-body gap-3">
        <h2 className="card-title">Новый комментарий</h2>
        <div>
          <textarea
            ref={textareaRef}
            name="body"
            className={`textarea w-full ${fieldErrors.body ? 'textarea-error' : ''}`}
            placeholder="Текст комментария…"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX_LENGTH}
            aria-label="Текст комментария"
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-error">{fieldErrors.body}</span>
            <span className="text-base-content/50">
              {body.length}/{BODY_MAX_LENGTH}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select name="userId" className="select sm:flex-1" value={userId} onChange={(e) => setUserId(Number(e.target.value))} aria-label="Автор">
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} (@{u.username})
              </option>
            ))}
          </select>
          <label className={`input sm:w-36 shrink-0 ${fieldErrors.postId ? 'input-error' : ''}`}>
            <span className="label">postId</span>
            <input name="postId" type="number" min={1} value={postId} onChange={(e) => setPostId(Number(e.target.value))} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isPending || !body.trim()}>
            {isPending && <span className="loading loading-spinner loading-sm" />}
            {isPending ? 'Отправка…' : 'Опубликовать'}
          </button>
        </div>
        {fieldErrors.postId && <span className="text-error text-xs">{fieldErrors.postId}</span>}
      </fieldset>
    </form>
  )
}
