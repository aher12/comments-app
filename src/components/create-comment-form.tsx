'use client'

import { useRouter } from 'next/navigation'
import { createCommentAction } from '@/lib/actions'
import { useCommentsStore } from '@/store/provider'
import { CommentForm } from './comment-form'

/** Страница /comments/new: отправляет форму в Server Function и кладёт результат в store */
export function CreateCommentForm({ defaultPostId }: { defaultPostId?: number }) {
  const router = useRouter()
  const addCreated = useCommentsStore((s) => s.addCreated)
  const showToast = useCommentsStore((s) => s.showToast)

  return (
    <CommentForm
      defaultValues={{ postId: defaultPostId }}
      submitLabel="Опубликовать"
      pendingLabel="Отправка…"
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        const result = await createCommentAction(values)
        if (result.ok) {
          // DummyJSON вернул созданную запись, но не сохранил её — кладём в store
          const saved = addCreated(result.data)
          showToast('success', `Комментарий #${saved.id} добавлен`)
          router.push(`/?postId=${saved.postId}`)
        }
        return result
      }}
    />
  )
}
