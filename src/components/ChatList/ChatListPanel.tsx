import { useState } from 'react'
import { Search, X, ChevronDown, Edit2, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatItem } from './ChatItem'
import { Avatar } from '../common/Avatar'
import { Account } from '../../types/api'
import { Spinner } from '../common/Spinner'
import clsx from 'clsx'

function accountLabel(a: Account): string {
  return a.displayName ?? a.phoneNumber ?? a.owner.displayName ?? `Account ${a.id.slice(-4)}`
}

interface Props {
  onOpenAccounts: () => void
}

export function ChatListPanel({ onOpenAccounts }: Props) {
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
  } = useApp()

  const [acctMenuOpen, setAcctMenuOpen] = useState(false)

  const filtered = chats.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const name = (c.displayName ?? c.username ?? c.id).toLowerCase()
    return name.includes(q)
  })

  const workspaceName = me?.workspace.name ?? 'Workspace'
  const acctName = selectedAccount ? accountLabel(selectedAccount) : ''

  return (
    <div className="flex flex-col h-full bg-[#17212b] select-none">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-lg leading-tight truncate">{workspaceName}</h1>
          <p className="text-[#708499] text-xs leading-tight">Entergram</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAccounts}
            title="Telegram Accounts"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1c2b3a] text-[#708499] hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1c2b3a] text-[#708499] hover:text-white transition-colors">
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Account selector ───────────────────────────────────────────── */}
      {accounts.length > 0 && (
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => setAcctMenuOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 bg-[#0e1621] hover:bg-[#0a1019] rounded-xl px-3 py-2 transition-colors"
          >
            <Avatar name={acctName} size={26} />
            <span className="flex-1 text-xs text-[#e8eaed] truncate text-left font-medium">
              {acctName}
            </span>
            <ChevronDown
              size={13}
              className={clsx('text-[#708499] transition-transform duration-200', acctMenuOpen && 'rotate-180')}
            />
          </button>

          {acctMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAcctMenuOpen(false)}
              />
              <div className="absolute left-3 right-3 top-full mt-1 bg-[#1c2b3a] border border-[#243447] rounded-2xl shadow-2xl z-20 overflow-hidden">
                {accounts.map((a) => {
                  const label = accountLabel(a)
                  const isActive = a.id === selectedAccount?.id
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAccount(a); setAcctMenuOpen(false) }}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        isActive ? 'bg-[#2b5278]' : 'hover:bg-[#243447]',
                      )}
                    >
                      <Avatar name={label} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{label}</p>
                        <p className="text-[10px] text-[#708499] truncate capitalize">{a.platform}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center bg-[#0e1621] rounded-xl overflow-hidden">
          <Search size={15} className="absolute left-3 text-[#708499] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent pl-9 pr-8 py-2 text-sm text-[#e8eaed] placeholder:text-[#3d5267] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-[#708499] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="h-px bg-[#0d1825] mx-3 mb-1" />

      {/* ── Chat list ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {chatsLoading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Spinner size={22} />
            <p className="text-[#708499] text-xs">Loading chats…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-1 text-[#708499]">
            <p className="text-sm">{searchQuery ? 'No results' : 'No chats yet'}</p>
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
