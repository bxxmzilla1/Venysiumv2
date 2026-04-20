import { useState, useRef, KeyboardEvent } from 'react'
import { Send, X, CornerDownRight, Smile } from 'lucide-react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = !!selectedChat && !!selectedAccount && text.trim().length > 0 && !sending

  function autoResize() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  async function handleSend() {
    if (!canSend) return
    const msg = text
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(msg, replyTo?.id)
    onCancelReply()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholder = !selectedAccount
    ? 'No account selected…'
    : !selectedChat
    ? 'Select a chat to start messaging'
    : 'Write a message…'

  return (
    <div className="flex-shrink-0 bg-[#17212b] border-t border-[#0d1825] px-3 py-2">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 bg-[#0e1621] rounded-xl px-3 py-2">
          <CornerDownRight size={14} className="text-[#4d9eed] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#4d9eed] font-medium mb-0.5">Replying to message</p>
            <p className="text-xs text-[#708499] truncate">{replyTo.text ?? '(media)'}</p>
          </div>
          <button onClick={onCancelReply} className="text-[#708499] hover:text-white flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Emoji button (decorative) */}
        <button className="text-[#708499] hover:text-[#4d9eed] transition-colors pb-2.5 flex-shrink-0">
          <Smile size={20} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize() }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!selectedChat || !selectedAccount}
          rows={1}
          className={clsx(
            'flex-1 bg-[#0e1621] rounded-xl px-4 py-2.5 text-sm text-[#e8eaed] placeholder:text-[#3d5267] resize-none outline-none focus:ring-1 focus:ring-[#4d9eed]/30 leading-relaxed',
            (!selectedChat || !selectedAccount) && 'opacity-50 cursor-not-allowed',
          )}
          style={{ maxHeight: 160, overflowY: 'auto' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
            canSend
              ? 'bg-[#4d9eed] hover:bg-[#5ba3f0] text-white shadow-lg shadow-[#4d9eed]/20'
              : 'bg-[#1c2b3a] text-[#3d5267]',
          )}
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send size={16} className={canSend ? 'translate-x-0.5' : ''} />
          )}
        </button>
      </div>
    </div>
  )
}
