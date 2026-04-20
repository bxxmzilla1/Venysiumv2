import { ArrowLeft, MoreVertical, Users, User, Megaphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../common/Avatar'
import { Chat } from '../../types/api'

function chatMeta(chat: Chat): string {
  const count = chat.memberCount ?? chat.participantCount
  const type = chat.chatType
  if (type === 'private') return 'Private chat'
  if (type === 'channel') return count ? `${count.toLocaleString()} subscribers` : 'Channel'
  if (count) return `${count.toLocaleString()} members`
  return type === 'supergroup' ? 'Supergroup' : 'Group'
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'channel') return <Megaphone size={14} className="text-[#4d9eed]" />
  if (type === 'group' || type === 'supergroup') return <Users size={14} className="text-[#4d9eed]" />
  return <User size={14} className="text-[#4d9eed]" />
}

interface Props {
  onBack: () => void
  onInfo?: () => void
}

export function ChatHeader({ onBack, onInfo }: Props) {
  const { selectedChat } = useApp()
  if (!selectedChat) return null

  const name = selectedChat.displayName ?? selectedChat.username ?? `Chat ${selectedChat.id}`

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#17212b] border-b border-[#0d1825] flex-shrink-0">
      {/* Back (mobile) */}
      <button
        onClick={onBack}
        className="lg:hidden text-[#4d9eed] hover:text-white transition-colors p-1 -ml-1"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar */}
      <Avatar name={name} size={40} />

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={selectedChat.chatType} />
          <h2 className="font-semibold text-white text-sm truncate">{name}</h2>
        </div>
        <p className="text-xs text-[#708499] truncate">{chatMeta(selectedChat)}</p>
      </div>

      {/* Actions */}
      {onInfo && (
        <button
          onClick={onInfo}
          className="text-[#708499] hover:text-white transition-colors p-1 rounded"
        >
          <MoreVertical size={18} />
        </button>
      )}
    </div>
  )
}
