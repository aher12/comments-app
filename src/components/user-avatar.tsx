import type { CommentUser } from '@/types/comment'

/** Аватар-заглушка с инициалами. Без хуков и директив — работает и в Server, и в Client Components */
export function UserAvatar({ user, size = 'md' }: { user: CommentUser; size?: 'md' | 'lg' }) {
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="avatar avatar-placeholder">
      <div className={`bg-neutral text-neutral-content rounded-full ${size === 'lg' ? 'w-14 text-xl' : 'w-10'}`}>
        <span>{initials}</span>
      </div>
    </div>
  )
}
