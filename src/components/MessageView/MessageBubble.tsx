import { useState } from 'react'
import { Check, CheckCheck, Pencil, Trash2, X, CornerDownRight } from 'lucide-react'
import { Message } from '../../types/api'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function renderText(text: string | null): string {
  return text ?? ''
}

interface Props {
  message: Message
  prevMessage?: Message
  onReply?: (msg: Message) => void
}

export function MessageBubble({ message, prevMessage, onReply }: Props) {
  const { editMessage, deleteMessage } = useApp()
  const [hovering, setHovering] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(message.text ?? '')
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)

  const isOut = message.isOut
  const isAction = !!message.actionType
  const showAvatar = !prevMessage || prevMessage.isOut !== message.isOut

  async function submitEdit() {
    if (!editText.trim() || editText === message.text) {
      setEditing(false)
      return
    }
    await editMessage(message.id, editText.trim())
    setEditing(false)
  }

  if (isAction) {
    return (
      <div className="flex justify-center my-1 px-4">
        <span className="bg-[#182533] text-[#708499] text-xs px-3 py-1 rounded-full">
          {message.actionType}
        </span>
      </div>
    )
  }

  return (
    <div
      className={clsx('flex items-end gap-2 px-3 group', isOut ? 'flex-row-reverse' : 'flex-row', showAvatar ? 'mt-2' : 'mt-0.5')}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowDeleteMenu(false) }}
    >
      {/* Spacer where avatar would be on desktop */}
      <div className="w-0 lg:w-0" />

      {/* Bubble */}
      <div className={clsx('relative max-w-[75%] lg:max-w-[65%]')}>
        {/* Context actions */}
        {hovering && !editing && (
          <div
            className={clsx(
              'absolute top-1 flex items-center gap-1 z-10',
              isOut ? '-left-20' : '-right-20',
            )}
          >
            {onReply && (
              <button
                onClick={() => onReply(message)}
                className="p-1.5 rounded-lg bg-[#17212b] text-[#708499] hover:text-[#4d9eed] border border-[#0d1825] shadow"
                title="Reply"
              >
                <CornerDownRight size={13} />
              </button>
            )}
            {isOut && (
              <button
                onClick={() => { setEditing(true); setEditText(message.text ?? '') }}
                className="p-1.5 rounded-lg bg-[#17212b] text-[#708499] hover:text-[#4d9eed] border border-[#0d1825] shadow"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={() => setShowDeleteMenu((s) => !s)}
              className="p-1.5 rounded-lg bg-[#17212b] text-[#708499] hover:text-red-400 border border-[#0d1825] shadow"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>

            {showDeleteMenu && (
              <div className="absolute top-8 right-0 bg-[#1c2b3a] border border-[#0d1825] rounded-xl shadow-2xl z-20 min-w-[140px] overflow-hidden">
                <button
                  onClick={() => deleteMessage(message.id, false)}
                  className="w-full px-4 py-2.5 text-xs text-left text-[#e8eaed] hover:bg-[#2b5278] transition-colors"
                >
                  Delete for me
                </button>
                <button
                  onClick={() => deleteMessage(message.id, true)}
                  className="w-full px-4 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  Delete for everyone
                </button>
              </div>
            )}
          </div>
        )}

        {editing ? (
          <div className={clsx('rounded-2xl p-3 shadow-md', isOut ? 'bg-[#2b5278]' : 'bg-[#182533]')}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() }
                if (e.key === 'Escape') setEditing(false)
              }}
              rows={3}
              autoFocus
              className="w-full bg-transparent text-white text-sm resize-none outline-none"
            />
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setEditing(false)} className="text-[#708499] hover:text-white">
                <X size={14} />
              </button>
              <button onClick={submitEdit} className="text-[#4d9eed] hover:text-white text-xs font-medium">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              'relative px-3 py-2 shadow-md',
              isOut
                ? 'bg-[#2b5278] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl'
                : 'bg-[#182533] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl',
              !showAvatar && (isOut ? 'rounded-tr-2xl' : 'rounded-tl-2xl'),
            )}
          >
            <p className="text-[#e8eaed] text-sm whitespace-pre-wrap break-words leading-relaxed">
              {renderText(message.text)}
            </p>
            <div className={clsx('flex items-center gap-1 mt-1', isOut ? 'justify-end' : 'justify-end')}>
              {message.isEdited && (
                <span className="text-[10px] text-[#708499]">edited</span>
              )}
              <span className="text-[10px] text-[#708499]">{formatTime(message.date)}</span>
              {isOut && (
                <CheckCheck size={12} className="text-[#4d9eed]" />
              )}
              {!isOut && <Check size={12} className="text-[#708499]" />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
