import type { CommentUser } from '../types/comment'

interface UserAvatarProps {
  user: CommentUser
}

/** Аватар-заглушка с инициалами пользователя */
export function UserAvatar({ user }: UserAvatarProps) {
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="avatar avatar-placeholder">
      <div className="bg-neutral text-neutral-content w-10 rounded-full">
        <span>{initials}</span>
      </div>
    </div>
  )
}
