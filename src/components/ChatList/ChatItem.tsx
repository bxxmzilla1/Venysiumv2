import { Chat } from '../../types/api'
import { Avatar } from '../common/Avatar'
import { Users, User, Megaphone, Hash } from 'lucide-react'
import clsx from 'clsx'

export function chatDisplayName(chat: Chat): string {
  if (chat.displayName) return chat.displayName
  if (chat.username) return `@${chat.username}`
  return `Chat ${chat.id}`
}

function chatSubtitle(chat: Chat): string {
  const count = chat.memberCount ?? chat.participantCount
  switch (chat.chatType) {
    case 'private':
      return 'Private chat'
    case 'group':
      return count ? `${count.toLocaleString()} members` : 'Group'
    case 'supergroup':
      return count ? `${count.toLocaleString()} members` : 'Supergroup'
    case 'channel':
      return count ? `${count.toLocaleString()} subscribers` : 'Channel'
    default:
      return chat.chatType || 'Chat'
  }
}

function TypeIcon({ type, active }: { type: string; active: boolean }) {
  const cls = clsx('flex-shrink-0', active ? 'text-[#a8c7e8]' : 'text-[#708499]')
  const size = 12
  switch (type) {
    case 'group':
    case 'supergroup':
      return <Users size={size} className={cls} />
    case 'channel':
      return <Megaphone size={size} className={cls} />
    case 'forum':
      return <Hash size={size} className={cls} />
    default:
      return <User size={size} className={cls} />
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

interface Props {
  chat: Chat
  active: boolean
  onClick: () => void
}

export function ChatItem({ chat, active, onClick }: Props) {
  const name = chatDisplayName(chat)

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left mx-1',
        active ? 'bg-[#2b5278]' : 'hover:bg-[#1c2b3a] active:bg-[#243447]',
      )}
      style={{ width: 'calc(100% - 8px)' }}
    >
      <Avatar name={name} size={52} />

      <div className="flex-1 min-w-0">
        {/* Row 1: name + time */}
        <div className="flex items-center gap-2 mb-0.5">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <TypeIcon type={chat.chatType} active={active} />
            <span
              className={clsx(
                'font-semibold text-sm truncate',
                active ? 'text-white' : 'text-[#e8eaed]',
              )}
            >
              {name}
            </span>
          </div>
          {chat.lastMessageDate && (
            <span
              className={clsx(
                'text-[11px] flex-shrink-0 tabular-nums',
                active ? 'text-[#a8c7e8]' : 'text-[#708499]',
              )}
            >
              {formatTime(chat.lastMessageDate)}
            </span>
          )}
        </div>

        {/* Row 2: subtitle */}
        <p className={clsx('text-xs truncate', active ? 'text-[#a8c7e8]' : 'text-[#708499]')}>
          {chatSubtitle(chat)}
        </p>
      </div>
    </button>
  )
}
