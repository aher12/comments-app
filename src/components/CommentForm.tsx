import { useRef, useState, type FormEvent } from 'react'
import { mockUsers } from '../data/mockComments'
import type { CommentDraft } from '../types/comment'

interface CommentFormProps {
  onAdd: (draft: CommentDraft) => void
}

/** Управляемая форма создания комментария: значения полей живут в состоянии React. */
export function CommentForm({ onAdd }: CommentFormProps) {
  const [body, setBody] = useState('')
  const [postId, setPostId] = useState(1)
  const [userId, setUserId] = useState(mockUsers[0].id)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = body.trim()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!trimmed) return
    const user = mockUsers.find((u) => u.id === userId) ?? mockUsers[0]
    onAdd({ body: trimmed, postId, user })
    setBody('')
    // useRef даёт прямой доступ к DOM-узлу — возвращаем фокус для следующего комментария
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow">
      <div className="card-body gap-3">
        <h2 className="card-title">Новый комментарий</h2>
        <textarea
          ref={textareaRef}
          className="textarea w-full"
          placeholder="Текст комментария…"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="select sm:flex-1" value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
            {mockUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} (@{u.username})
              </option>
            ))}
          </select>
          <label className="input sm:w-36 shrink-0">
            <span className="label">postId</span>
            <input
              type="number"
              min={1}
              value={postId}
              onChange={(e) => setPostId(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!trimmed}>
            Опубликовать
          </button>
        </div>
      </div>
    </form>
  )
}
