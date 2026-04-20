import { useApp } from '../context/AppContext'
import { ChatListPanel } from './ChatList/ChatListPanel'
import { MessagePanel } from './MessageView/MessagePanel'
import clsx from 'clsx'

export function ChatApp() {
  const { mobileView, setMobileView, setSelectedChat } = useApp()

  function handleBack() {
    setSelectedChat(null)
    setMobileView('chats')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1621]">
      {/* ── Left panel: Chat list ─────────────────────────────────────────── */}
      <div
        className={clsx(
          'w-full lg:w-[360px] lg:flex-shrink-0 flex flex-col',
          // Mobile: show only when mobileView === 'chats'
          mobileView === 'chats' ? 'flex' : 'hidden lg:flex',
        )}
      >
        <ChatListPanel />
      </div>

      {/* ── Right panel: Messages ─────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0',
          mobileView === 'messages' ? 'flex' : 'hidden lg:flex',
        )}
      >
        <MessagePanel onBack={handleBack} />
      </div>
    </div>
  )
}
