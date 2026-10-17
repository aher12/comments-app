'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Модальное окно подтверждения на нативном <dialog> (стили DaisyUI modal) */
export function ConfirmDialog({ open, title, children, confirmLabel = 'Удалить', pending = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Синхронизируем декларативный проп open с императивным API <dialog>
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(e) => {
        e.preventDefault() // Esc: закрываем через состояние, а не сам dialog
        if (!pending) onCancel()
      }}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel} disabled={pending}>
            Отмена
          </button>
          <button className="btn btn-error" onClick={onConfirm} disabled={pending}>
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? 'Удаление…' : confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={() => !pending && onCancel()} />
    </dialog>
  )
}
