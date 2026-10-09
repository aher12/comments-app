import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Модальное окно подтверждения на основе нативного <dialog> (стили DaisyUI modal). */
export function ConfirmDialog({ open, title, children, confirmLabel = 'Удалить', onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Синхронизируем декларативный проп open с императивным API <dialog>
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="modal" onClose={onCancel}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>Отмена</button>
          <button className="btn btn-error" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>закрыть</button>
      </form>
    </dialog>
  )
}
