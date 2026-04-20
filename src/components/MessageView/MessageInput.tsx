import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Smile, Paperclip, X, Reply } from 'lucide-react'
import { Message } from '../../types/api'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

interface Props {
  replyTo: Message | null
  onCancelReply: () => void
}

export function MessageInput({ replyTo, onCancelReply }: Props) {
  const { sendMessage, sending, selectedChat, selectedAccount } = useApp()
  const [text, setText] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const disabled = !selectedChat || !selectedAccount
  const canSend = !disabled && text.trim().length > 0 && !sending

  function autoResize() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }

  async function handleSend() {
    if (!canSend) return
    const msg = text
    setText('')
    if (taRef.current) taRef.current.style.height = 'auto'
    taRef.current?.focus()
    await sendMessage(msg, replyTo?.id)
    onCancelReply()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-shrink-0 bg-[#17212b] border-t border-[#0d1825]">
      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#0d1825]">
          <Reply size={16} className="text-[#4d9eed] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#4d9eed] font-semibold mb-0.5">Reply</p>
            <p className="text-xs text-[#708499] truncate">{replyTo.text ?? '(media)'}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-[#708499] hover:text-white transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2">
        {/* Left icons */}
        <button
          disabled={disabled}
          className="p-2 text-[#708499] hover:text-[#4d9eed] disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <Smile size={22} />
        </button>

        {/* Textarea */}
        <div className="flex-1 bg-[#0e1621] rounded-2xl px-4 py-2">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => { setText(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Select a chat…' : 'Message'}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-[14px] text-[#e8eaed] placeholder:text-[#3d5267] resize-none outline-none leading-[1.5] disabled:cursor-not-allowed"
            style={{ maxHeight: 160 }}
          />
        </div>

        {/* Right: attach or send */}
        {text.trim() ? (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150',
              canSend
                ? 'bg-[#4d9eed] hover:bg-[#5ba3f0] text-white shadow-lg shadow-[#4d9eed]/20 scale-100'
                : 'bg-[#1c2b3a] text-[#3d5267] scale-95',
            )}
          >
            {sending ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Send size={17} className="translate-x-0.5" />
            )}
          </button>
        ) : (
          <button
            disabled={disabled}
            className="p-2 text-[#708499] hover:text-[#4d9eed] disabled:opacity-30 transition-colors flex-shrink-0"
          >
            <Paperclip size={22} />
          </button>
        )}
      </div>
    </div>
  )
}
