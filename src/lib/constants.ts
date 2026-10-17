// Общие константы — безопасно импортировать и на сервере, и на клиенте
export const PAGE_SIZE = 10
export const BODY_MAX_LENGTH = 500

// DummyJSON не сохраняет созданные записи и всегда отдаёт id = total + 1,
// поэтому локально созданным комментариям выдаём id из отдельного диапазона.
export const LOCAL_ID_START = 100_000

export const isLocalId = (id: number) => id >= LOCAL_ID_START

/** Разбор положительного целого из строки URL; всё остальное — null */
export function parsePositiveInt(value: string | string[] | null | undefined): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null
  const n = Number(value)
  return Number.isSafeInteger(n) && n > 0 ? n : null
}
