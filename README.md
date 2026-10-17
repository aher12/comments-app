# Комментарии — лабораторная работа №2 (Next.js)

Вариант 7 — **Comments**. Продолжение ЛР1: приложение перенесено на **Next.js 16 (App Router)**,
данные получаются из [DummyJSON](https://dummyjson.com/docs/comments) через API, а не из локального массива.

> DummyJSON только имитирует добавление/изменение/удаление и ничего не сохраняет.
> Поэтому результаты мутаций хранятся в клиентском store (Zustand + localStorage) поверх данных сервера.
> Кнопка «Сбросить» в шапке возвращает исходные данные.

## Стек
Next.js 16.4 (App Router, Cache Components), React 19, TypeScript, TanStack Query 5, Zustand 5,
TailwindCSS 4, DaisyUI 5.

## Запуск
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production-сборка
npm start        # запуск собранной версии
```

## Что реализовано
| Требование | Где |
| --- | --- |
| Список записей | `app/page.tsx` → `CommentsFeed` |
| Страница записи (динамический маршрут) | `app/comments/[id]/page.tsx` |
| Фильтр по посту (в URL `?postId=`) + поиск по тексту/автору | `CommentFilters`, `SearchInput` |
| Infinite query «Загрузить ещё» (`limit`/`skip`, без дублей, конец списка по `total`) | `CommentsFeed` + `GET /api/comments` |
| Добавление / изменение / удаление | Server Actions в `lib/actions.ts` |
| Optimistic update (лайк, изменение) с откатом при ошибке | `hooks/use-comment-mutations.ts` |
| Состояния: загрузка, данные, пусто, ошибка, повторная загрузка, отправка мутации | `loading.tsx`, `<Suspense>` + скелетоны, `error.tsx`, `catchError`, бейджи pending |
| Общее клиентское состояние | Zustand: `store/comments-store.ts` |
| Кэширование | `'use cache'` + `cacheLife` + `cacheTag`, сброс через `updateTag` |

## Структура
```
src/
├── app/
│   ├── layout.tsx              # корневой layout (Server) + Providers
│   ├── page.tsx                # список (Server): Suspense-секции формы, фильтров и ленты
│   ├── loading.tsx / error.tsx / not-found.tsx
│   ├── comments/[id]/          # страница записи + not-found
│   └── api/comments/           # Route Handlers: GET список, GET /:id
├── lib/
│   ├── comments-api.ts         # 'server-only': единственный слой работы с DummyJSON (+ кэш)
│   ├── actions.ts              # 'use server': create/update/delete — вызывают comments-api
│   └── constants.ts            # общие константы (клиент и сервер)
├── store/                      # Zustand store + провайдер (persist, devtools)
├── hooks/use-comment-mutations.ts
├── components/                 # UI; 'use client' только там, где есть состояние/события
└── types/comment.ts
```

Server Components: `layout`, `page`, `CommentFilters`, `RelatedComments`, `UserAvatar`, скелетоны.
Client Components: `CommentsFeed`, `CommentCard`, `CommentForm`, `CommentDetail`, `SearchInput`,
`DeleteDialog`, `Toaster`, `LocalChanges`, `SubmitButton`, `Providers`, `error.tsx`.

Скриншоты всех состояний — в папке `screenshots/`.
