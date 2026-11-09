// Общие константы — безопасно импортировать и на сервере, и на клиенте
export const PAGE_SIZE = 10
export const PAGE_SIZE_MAX = 50

export const BODY_MIN_LENGTH = 3
export const BODY_MAX_LENGTH = 500

// В DummyJSON 251 пост (GET /posts → total: 251). Комментарий к несуществующему посту — ошибка.
export const POSTS_TOTAL = 251

// DummyJSON не сохраняет созданные записи и всегда отдаёт id = total + 1,
// поэтому локально созданным комментариям выдаём id из отдельного диапазона.
export const LOCAL_ID_START = 100_000

export const isLocalId = (id: number) => id >= LOCAL_ID_START
