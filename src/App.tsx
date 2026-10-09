import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { CommentFilters } from './components/CommentFilters'
import { CommentForm } from './components/CommentForm'
import { CommentList } from './components/CommentList'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useCommentFilter } from './hooks/useCommentFilter'
import { useComments } from './hooks/useComments'
import type { Comment } from './types/comment'

/**
 * Корневой компонент: владеет состоянием и передаёт его вниз через props,
 * а изменения приходят обратно вверх через колбэки (односторонний поток данных).
 */
export default function App() {
  const { comments, stats, postIds, addComment, updateComment, likeComment, deleteComment, resetToMock } = useComments()
  const { postId, setPostId, query, setQuery, sort, setSort, visibleComments } = useCommentFilter(comments)
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null)

  const confirmDelete = () => {
    if (commentToDelete) deleteComment(commentToDelete.id)
    setCommentToDelete(null)
  }

  return (
    <div className="min-h-screen bg-base-200">
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <AppHeader {...stats} />
        <CommentForm onAdd={addComment} />
        <CommentFilters
          postIds={postIds}
          postId={postId}
          onPostIdChange={setPostId}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
        />
        <CommentList
          comments={visibleComments}
          onLike={likeComment}
          onUpdate={updateComment}
          onRequestDelete={setCommentToDelete}
        />
        <div className="flex justify-end">
          <button className="btn btn-sm btn-ghost" onClick={resetToMock}>
            Сбросить к исходным данным
          </button>
        </div>
      </main>

      <ConfirmDialog
        open={commentToDelete !== null}
        title="Удалить комментарий?"
        onConfirm={confirmDelete}
        onCancel={() => setCommentToDelete(null)}
      >
        Комментарий «{commentToDelete?.body}» будет удалён без возможности восстановления.
      </ConfirmDialog>
    </div>
  )
}
