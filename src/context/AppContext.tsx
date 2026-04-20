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
import { getStoredApiKey, setStoredApiKey } from '../lib/storage'

export type MobileView = 'chats' | 'messages' | 'contacts'

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  apiKey: string
  setApiKey: (key: string) => void
  logout: () => void

  // ── Bootstrap data ────────────────────────────────────────────────────────
  me: MeData | null
  meLoading: boolean
  meError: string | null

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

  // ── Send / edit / delete ──────────────────────────────────────────────────
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
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [apiKey, setApiKeyState] = useState<string>(getStoredApiKey)

  function setApiKey(key: string) {
    setApiKeyState(key)
    setStoredApiKey(key)
    if (!key) reset()
  }

  function logout() {
    setApiKey('')
  }

  function reset() {
    setMe(null)
    setMeError(null)
    setAccounts([])
    setSelectedAccountState(null)
    setChats([])
    selectChat(null)
    setMessages([])
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  const [me, setMe] = useState<MeData | null>(null)
  const [meLoading, setMeLoading] = useState(false)
  const [meError, setMeError] = useState<string | null>(null)

  useEffect(() => {
    if (!apiKey) return
    setMeLoading(true)
    setMeError(null)

    Promise.all([api.getMe(apiKey), api.getAccounts(apiKey)])
      .then(([meData, accts]) => {
        setMe(meData)
        setAccounts(accts)
        if (accts.length > 0) setSelectedAccountState(accts[0])
      })
      .catch((err: unknown) => {
        const msg = err instanceof ApiError ? `${err.status}: ${err.message}` : 'Authentication failed'
        setMeError(msg)
      })
      .finally(() => setMeLoading(false))
  }, [apiKey])

  // ── Accounts ──────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(null)

  function setSelectedAccount(a: Account) {
    setSelectedAccountState(a)
  }

  // ── Chat list ─────────────────────────────────────────────────────────────
  const [chats, setChats] = useState<Chat[]>([])
  const [chatsLoading, setChatsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchChats = useCallback(async () => {
    if (!apiKey) return
    try {
      const items = await api.listChats(apiKey, { limit: 100 })
      setChats(items)
    } catch {
      // silently ignore polling errors
    }
  }, [apiKey])

  useEffect(() => {
    if (!apiKey) return
    setChatsLoading(true)
    fetchChats().finally(() => setChatsLoading(false))
    const id = setInterval(fetchChats, 15_000)
    return () => clearInterval(id)
  }, [fetchChats, apiKey])

  // ── Selected chat + messages ───────────────────────────────────────────────
  const [selectedChat, setSelectedChatState] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const oldestMsgIdRef = useRef<number | undefined>(undefined)

  function selectChat(chat: Chat | null) {
    setSelectedChatState(chat)
    setMessages([])
    setHasMoreMessages(false)
    oldestMsgIdRef.current = undefined
    if (chat) setMobileView('messages')
  }

  function setSelectedChat(chat: Chat | null) {
    selectChat(chat)
  }

  const fetchMessages = useCallback(
    async (prepend = false, beforeId?: number) => {
      if (!apiKey || !selectedChat) return
      try {
        const items = await api.listMessages(apiKey, selectedChat.id, {
          account_id: selectedAccount?.id,
          limit: 50,
          before_message_id: beforeId,
        })
        const ordered = [...items].reverse() // oldest → newest

        if (prepend) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            const fresh = ordered.filter((m) => !ids.has(m.id))
            return [...fresh, ...prev]
          })
          setHasMoreMessages(items.length === 50)
          if (ordered.length > 0) oldestMsgIdRef.current = ordered[0].id
        } else {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            const merged = [...prev]
            for (const m of ordered) {
              if (!ids.has(m.id)) merged.push(m)
            }
            merged.sort((a, b) => a.id - b.id)
            if (merged.length > 0) oldestMsgIdRef.current = merged[0].id
            return merged
          })
        }
      } catch {
        // silently ignore
      }
    },
    [apiKey, selectedChat, selectedAccount?.id],
  )

  useEffect(() => {
    if (!selectedChat) {
      setMessages([])
      return
    }
    setMessagesLoading(true)
    fetchMessages().finally(() => setMessagesLoading(false))

    const id = setInterval(() => fetchMessages(), 3_000)
    return () => clearInterval(id)
  }, [fetchMessages, selectedChat?.id])

  async function loadOlderMessages() {
    if (!oldestMsgIdRef.current) return
    await fetchMessages(true, oldestMsgIdRef.current)
  }

  // ── Send / edit / delete ──────────────────────────────────────────────────
  const [sending, setSending] = useState(false)

  async function sendMessage(text: string, replyToId?: number) {
    if (!apiKey || !selectedChat || !selectedAccount || !text.trim()) return
    setSending(true)
    try {
      await api.sendMessage(apiKey, selectedChat.id, {
        accountId: selectedAccount.id,
        idempotencyKey: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: text.trim(),
        replyToMessageId: replyToId,
      })
      await fetchMessages()
    } finally {
      setSending(false)
    }
  }

  async function editMessage(msgId: number, newText: string) {
    if (!apiKey || !selectedChat || !selectedAccount) return
    await api.editMessage(apiKey, selectedChat.id, msgId, {
      accountId: selectedAccount.id,
      text: newText,
    })
    await fetchMessages()
  }

  async function deleteMessage(msgId: number, revoke: boolean) {
    if (!apiKey || !selectedChat) return
    await api.deleteMessage(apiKey, selectedChat.id, msgId, {
      account_id: selectedAccount?.id,
      revoke,
    })
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
  }

  // ── Mobile view ───────────────────────────────────────────────────────────
  const [mobileView, setMobileView] = useState<MobileView>('chats')

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        logout,
        me,
        meLoading,
        meError,
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
