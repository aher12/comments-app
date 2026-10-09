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

// Ответ GET https://dummyjson.com/comments
export interface CommentsResponse {
  comments: Comment[]
  total: number
  skip: number
  limit: number
}

// То, что вводит пользователь в форме (id и likes выдаёт "сервер")
export interface CommentDraft {
  body: string
  postId: number
  user: CommentUser
}

export type CommentSort = 'newest' | 'oldest' | 'likes'
