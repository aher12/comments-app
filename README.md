# Комментарии — лабораторная работа №3 (Zod, Auth.js, роли, тесты)

Вариант 7 — **Comments**. Продолжение ЛР1 и ЛР2: приложение на **Next.js 16 (App Router)**
с данными из [DummyJSON](https://dummyjson.com/docs/comments). В ЛР3 добавлены валидация данных (Zod),
вход и выход (Auth.js), роли `user` / `admin`, защита страниц и операций на сервере и компонентные тесты.

> DummyJSON только имитирует добавление/изменение/удаление и ничего не сохраняет.
> Поэтому результаты мутаций хранятся в клиентском store (Zustand + localStorage) поверх данных сервера.

## Запуск
```bash
npm install
cp .env.example .env.local   # и впишите AUTH_SECRET (npx auth secret)
npm run dev                  # http://localhost:3000
npm run test:run             # компонентные и unit-тесты
npm run coverage             # тесты + отчёт о покрытии (coverage/index.html)
npm run build && npm start   # production-сборка
```

Демо-доступ: **admin / admin123** (администратор), **user / user123** (пользователь).

## Роли и права
| Действие | Аноним | `user` | `admin` |
| --- | :-: | :-: | :-: |
| Просмотр списка и записи | ✓ | ✓ | ✓ |
| Создание (`/comments/new`), изменение (`/comments/[id]/edit`), лайк | — (→ `/login`) | ✓ | ✓ |
| Удаление | — (401) | — (403) | ✓ |

Матрица прав — `src/lib/permissions.ts`. Интерфейс по ней скрывает недоступные кнопки,
сервер по ней же проверяет права в каждой операции.

## Уровни защиты
1. **`src/proxy.ts`** — быстрый редирект анонима с `/comments/new` и `/comments/:id/edit` на `/login?callbackUrl=…`.
2. **Страницы** — `requireViewer()` из DAL (`src/lib/dal.ts`) ещё раз проверяет сессию и делает `redirect`.
3. **Server Functions и Route Handlers** — `checkPermission()` в `src/lib/comment-service.ts`:
   401 — не вошёл, 403 — нет права, 400 — данные не прошли Zod. Route Handlers отдают эти коды
   (`POST /api/comments`, `PATCH|DELETE /api/comments/:id`).

Сессия — JWT-стратегия Auth.js: зашифрованный токен в cookie `authjs.session-token`
(`httpOnly`, `sameSite=lax`, `secure` по HTTPS). Пароли хранятся только как bcrypt-хеши,
`AUTH_SECRET` — в `.env.local`, читается только в `server-only`-модуле `src/lib/env.ts`.

## Zod
`src/lib/schemas.ts` — общий модуль для клиента и сервера, типы выводятся через `z.infer`.
- `commentCreateSchema` / `commentUpdateSchema` — текст 3–500 символов, **без ссылок** (антиспам),
  `postId` — **существующий пост DummyJSON (1–251)**, лишние поля запрещены (`strictObject`),
  при изменении — хотя бы одно поле.
- `loginSchema` — логин и пароль.
- Внешние границы: ответы DummyJSON (`commentsPageSchema`, `commentSchema`…), параметры URL
  (`commentsQuerySchema`, `positiveIntParamSchema`, `callbackUrlSchema` — защита от открытого редиректа),
  сессия (`viewerSchema`), переменные окружения (`src/lib/env.ts`).

## Тесты
Vitest + React Testing Library + user-event, покрытие — `@vitest/coverage-v8`.
| Файл | Что проверяет |
| --- | --- |
| `components/__tests__/comment-card.test.tsx` | отображение данных; аноним без действий; `user` не видит «Удалить»; `admin` удаляет после подтверждения; ошибка 403 |
| `components/__tests__/comment-form.test.tsx` | сообщения Zod; правила предметной области; вызов обработчика с проверенными данными; ошибки сервера |
| `components/__tests__/login-form.test.tsx` | Zod-ошибки входа, отправка в Server Function |
| `components/__tests__/comments-feed.test.tsx` | список, поиск, пустое состояние |
| `components/__tests__/create-edit-forms.test.tsx` | создание и изменение через Server Function |
| `lib/__tests__/schemas.test.ts` | unit-тесты схем и прав |

## Структура (новое в ЛР3)
```
src/
├── auth.ts                       # Auth.js: Credentials, JWT-сессия, роль в токене
├── proxy.ts                      # оптимистичный редирект на /login
├── app/
│   ├── login/page.tsx            # вход
│   ├── comments/new/page.tsx     # создание (только для вошедших)
│   ├── comments/[id]/edit/       # изменение (только для вошедших)
│   └── api/auth/[...nextauth]/   # эндпоинты Auth.js
├── lib/
│   ├── schemas.ts                # Zod-схемы + типы через z.infer
│   ├── env.ts                    # проверка переменных окружения
│   ├── permissions.ts            # матрица прав ролей
│   ├── dal.ts                    # текущий пользователь, requireViewer, checkPermission
│   ├── comment-service.ts        # права → Zod → DummyJSON (общий для actions и API)
│   └── users.ts                  # учётные записи (bcrypt-хеши)
├── components/
│   ├── comment-form.tsx          # форма с Zod-ошибками у полей
│   ├── login-form.tsx, user-menu.tsx, access-denied.tsx
│   └── __tests__/                # компонентные тесты
└── test/                         # тестовые данные и хелперы
```

Скриншоты — в папке `screenshots/` (21–31 — ЛР3).
