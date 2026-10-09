# Комментарии — лабораторная работа №1 (React)

Вариант 7 — **Comments** (формат данных: https://dummyjson.com/docs/comments).

SPA на React + TypeScript для просмотра, создания, редактирования и удаления комментариев.
Данные хранятся локально (моки в формате dummyjson + сохранение в `localStorage`), API пока не используется.

## Стек
React 19, TypeScript, Vite, TailwindCSS 4, DaisyUI 5.

## Запуск
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production-сборка в dist/
```

## Возможности
- список комментариев карточками (автор, пост, текст, лайки);
- создание комментария (текст, автор, postId);
- редактирование текста и postId прямо в карточке (Esc — отмена);
- удаление с подтверждением в модальном окне;
- лайки, статистика (комментарии / лайки / посты);
- поиск по тексту и автору, фильтр по посту, сортировка;
- сохранение изменений в `localStorage`, сброс к исходным данным;
- светлая/тёмная тема по системным настройкам, адаптивная вёрстка.

## Структура
```
src/
├── types/comment.ts          # TS-модели в формате dummyjson
├── data/mockComments.ts      # моковый ответ GET /comments
├── hooks/
│   ├── useLocalStorage.ts    # useState + синхронизация с localStorage (useEffect)
│   ├── useComments.ts        # CRUD-логика, статистика (useCallback, useMemo)
│   └── useCommentFilter.ts   # поиск / фильтр / сортировка (useMemo)
├── components/
│   ├── AppHeader.tsx         # заголовок и статистика
│   ├── CommentForm.tsx       # управляемая форма создания (useRef для фокуса)
│   ├── CommentFilters.tsx    # поиск, фильтр по посту, сортировка
│   ├── CommentList.tsx       # рендер списка (key), пустое состояние
│   ├── CommentItem.tsx       # карточка + режим редактирования (memo, локальный state)
│   ├── UserAvatar.tsx        # аватар с инициалами
│   └── ConfirmDialog.tsx     # модалка на <dialog> (useRef + useEffect)
└── App.tsx                   # корневой компонент, связывает хуки и компоненты
```

Данные идут сверху вниз через props, изменения поднимаются вверх через колбэки (односторонний поток данных).
Вся работа с данными инкапсулирована в `useComments`, поэтому при подключении API в следующих лабах меняется только хук.
