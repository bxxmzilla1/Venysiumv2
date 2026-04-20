import { useEffect, useRef, useState } from 'react'
import { Loader2, ChevronUp, MessageSquareDashed } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatHeader } from './ChatHeader'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message } from '../../types/api'

function DateDivider({ date }: { date: string }) {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  let label: string
  if (diffDays === 0) label = 'Today'
  else if (diffDays === 1) label = 'Yesterday'
  else label = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex justify-center py-2">
      <span className="bg-[#182533]/80 text-[#708499] text-xs px-3 py-1 rounded-full backdrop-blur-sm">
        {label}
      </span>
    </div>
  )
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

interface Props {
  onBack: () => void
}

export function MessagePanel({ onBack }: Props) {
  const { selectedChat, messages, messagesLoading, hasMoreMessages, loadOlderMessages } = useApp()
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef<number>(0)

  // Scroll to bottom when messages first load or new message arrives
  useEffect(() => {
    if (!messagesLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChat?.id, messagesLoading])

  // Keep scroll position when loading older messages
  useEffect(() => {
    if (!loadingOlder && listRef.current) {
      const newScrollHeight = listRef.current.scrollHeight
      listRef.current.scrollTop = newScrollHeight - prevScrollHeight.current
    }
  }, [loadingOlder])

  async function handleLoadOlder() {
    if (!listRef.current) return
    prevScrollHeight.current = listRef.current.scrollHeight
    setLoadingOlder(true)
    await loadOlderMessages()
    setLoadingOlder(false)
  }

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0e1621] gap-3">
        <div className="w-20 h-20 rounded-full bg-[#17212b] flex items-center justify-center">
          <MessageSquareDashed size={36} className="text-[#2b5278]" />
        </div>
        <p className="text-[#708499] text-sm">Select a chat to start messaging</p>
        <p className="text-[#3d5267] text-xs">Your Entergram workspace chats will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0e1621]">
      <ChatHeader onBack={onBack} />

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto py-2" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 100%, #0a1525 0%, #0e1621 100%)' }}>
        {/* Load older button */}
        {hasMoreMessages && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={handleLoadOlder}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 text-xs text-[#4d9eed] bg-[#17212b] border border-[#2b3f52] rounded-full px-4 py-1.5 hover:bg-[#1c2b3a] transition-colors disabled:opacity-50"
            >
              {loadingOlder ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ChevronUp size={12} />
              )}
              Load older messages
            </button>
          </div>
        )}

        {messagesLoading ? (
          <div className="flex justify-center items-center h-32 gap-2 text-[#708499]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#708499]">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-[#3d5267]">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const prev = messages[i - 1]
              const showDate = !prev || !isSameDay(prev.date, msg.date)
              return (
                <div key={msg.id}>
                  {showDate && <DateDivider date={msg.date} />}
                  <MessageBubble
                    message={msg}
                    prevMessage={prev}
                    onReply={setReplyTo}
                  />
                </div>
              )
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  )
}
