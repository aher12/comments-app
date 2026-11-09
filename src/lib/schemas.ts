import { z } from 'zod'
import { BODY_MAX_LENGTH, BODY_MIN_LENGTH, PAGE_SIZE, PAGE_SIZE_MAX, POSTS_TOTAL } from './constants'

/**
 * Zod-схемы приложения. Модуль общий для клиента и сервера:
 *  - форма проверяет ввод этими же схемами, чтобы сразу показать ошибку рядом с полем;
 *  - Server Functions и Route Handlers проверяют данные повторно перед мутацией;
 *  - ответы DummyJSON и параметры URL тоже проходят через схемы (внешние границы).
 * TypeScript-типы получаем из схем через z.infer — схема единственный источник правды.
 */

// ---------- Роли ----------

export const ROLES = ['user', 'admin'] as const
export const roleSchema = z.enum(ROLES)
export type Role = z.infer<typeof roleSchema>

// ---------- Ответы DummyJSON (внешняя граница) ----------

const id = z.number().int().positive()

/** Сообщение о лишних полях для strictObject */
const noExtraKeys = {
  error: (issue: { code?: string; keys?: string[] }) =>
    issue.code === 'unrecognized_keys' ? `Недопустимые поля: ${issue.keys?.join(', ')}` : undefined,
}

/** id записи в аргументах Server Function / Route Handler */
export const commentIdSchema = z.number({ error: 'Некорректный id' }).int('Некорректный id').positive('Некорректный id')

export const commentUserSchema = z.object({
  id,
  username: z.string().min(1),
  fullName: z.string().min(1),
})

export const commentSchema = z.object({
  id,
  body: z.string(),
  postId: id,
  likes: z.number().int().nonnegative(),
  user: commentUserSchema,
})

/** POST /comments/add отвечает без поля likes — у нового комментария их 0 */
export const createdCommentSchema = commentSchema.extend({
  likes: z.number().int().nonnegative().default(0),
})

export const deletedCommentSchema = z.object({ id, isDeleted: z.literal(true) })

export const commentsPageSchema = z.object({
  comments: z.array(commentSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
})

/** Тело ошибки DummyJSON: { message: "..." } */
export const apiErrorSchema = z.object({ message: z.string() })

export type CommentUser = z.infer<typeof commentUserSchema>
export type Comment = z.infer<typeof commentSchema>
export type CommentsPage = z.infer<typeof commentsPageSchema>

// ---------- Ввод пользователя: создание и изменение комментария ----------

// Правило предметной области: ссылки в комментариях запрещены (защита от спама)
const LINK_RE = /(https?:\/\/|www\.)\S+/i

export const commentBodySchema = z
  .string({ error: 'Введите текст комментария' })
  .trim()
  .min(1, 'Введите текст комментария')
  .min(BODY_MIN_LENGTH, `Комментарий должен быть не короче ${BODY_MIN_LENGTH} символов`)
  .max(BODY_MAX_LENGTH, `Не больше ${BODY_MAX_LENGTH} символов`)
  .refine((body) => !LINK_RE.test(body), 'Ссылки в комментариях запрещены')

// Правило предметной области: комментарий можно оставить только к существующему посту DummyJSON.
// coerce — в форме значение приходит строкой из <input type="number">.
export const postIdSchema = z.coerce
  .number({ error: 'Укажите номер поста' })
  .int('Номер поста — целое число')
  .min(1, 'Номер поста — от 1')
  .max(POSTS_TOTAL, `Такого поста нет: в DummyJSON всего ${POSTS_TOTAL} постов`)

/** Создание. strictObject: лишние поля (user, likes, id…) клиент подсунуть не сможет */
export const commentCreateSchema = z.strictObject(
  {
    body: commentBodySchema,
    postId: postIdSchema,
  },
  noExtraKeys,
)

/** Изменение: любые из полей, но хотя бы одно */
export const commentUpdateSchema = z
  .strictObject(
    {
      body: commentBodySchema,
      postId: postIdSchema,
      likes: z.number().int().nonnegative('Лайков не может быть меньше нуля'),
    },
    noExtraKeys,
  )
  .partial()
  .refine((changes) => Object.values(changes).some((v) => v !== undefined), 'Нет изменений для сохранения')

/** Значения полей формы (до coerce/trim) и результат проверки */
export type CommentFormValues = z.input<typeof commentCreateSchema>
export type CommentInput = z.output<typeof commentCreateSchema>
export type CommentChanges = z.output<typeof commentUpdateSchema>

// ---------- Вход ----------

export const loginSchema = z.object({
  username: z
    .string({ error: 'Введите логин' })
    .trim()
    .min(1, 'Введите логин')
    .max(32, 'Логин слишком длинный')
    .regex(/^[a-z0-9_]+$/i, 'Логин — латинские буквы, цифры и _'),
  password: z.string({ error: 'Введите пароль' }).min(1, 'Введите пароль').min(6, 'Пароль — не короче 6 символов').max(72),
})
export type LoginInput = z.infer<typeof loginSchema>

/** Текущий пользователь, которого знает интерфейс (без секретов) */
export const viewerSchema = z.object({
  id: z.coerce.number().int().positive(), // id автора в DummyJSON
  username: z.string().min(1),
  name: z.string().min(1),
  role: roleSchema,
})
export type Viewer = z.infer<typeof viewerSchema>

// ---------- Параметры URL (внешняя граница) ----------

/** Положительное целое из строки URL: "42" → 42; "abc", "-1", "1.5", "" → ошибка */
export const positiveIntParamSchema = z
  .string()
  .regex(/^\d+$/, 'Ожидается целое число')
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER))

/** GET /api/comments?skip=0&limit=10&postId=6 */
export const commentsQuerySchema = z.object({
  skip: z.coerce.number().int().min(0, 'skip ≥ 0').default(0),
  limit: z.coerce.number().int().min(1, 'limit ≥ 1').max(PAGE_SIZE_MAX, `limit ≤ ${PAGE_SIZE_MAX}`).default(PAGE_SIZE),
  postId: positiveIntParamSchema.nullable().default(null),
})

/**
 * Адрес возврата после входа (?callbackUrl=). Разрешаем только пути внутри приложения,
 * иначе ссылка вида /login?callbackUrl=https://evil.site стала бы открытым редиректом.
 */
export const callbackUrlSchema = z
  .string()
  .refine((url) => url.startsWith('/') && !url.startsWith('//') && !url.includes('\\'), 'Недопустимый адрес возврата')
  .catch('/')

/** Разбор положительного целого из searchParams/params; всё остальное — null */
export function parsePositiveInt(value: string | string[] | null | undefined): number | null {
  const result = positiveIntParamSchema.safeParse(value)
  return result.success ? result.data : null
}

// ---------- Ошибки формы ----------

export type FieldErrors = Partial<Record<string, string>>

/** Первая ошибка каждого поля — её и показываем рядом с полем */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: Record<string, string[] | undefined> = z.flattenError(error).fieldErrors
  return Object.fromEntries(Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]))
}

/** Общая ошибка схемы (refine на уровне объекта, лишние поля) */
export function toFormError(error: z.ZodError): string | undefined {
  return z.flattenError(error).formErrors[0]
}
