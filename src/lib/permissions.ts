import type { Role, Viewer } from './schemas'

/**
 * Матрица прав. Модуль общий: интерфейс по нему скрывает недоступные кнопки,
 * а сервер (lib/dal.ts) по нему же проверяет права перед каждой мутацией.
 * Скрытая кнопка — только удобство; защищает данные именно серверная проверка.
 *
 *  аноним — только просмотр;
 *  user   — просмотр, создание, изменение, лайки;
 *  admin  — всё, что может user, и удаление.
 */
export type Permission = 'comment:create' | 'comment:update' | 'comment:delete'

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: ['comment:create', 'comment:update'],
  admin: ['comment:create', 'comment:update', 'comment:delete'],
}

export function can(viewer: Viewer | null | undefined, permission: Permission): boolean {
  return viewer ? PERMISSIONS[viewer.role].includes(permission) : false
}

export const ROLE_LABEL: Record<Role, string> = {
  user: 'пользователь',
  admin: 'администратор',
}
