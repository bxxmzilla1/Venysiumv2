import { useState } from 'react'
import { Search, X, LogOut, ChevronDown, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatItem } from './ChatItem'
import { Avatar } from '../common/Avatar'
import { Account } from '../../types/api'
import clsx from 'clsx'

function accountLabel(a: Account): string {
  return a.displayName ?? a.phoneNumber ?? a.owner.displayName ?? a.id
}

export function ChatListPanel() {
  const {
    me,
    accounts,
    selectedAccount,
    setSelectedAccount,
    chats,
    chatsLoading,
    searchQuery,
    setSearchQuery,
    selectedChat,
    setSelectedChat,
    logout,
  } = useApp()

  const [acctMenuOpen, setAcctMenuOpen] = useState(false)

  const filtered = chats.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const name = (c.displayName ?? c.username ?? c.id).toLowerCase()
    return name.includes(q)
  })

  const workspaceName = me?.workspace.name ?? 'Workspace'
  const accountName = selectedAccount ? accountLabel(selectedAccount) : 'No account'

  return (
    <div className="flex flex-col h-full bg-[#17212b] border-r border-[#0d1825]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-[#0d1825]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="w-8 h-8 rounded-xl" />
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate">{workspaceName}</p>
              <p className="text-[10px] text-[#708499] leading-tight">Entergram</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-[#708499] hover:text-white transition-colors p-1 rounded"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Account selector */}
        {accounts.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setAcctMenuOpen((o) => !o)}
              className="w-full flex items-center gap-2 bg-[#0e1621] hover:bg-[#0a1019] rounded-xl px-3 py-2 transition-colors"
            >
              <Avatar name={accountName} size={24} />
              <span className="flex-1 text-xs text-[#e8eaed] truncate text-left">{accountName}</span>
              <ChevronDown
                size={12}
                className={clsx('text-[#708499] transition-transform', acctMenuOpen && 'rotate-180')}
              />
            </button>

            {acctMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#1c2b3a] border border-[#0d1825] rounded-xl shadow-2xl z-50 overflow-hidden">
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedAccount(a)
                      setAcctMenuOpen(false)
                    }}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                      a.id === selectedAccount?.id ? 'bg-[#2b5278] text-white' : 'hover:bg-[#243447] text-[#e8eaed]',
                    )}
                  >
                    <Avatar name={accountLabel(a)} size={28} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{accountLabel(a)}</p>
                      <p className="text-[10px] text-[#708499] truncate">{a.platform}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-b border-[#0d1825]">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-[#708499] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats…"
            className="w-full bg-[#0e1621] rounded-xl pl-9 pr-8 py-2 text-sm text-[#e8eaed] placeholder:text-[#3d5267] focus:outline-none focus:ring-1 focus:ring-[#4d9eed]/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#708499] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Chat list ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-1">
        {chatsLoading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#708499]">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-xs">Loading chats…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-1 text-[#708499]">
            <p className="text-sm">{searchQuery ? 'No chats found' : 'No chats yet'}</p>
            {searchQuery && (
              <p className="text-xs">Try a different search term</p>
            )}
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={selectedChat?.id === chat.id}
              onClick={() => setSelectedChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  )
}
