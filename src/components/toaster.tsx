'use client'

import { useEffect } from 'react'
import { useCommentsStore } from '@/store/provider'

/** Уведомление о результате мутации; любое место приложения показывает его через store.showToast */
export function Toaster() {
  const toast = useCommentsStore((s) => s.toast)
  const hideToast = useCommentsStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(hideToast, 3500)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  if (!toast) return null

  return (
    <div className="toast toast-end toast-bottom z-50">
      <div role="status" className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
        <span>{toast.text}</span>
        <button className="btn btn-xs btn-ghost" onClick={hideToast} aria-label="Закрыть">
          ✕
        </button>
      </div>
    </div>
  )
}
