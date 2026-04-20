import { Chat } from '../../types/api'
import { Avatar } from '../common/Avatar'
import { Users, User, Megaphone, Bot } from 'lucide-react'
import clsx from 'clsx'

function chatTypeIcon(type: string) {
  switch (type) {
    case 'group':
    case 'supergroup':
      return <Users size={11} className="text-[#708499]" />
    case 'channel':
      return <Megaphone size={11} className="text-[#708499]" />
    case 'bot':
      return <Bot size={11} className="text-[#708499]" />
    default:
      return <User size={11} className="text-[#708499]" />
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function displayName(chat: Chat): string {
  if (chat.displayName) return chat.displayName
  if (chat.username) return `@${chat.username}`
  return `Chat ${chat.id}`
}

function subtitle(chat: Chat): string {
  const type = chat.chatType
  const count = chat.memberCount ?? chat.participantCount
  if (type === 'private') return 'Private chat'
  if (type === 'group') return count ? `${count} members` : 'Group'
  if (type === 'supergroup') return count ? `${count} members` : 'Supergroup'
  if (type === 'channel') return count ? `${count} subscribers` : 'Channel'
  return type || 'Chat'
}

interface Props {
  chat: Chat
  active: boolean
  onClick: () => void
}

export function ChatItem({ chat, active, onClick }: Props) {
  const name = displayName(chat)

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left rounded-lg mx-1',
        active ? 'bg-[#2b5278]' : 'hover:bg-[#1c2b3a]',
      )}
    >
      <Avatar name={name} size={48} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {chatTypeIcon(chat.chatType)}
            <span
              className={clsx(
                'font-medium truncate text-sm',
                active ? 'text-white' : 'text-[#e8eaed]',
              )}
            >
              {name}
            </span>
          </div>
          {chat.lastMessageDate && (
            <span className={clsx('text-[11px] flex-shrink-0', active ? 'text-[#a8c7e8]' : 'text-[#708499]')}>
              {formatTime(chat.lastMessageDate)}
            </span>
          )}
        </div>
        <p className={clsx('text-xs truncate mt-0.5', active ? 'text-[#a8c7e8]' : 'text-[#708499]')}>
          {subtitle(chat)}
        </p>
      </div>
    </button>
  )
}
