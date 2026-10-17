// Модель комментария в формате https://dummyjson.com/docs/comments
export interface CommentUser {
  id: number
  username: string
  fullName: string
}

export interface Comment {
  id: number
  body: string
  postId: number
  likes: number
  user: CommentUser
}

// Ответ GET /comments и GET /comments/post/:id
export interface CommentsPage {
  comments: Comment[]
  total: number
  skip: number
  limit: number
}

export interface CommentsQuery {
  skip: number
  limit: number
  postId: number | null
}

// Поля, которые пользователь может менять
export type CommentChanges = Partial<Pick<Comment, 'body' | 'postId' | 'likes'>>

// Ввод формы создания (id и likes выдаёт "сервер")
export interface CommentDraft {
  body: string
  postId: number
  userId: number
}

// Результат Server Action: ошибки возвращаются значением, а не исключением
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }
