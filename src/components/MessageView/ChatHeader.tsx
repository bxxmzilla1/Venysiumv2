import { ArrowLeft, Users, User, Megaphone, Search, MoreVertical } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../common/Avatar'
import { Chat } from '../../types/api'
import { chatDisplayName } from '../ChatList/ChatItem'

function chatMeta(chat: Chat): string {
  const count = chat.memberCount ?? chat.participantCount
  switch (chat.chatType) {
    case 'private':
      return 'private chat'
    case 'channel':
      return count ? `${count.toLocaleString()} subscribers` : 'channel'
    case 'group':
      return count ? `${count.toLocaleString()} members` : 'group'
    case 'supergroup':
      return count ? `${count.toLocaleString()} members` : 'supergroup'
    default:
      return chat.chatType || 'chat'
  }
}

function TypeIcon({ type }: { type: string }) {
  const cls = 'text-[#4d9eed]'
  const size = 13
  switch (type) {
    case 'group':
    case 'supergroup':
      return <Users size={size} className={cls} />
    case 'channel':
      return <Megaphone size={size} className={cls} />
    default:
      return <User size={size} className={cls} />
  }
}

interface Props {
  onBack: () => void
}

export function ChatHeader({ onBack }: Props) {
  const { selectedChat } = useApp()
  if (!selectedChat) return null

  const name = chatDisplayName(selectedChat)

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#17212b] border-b border-[#0d1825] flex-shrink-0 z-10">
      {/* Back button — mobile only */}
      <button
        onClick={onBack}
        className="lg:hidden p-1.5 -ml-1 rounded-full text-[#4d9eed] hover:bg-[#1c2b3a] transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar */}
      <Avatar name={name} size={40} />

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={selectedChat.chatType} />
          <h2 className="font-semibold text-white text-[15px] truncate leading-tight">{name}</h2>
        </div>
        <p className="text-xs text-[#708499] truncate leading-tight">{chatMeta(selectedChat)}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#708499] hover:text-white hover:bg-[#1c2b3a] transition-colors">
          <Search size={17} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#708499] hover:text-white hover:bg-[#1c2b3a] transition-colors">
          <MoreVertical size={17} />
        </button>
      </div>
    </div>
  )
}
