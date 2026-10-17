'use client'

import { useTransition } from 'react'
import { useCommentMutations } from '@/hooks/use-comment-mutations'
import { useCommentsStore } from '@/store/provider'
import { ConfirmDialog } from './confirm-dialog'

/**
 * Один диалог удаления на всё приложение. Какой комментарий удалять — берём из store,
 * поэтому карточке не нужно пробрасывать колбэки через родителей (нет prop drilling).
 */
export function DeleteDialog() {
  const comment = useCommentsStore((s) => s.commentToDelete)
  const requestDelete = useCommentsStore((s) => s.requestDelete)
  const { remove } = useCommentMutations()
  const [isDeleting, startDeleting] = useTransition()

  const confirm = () => {
    if (!comment) return
    startDeleting(async () => {
      await remove(comment)
      requestDelete(null)
    })
  }

  return (
    <ConfirmDialog
      open={comment !== null}
      title="Удалить комментарий?"
      pending={isDeleting}
      onConfirm={confirm}
      onCancel={() => requestDelete(null)}
    >
      Комментарий «{comment?.body}» будет удалён.
    </ConfirmDialog>
  )
}
