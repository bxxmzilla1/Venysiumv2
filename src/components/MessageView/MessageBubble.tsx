import { useState } from 'react'
import { Check, CheckCheck, Pencil, Trash2, X, Reply } from 'lucide-react'
import { Message } from '../../types/api'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** True if this message is consecutive with the previous one (same direction, <5 min gap) */
export function isGroupedWith(msg: Message, prev?: Message): boolean {
  if (!prev) return false
  if (msg.isOut !== prev.isOut) return false
  if (msg.actionType || prev.actionType) return false
  return new Date(msg.date).getTime() - new Date(prev.date).getTime() < 5 * 60 * 1000
}

/** True if this message is the LAST in its group (tail bubble) */
export function isTailBubble(msg: Message, next?: Message): boolean {
  if (!next) return true
  if (msg.isOut !== next.isOut) return true
  if (msg.actionType || next.actionType) return true
  return new Date(next.date).getTime() - new Date(msg.date).getTime() >= 5 * 60 * 1000
}

interface Props {
  message: Message
  prevMessage?: Message
  nextMessage?: Message
  onReply: (msg: Message) => void
}

export function MessageBubble({ message, prevMessage, nextMessage, onReply }: Props) {
  const { editMessage, deleteMessage } = useApp()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(message.text ?? '')
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)

  const isOut = message.isOut
  const isAction = !!message.actionType
  const grouped = isGroupedWith(message, prevMessage)
  const tail = isTailBubble(message, nextMessage)

  async function submitEdit() {
    const trimmed = editText.trim()
    if (!trimmed || trimmed === message.text) { setEditing(false); return }
    await editMessage(message.id, trimmed)
    setEditing(false)
  }

  // ── Service / action message ──────────────────────────────────────────────
  if (isAction) {
    return (
      <div className="flex justify-center py-1 px-4">
        <span className="bg-[#182533]/80 text-[#708499] text-xs px-3 py-1 rounded-full">
          {message.actionType}
        </span>
      </div>
    )
  }

  // ── Bubble corner radii ───────────────────────────────────────────────────
  // Telegram-style: tail corner = 4px, others = 18px
  const R = '18px'
  const T = '4px'
  const borderRadius = isOut
    ? tail
      ? `${R} ${R} ${T} ${R}`   // out + tail: sharp bottom-right
      : `${R} ${R} ${R} ${R}`
    : tail
    ? `${R} ${R} ${R} ${T}`     // in + tail: sharp bottom-left
    : `${R} ${R} ${R} ${R}`

  const bubbleBg = isOut ? '#2b5278' : '#182533'
  const mt = grouped ? '2px' : '8px'
  // Add bottom margin when this is a tail bubble (visual separation between groups)
  const mb = tail ? '2px' : '0'

  return (
    <div
      className={clsx('flex px-3 group/bubble', isOut ? 'justify-end' : 'justify-start')}
      style={{ marginTop: mt, marginBottom: mb }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDeleteMenu(false) }}
    >
      <div className="relative max-w-[75%] lg:max-w-[60%]">
        {/* ── Context action buttons ─────────────────────────────────── */}
        {hovered && !editing && (
          <div
            className={clsx(
              'absolute top-0 flex items-center gap-1 z-20',
              isOut ? 'right-full pr-2' : 'left-full pl-2',
            )}
          >
            <ActionBtn icon={<Reply size={13} />} label="Reply" onClick={() => onReply(message)} />
            {isOut && (
              <ActionBtn
                icon={<Pencil size={13} />}
                label="Edit"
                onClick={() => { setEditing(true); setEditText(message.text ?? '') }}
              />
            )}
            <ActionBtn
              icon={<Trash2 size={13} />}
              label="Delete"
              danger
              onClick={() => setShowDeleteMenu((s) => !s)}
            />
            {showDeleteMenu && (
              <div
                className={clsx(
                  'absolute top-8 bg-[#1c2b3a] border border-[#243447] rounded-2xl shadow-2xl z-30 overflow-hidden min-w-[160px]',
                  isOut ? 'right-0' : 'left-0',
                )}
              >
                <button
                  onClick={() => deleteMessage(message.id, false)}
                  className="w-full px-4 py-3 text-sm text-left text-[#e8eaed] hover:bg-[#243447] transition-colors"
                >
                  Delete for me
                </button>
                <div className="h-px bg-[#0d1825]" />
                <button
                  onClick={() => deleteMessage(message.id, true)}
                  className="w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete for everyone
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Bubble ────────────────────────────────────────────────── */}
        {editing ? (
          <div
            className="px-3 py-2.5 shadow-md"
            style={{ background: bubbleBg, borderRadius }}
          >
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() }
                if (e.key === 'Escape') setEditing(false)
              }}
              rows={3}
              autoFocus
              className="w-full bg-transparent text-[#e8eaed] text-sm resize-none outline-none leading-relaxed min-w-[200px]"
            />
            <div className="flex items-center justify-end gap-3 mt-1.5">
              <button
                onClick={() => setEditing(false)}
                className="text-[#708499] hover:text-white text-xs flex items-center gap-1"
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={submitEdit}
                className="text-[#4d9eed] hover:text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className="px-3 py-2 shadow-sm"
            style={{ background: bubbleBg, borderRadius }}
          >
            {/* Message text */}
            <p className="text-[#e8eaed] text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.text ?? <span className="text-[#708499] italic">Media message</span>}
            </p>

            {/* Footer: edited tag + time + tick */}
            <div className={clsx('flex items-center gap-1.5 mt-0.5', isOut ? 'justify-end' : 'justify-end')}>
              {message.isEdited && (
                <span className="text-[10px] text-[#708499]">edited</span>
              )}
              <span className="text-[10px] text-[#708499] tabular-nums">{formatTime(message.date)}</span>
              {isOut ? (
                <CheckCheck size={13} className="text-[#4d9eed] flex-shrink-0" />
              ) : (
                <Check size={13} className="text-[#708499] flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={clsx(
        'w-7 h-7 flex items-center justify-center rounded-full border border-[#243447] bg-[#17212b] shadow-lg transition-colors',
        danger ? 'text-[#708499] hover:text-red-400 hover:border-red-500/40' : 'text-[#708499] hover:text-[#4d9eed] hover:border-[#4d9eed]/40',
      )}
    >
      {icon}
    </button>
  )
}
