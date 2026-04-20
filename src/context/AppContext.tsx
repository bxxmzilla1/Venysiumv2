import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { Account, Chat, MeData, Message } from '../types/api'
import { api, ApiError } from '../lib/api'

export type MobileView = 'chats' | 'messages'

interface AppState {
  // ── Bootstrap ─────────────────────────────────────────────────────────────
  me: MeData | null
  bootstrapLoading: boolean
  bootstrapError: string | null
  retry: () => void

  // ── Accounts ──────────────────────────────────────────────────────────────
  accounts: Account[]
  selectedAccount: Account | null
  setSelectedAccount: (a: Account) => void

  // ── Chat list ─────────────────────────────────────────────────────────────
  chats: Chat[]
  chatsLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void

  // ── Active chat ───────────────────────────────────────────────────────────
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
  messages: Message[]
  messagesLoading: boolean
  hasMoreMessages: boolean
  loadOlderMessages: () => Promise<void>

  // ── Actions ───────────────────────────────────────────────────────────────
  sendMessage: (text: string, replyToId?: number) => Promise<void>
  editMessage: (msgId: number, newText: string) => Promise<void>
  deleteMessage: (msgId: number, revoke: boolean) => Promise<void>
  sending: boolean

  // ── Mobile nav ────────────────────────────────────────────────────────────
  mobileView: MobileView
  setMobileView: (v: MobileView) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Bootstrap ─────────────────────────────────────────────────────────────
  const [me, setMe] = useState<MeData | null>(null)
  const [bootstrapLoading, setBootstrapLoading] = useState(true)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const retry = useCallback(() => {
    setBootstrapError(null)
    setBootstrapLoading(true)
    setRetryKey((k) => k + 1)
  }, [])

  useEffect(() => {
    setBootstrapLoading(true)
    setBootstrapError(null)

    Promise.all([api.getMe(), api.getAccounts()])
      .then(([meData, accts]) => {
        setMe(meData)
        setAccounts(accts)
        if (accts.length > 0) setSelectedAccountState(accts[0])
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError
            ? `${err.message}`
            : 'Failed to connect. Check your network.'
        setBootstrapError(msg)
      })
      .finally(() => setBootstrapLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey])

  // ── Accounts ──────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(null)

  const setSelectedAccount = useCallback((a: Account) => setSelectedAccountState(a), [])

  // ── Chat list ─────────────────────────────────────────────────────────────
  const [chats, setChats] = useState<Chat[]>([])
  const [chatsLoading, setChatsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchChats = useCallback(async () => {
    try {
      const items = await api.listChats({ limit: 100 })
      setChats(items)
    } catch {
      // silent polling errors
    }
  }, [])

  useEffect(() => {
    if (!me) return
    setChatsLoading(true)
    fetchChats().finally(() => setChatsLoading(false))
    const id = setInterval(fetchChats, 15_000)
    return () => clearInterval(id)
  }, [fetchChats, me])

  // ── Selected chat + messages ───────────────────────────────────────────────
  const [selectedChat, setSelectedChatState] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const oldestIdRef = useRef<number | undefined>(undefined)

  const setSelectedChat = useCallback((chat: Chat | null) => {
    setSelectedChatState(chat)
    setMessages([])
    setHasMoreMessages(false)
    oldestIdRef.current = undefined
    if (chat) setMobileView('messages')
  }, [])

  const fetchMessages = useCallback(
    async (prepend = false, beforeId?: number) => {
      if (!selectedChat) return
      try {
        const items = await api.listMessages(selectedChat.id, {
          account_id: selectedAccount?.id,
          limit: 50,
          before_message_id: beforeId,
        })
        const ordered = [...items].reverse()

        if (prepend) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            const fresh = ordered.filter((m) => !ids.has(m.id))
            if (fresh.length > 0) oldestIdRef.current = fresh[0].id
            return [...fresh, ...prev]
          })
          setHasMoreMessages(items.length === 50)
        } else {
          setMessages((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]))
            for (const m of ordered) map.set(m.id, m)
            const merged = Array.from(map.values()).sort((a, b) => a.id - b.id)
            if (merged.length > 0) oldestIdRef.current = merged[0].id
            return merged
          })
        }
      } catch {
        // silent
      }
    },
    [selectedChat, selectedAccount?.id],
  )

  useEffect(() => {
    if (!selectedChat) { setMessages([]); return }
    setMessagesLoading(true)
    fetchMessages().finally(() => setMessagesLoading(false))
    const id = setInterval(() => fetchMessages(), 3_000)
    return () => clearInterval(id)
  }, [fetchMessages, selectedChat?.id])

  const loadOlderMessages = useCallback(async () => {
    if (!oldestIdRef.current) return
    await fetchMessages(true, oldestIdRef.current)
  }, [fetchMessages])

  // ── Actions ───────────────────────────────────────────────────────────────
  const [sending, setSending] = useState(false)

  const sendMessage = useCallback(
    async (text: string, replyToId?: number) => {
      if (!selectedChat || !selectedAccount || !text.trim()) return
      setSending(true)
      try {
        await api.sendMessage(selectedChat.id, {
          accountId: selectedAccount.id,
          idempotencyKey: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: text.trim(),
          replyToMessageId: replyToId,
        })
        await fetchMessages()
      } finally {
        setSending(false)
      }
    },
    [selectedChat, selectedAccount, fetchMessages],
  )

  const editMessage = useCallback(
    async (msgId: number, newText: string) => {
      if (!selectedChat || !selectedAccount) return
      await api.editMessage(selectedChat.id, msgId, {
        accountId: selectedAccount.id,
        text: newText,
      })
      await fetchMessages()
    },
    [selectedChat, selectedAccount, fetchMessages],
  )

  const deleteMessage = useCallback(
    async (msgId: number, revoke: boolean) => {
      if (!selectedChat) return
      await api.deleteMessage(selectedChat.id, msgId, {
        account_id: selectedAccount?.id,
        revoke,
      })
      setMessages((prev) => prev.filter((m) => m.id !== msgId))
    },
    [selectedChat, selectedAccount?.id],
  )

  // ── Mobile ────────────────────────────────────────────────────────────────
  const [mobileView, setMobileView] = useState<MobileView>('chats')

  return (
    <AppContext.Provider
      value={{
        me,
        bootstrapLoading,
        bootstrapError,
        retry,
        accounts,
        selectedAccount,
        setSelectedAccount,
        chats,
        chatsLoading,
        searchQuery,
        setSearchQuery,
        selectedChat,
        setSelectedChat,
        messages,
        messagesLoading,
        hasMoreMessages,
        loadOlderMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        sending,
        mobileView,
        setMobileView,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
