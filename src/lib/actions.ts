'use server'

import { updateTag } from 'next/cache'
import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import { COMMENTS_TAG, commentTag } from './comments-api'
import { createComment, editComment, removeComment } from './comment-service'
import { callbackUrlSchema, loginSchema, toFieldErrors, type FieldErrors } from './schemas'
import type { ActionResult, Comment, CommentChanges } from '@/types/comment'

/**
 * Server Functions (Server Actions). Клиент получает только ссылку на функцию,
 * но вызвать её может кто угодно и с любыми аргументами (это обычный POST-запрос),
 * поэтому права и данные проверяются здесь заново — в comment-service.ts.
 */

export async function createCommentAction(input: unknown): Promise<ActionResult<Comment>> {
  const result = await createComment(input)
  // Сбрасываем кэш списка: следующий запрос получит свежие данные (read-your-own-writes)
  if (result.ok) updateTag(COMMENTS_TAG)
  return result
}

export async function updateCommentAction(id: unknown, changes: unknown): Promise<ActionResult<CommentChanges>> {
  const result = await editComment(id, changes)
  if (result.ok && typeof id === 'number') updateTag(commentTag(id))
  return result
}

export async function deleteCommentAction(id: unknown): Promise<ActionResult<{ id: number }>> {
  const result = await removeComment(id)
  if (result.ok) updateTag(commentTag(result.data.id))
  return result
}

// ---------- Вход и выход ----------

export type LoginState = { error: string; fieldErrors?: FieldErrors; username?: string } | null

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const rawUsername = formData.get('username')
  const username = typeof rawUsername === 'string' ? rawUsername : ''
  const parsed = loginSchema.safeParse({ username: rawUsername, password: formData.get('password') })
  if (!parsed.success) {
    return { error: 'Проверьте поля формы', fieldErrors: toFieldErrors(parsed.error), username }
  }

  // Куда вернуть после входа — только внутренний путь (иначе '/')
  const redirectTo = callbackUrlSchema.parse(formData.get('callbackUrl'))

  try {
    // При успехе signIn ставит cookie сессии и бросает redirect — до return дело не дойдёт
    await signIn('credentials', { ...parsed.data, redirectTo })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'Неверный логин или пароль', username }
    throw e // redirect() — тоже исключение, его нужно пробросить дальше
  }
  return null
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
