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
    <div className="flex h-full overflow-hidden bg-[#0e1621]">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex-shrink-0 flex flex-col border-r border-[#0d1825]',
          // Mobile: toggle visibility; Desktop: always shown at fixed width
          mobileView === 'chats' ? 'flex w-full' : 'hidden',
          'lg:flex lg:w-[360px]',
        )}
      >
        <ChatListPanel />
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0',
          mobileView === 'messages' ? 'flex' : 'hidden',
          'lg:flex',
        )}
      >
        <MessagePanel onBack={handleBack} />
      </div>
    </div>
  )
}
