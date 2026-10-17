'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

/** Кнопка отправки, которая знает о состоянии родительской формы (в т.ч. next/form-навигации) */
export function SubmitButton({ children, pendingText }: { children: ReactNode; pendingText: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending && <span className="loading loading-spinner loading-sm" />}
      {pending ? pendingText : children}
    </button>
  )
}
