import type { CommentsResponse, CommentUser } from '../types/comment'

// Пользователи из dummyjson.com/users — для выбора автора в форме
export const mockUsers: CommentUser[] = [
  { id: 105, username: 'emmac', fullName: 'Emma Wilson' },
  { id: 183, username: 'jamesh', fullName: 'James Garcia' },
  { id: 162, username: 'oliviab', fullName: 'Olivia Brown' },
  { id: 36, username: 'liamw', fullName: 'Liam Martinez' },
  { id: 47, username: 'sophiad', fullName: 'Sophia Davis' },
]

// Фрагмент ответа GET https://dummyjson.com/comments?limit=10.
// В следующих лабах этот файл заменится реальным запросом к API.
export const mockCommentsResponse: CommentsResponse = {
  comments: [
    { id: 1, body: 'This is some awesome thinking!', postId: 242, likes: 3, user: mockUsers[0] },
    { id: 2, body: 'What terrific math skills you’re showing!', postId: 46, likes: 4, user: mockUsers[1] },
    { id: 3, body: 'You are an amazing writer!', postId: 235, likes: 2, user: mockUsers[2] },
    { id: 4, body: 'Wow! You have improved so much!', postId: 31, likes: 1, user: mockUsers[3] },
    { id: 5, body: 'Nice idea!', postId: 242, likes: 1, user: mockUsers[4] },
    { id: 6, body: 'You are showing excellent understanding!', postId: 46, likes: 0, user: mockUsers[0] },
    { id: 7, body: 'This is clear, concise, and complete!', postId: 31, likes: 7, user: mockUsers[2] },
    { id: 8, body: 'What a powerful argument!', postId: 235, likes: 5, user: mockUsers[1] },
    { id: 9, body: 'I knew you could do it!', postId: 242, likes: 2, user: mockUsers[3] },
    { id: 10, body: 'Wonderful ideas!', postId: 31, likes: 0, user: mockUsers[4] },
  ],
  total: 10,
  skip: 0,
  limit: 10,
}
