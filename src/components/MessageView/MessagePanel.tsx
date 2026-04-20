import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Loader2, MessageSquareDashed } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatHeader } from './ChatHeader'
import { MessageBubble, isGroupedWith } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message } from '../../types/api'

// ── Date divider ────────────────────────────────────────────────────────────
function DateDivider({ iso }: { iso: string }) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  let label: string
  if (diffDays === 0) label = 'Today'
  else if (diffDays === 1) label = 'Yesterday'
  else if (diffDays < 7) label = d.toLocaleDateString([], { weekday: 'long' })
  else label = d.toLocaleDateString([], { month: 'long', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined })

  return (
    <div className="flex justify-center py-3">
      <div className="bg-[#182533]/90 backdrop-blur-sm text-[#708499] text-[11px] font-medium px-3 py-1 rounded-full select-none">
        {label}
      </div>
    </div>
  )
}

function sameDay(a: string, b: string): boolean {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

// ── Empty state when no chat selected ───────────────────────────────────────
function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#0e1621]"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 70%, #0a1a2e 0%, #0e1621 60%)' }}
    >
      <div className="w-24 h-24 rounded-full bg-[#17212b] flex items-center justify-center">
        <MessageSquareDashed size={44} className="text-[#2b5278]" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Select a chat</p>
        <p className="text-[#708499] text-sm mt-1">Choose from your Entergram workspace chats</p>
      </div>
    </div>
  )
}

interface Props {
  onBack: () => void
}

export function MessagePanel({ onBack }: Props) {
  const { selectedChat, messages, messagesLoading, hasMoreMessages, loadOlderMessages } = useApp()
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef(0)
  const prevChatId = useRef<string | undefined>(undefined)

  // Scroll to bottom when chat first opens or new messages arrive at bottom
  useEffect(() => {
    if (!messagesLoading && messages.length > 0 && selectedChat?.id !== prevChatId.current) {
      prevChatId.current = selectedChat?.id
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
    }
  }, [selectedChat?.id, messagesLoading, messages.length])

  // Smooth scroll on new outgoing message
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.isOut) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages.length])

  // Preserve scroll when prepending older messages
  useEffect(() => {
    if (!loadingOlder && scrollRef.current) {
      const diff = scrollRef.current.scrollHeight - prevScrollHeight.current
      scrollRef.current.scrollTop += diff
    }
  }, [loadingOlder])

  async function handleLoadOlder() {
    if (!scrollRef.current) return
    prevScrollHeight.current = scrollRef.current.scrollHeight
    setLoadingOlder(true)
    await loadOlderMessages()
    setLoadingOlder(false)
  }

  if (!selectedChat) return <NoChatSelected />

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#0e1621',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 100%, #091520 0%, transparent 70%),
          radial-gradient(circle at 20% 50%, #0a1a2e 0%, transparent 50%)
        `,
      }}
    >
      <ChatHeader onBack={onBack} />

      {/* ── Scrollable messages area ──────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain pb-2">
        {/* Load older button */}
        {hasMoreMessages && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              onClick={handleLoadOlder}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 text-xs text-[#4d9eed] bg-[#17212b] border border-[#243447] rounded-full px-4 py-1.5 hover:bg-[#1c2b3a] transition-colors disabled:opacity-50"
            >
              {loadingOlder ? <Loader2 size={12} className="animate-spin" /> : <ChevronUp size={12} />}
              Load older messages
            </button>
          </div>
        )}

        {messagesLoading ? (
          <div className="flex justify-center items-center h-40 gap-2 text-[#708499]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-1 text-center px-4">
            <p className="text-[#708499] text-sm">No messages yet</p>
            <p className="text-[#3d5267] text-xs">Be the first to send a message</p>
          </div>
        ) : (
          <div className="pt-2">
            {messages.map((msg, i) => {
              const prev = messages[i - 1]
              const next = messages[i + 1]
              const showDate = !prev || !sameDay(prev.date, msg.date)
              const grouped = isGroupedWith(msg, prev)

              return (
                <div key={msg.id}>
                  {showDate && <DateDivider iso={msg.date} />}
                  {/* Extra top margin at start of new group */}
                  {!grouped && !showDate && i > 0 && <div style={{ height: 4 }} />}
                  <MessageBubble
                    message={msg}
                    prevMessage={prev}
                    nextMessage={next}
                    onReply={setReplyTo}
                  />
                </div>
              )
            })}
          </div>
        )}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  )
}
