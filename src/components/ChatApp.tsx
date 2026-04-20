import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChatListPanel } from './ChatList/ChatListPanel'
import { MessagePanel } from './MessageView/MessagePanel'
import { AccountsPanel } from './Accounts/AccountsPanel'
import clsx from 'clsx'

export type LeftView = 'chats' | 'accounts'

export function ChatApp() {
  const { mobileView, setMobileView, setSelectedChat } = useApp()
  const [leftView, setLeftView] = useState<LeftView>('chats')

  function handleBack() {
    setSelectedChat(null)
    setMobileView('chats')
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#0e1621]">
      {/* ── Left panel — switches between chat list and accounts ───── */}
      <div
        className={clsx(
          'flex-shrink-0 flex flex-col border-r border-[#0d1825]',
          mobileView === 'chats' ? 'flex w-full' : 'hidden',
          'lg:flex lg:w-[360px]',
        )}
      >
        {leftView === 'chats' ? (
          <ChatListPanel onOpenAccounts={() => setLeftView('accounts')} />
        ) : (
          <AccountsPanel onBack={() => setLeftView('chats')} />
        )}
      </div>

      {/* ── Right panel — message view ─────────────────────────────── */}
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
