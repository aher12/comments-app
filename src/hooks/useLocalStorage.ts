import { useEffect, useState } from 'react'

/**
 * Как useState, но значение сохраняется в localStorage и переживает перезагрузку страницы.
 * Начальное значение вычисляется лениво (функция в useState вызывается только один раз).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? (JSON.parse(saved) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Побочный эффект: синхронизация с localStorage после каждого изменения value
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // хранилище недоступно (приватный режим) — работаем только в памяти
    }
  }, [key, value])

  return [value, setValue] as const
}
