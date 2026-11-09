import type { Comment, Viewer } from '@/types/comment'

// Тестовые данные (фейки): похожи на настоящие, но не требуют сети и сессии

export const comment: Comment = {
  id: 7,
  body: 'Отличная статья, спасибо!',
  postId: 42,
  likes: 5,
  user: { id: 105, username: 'emmac', fullName: 'Emma Wilson' },
}

export const regularUser: Viewer = { id: 2, username: 'user', name: 'Michael Williams', role: 'user' }
export const adminUser: Viewer = { id: 1, username: 'admin', name: 'Emily Johnson', role: 'admin' }
