import { useState } from 'react'
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Plus,
  Hash,
  ChevronRight,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../common/Avatar'
import { Spinner } from '../common/Spinner'
import { Account } from '../../types/api'
import clsx from 'clsx'

export function accountLabel(a: Account): string {
  return a.displayName ?? a.phoneNumber ?? `Account ${a.id.slice(-6)}`
}

// ── Individual account card ──────────────────────────────────────────────────
function AccountCard({
  account,
  isSelected,
  onSelect,
}: {
  account: Account
  isSelected: boolean
  onSelect: () => void
}) {
  const name = accountLabel(account)

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left border',
        isSelected
          ? 'bg-[#2b5278]/30 border-[#2b5278] shadow-inner'
          : 'bg-[#0e1621] border-[#1c2b3a] hover:border-[#2b5278]/50 hover:bg-[#1c2b3a]',
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={name} size={48} />
        {isSelected && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4d9eed] border-2 border-[#17212b] flex items-center justify-center">
            <CheckCircle2 size={11} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white text-sm truncate">{name}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Smartphone size={11} className="text-[#708499] flex-shrink-0" />
          <span className="text-xs text-[#708499] capitalize">{account.platform || 'telegram'}</span>
          {account.chatCount > 0 && (
            <>
              <span className="text-[#3d5267]">·</span>
              <Hash size={10} className="text-[#3d5267]" />
              <span className="text-xs text-[#3d5267]">{account.chatCount} chats</span>
            </>
          )}
        </div>
        {account.telegramUserId && (
          <p className="text-[10px] text-[#3d5267] mt-0.5 font-mono">
            ID: {account.telegramUserId}
          </p>
        )}
      </div>

      {isSelected ? (
        <span className="text-[10px] font-semibold text-[#4d9eed] bg-[#4d9eed]/15 px-2 py-0.5 rounded-full flex-shrink-0">
          Active
        </span>
      ) : (
        <ChevronRight size={14} className="text-[#3d5267] flex-shrink-0" />
      )}
    </button>
  )
}

// ── Connect modal ────────────────────────────────────────────────────────────
function ConnectModal({ onClose }: { onClose: () => void }) {
  const steps = [
    { n: 1, text: 'Open the Entergram web app' },
    { n: 2, text: 'Go to Settings → Accounts' },
    { n: 3, text: 'Click "Connect Telegram Account"' },
    { n: 4, text: 'Scan the QR code or enter your phone number' },
    { n: 5, text: 'Come back here and tap Refresh' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#17212b] border border-[#243447] rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#708499] hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#2b5278] flex items-center justify-center mb-4">
          <Smartphone size={28} className="text-[#4d9eed]" />
        </div>

        <h2 className="text-white font-bold text-lg mb-1">Connect Telegram Account</h2>
        <p className="text-[#708499] text-sm mb-5">
          Telegram accounts are connected through the Entergram web app. Follow these steps:
        </p>

        {/* Steps */}
        <ol className="space-y-3 mb-6">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#4d9eed]/20 text-[#4d9eed] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.n}
              </span>
              <span className="text-sm text-[#e8eaed] leading-snug">{s.text}</span>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <a
          href="https://app.entergram.com/settings/accounts"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#4d9eed] hover:bg-[#5ba3f0] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Open Entergram
          <ExternalLink size={15} />
        </a>

        <p className="text-center text-[10px] text-[#3d5267] mt-3">
          After connecting, tap Refresh Accounts in this app
        </p>
      </div>
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void
}

export function AccountsPanel({ onBack }: Props) {
  const { accounts, accountsLoading, refreshAccounts, selectedAccount, setSelectedAccount } =
    useApp()
  const [showModal, setShowModal] = useState(false)
  const [justRefreshed, setJustRefreshed] = useState(false)

  async function handleRefresh() {
    await refreshAccounts()
    setJustRefreshed(true)
    setTimeout(() => setJustRefreshed(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#17212b]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#0d1825]">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#4d9eed] hover:bg-[#1c2b3a] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-bold text-white text-base flex-1">Telegram Accounts</h2>
        <button
          onClick={handleRefresh}
          disabled={accountsLoading}
          title="Refresh accounts"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#708499] hover:text-[#4d9eed] hover:bg-[#1c2b3a] transition-colors disabled:opacity-40"
        >
          {accountsLoading ? (
            <Spinner size={15} />
          ) : (
            <RefreshCw
              size={15}
              className={clsx('transition-transform', justRefreshed && 'text-[#4d9eed]')}
            />
          )}
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Connected accounts */}
        {accounts.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold text-[#708499] uppercase tracking-widest mb-2 px-1">
              Connected Accounts ({accounts.length})
            </p>
            <div className="space-y-2">
              {accounts.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  isSelected={a.id === selectedAccount?.id}
                  onSelect={() => setSelectedAccount(a)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
            <Smartphone size={32} className="text-[#2b5278]" />
            <p className="text-[#708499] text-sm">No Telegram accounts connected</p>
            <p className="text-[#3d5267] text-xs">
              Connect one in the Entergram web app
            </p>
          </div>
        )}

        {/* Add account CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-[#2b5278]/60 hover:border-[#4d9eed] hover:bg-[#2b5278]/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[#4d9eed]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4d9eed]/25 transition-colors">
            <Plus size={20} className="text-[#4d9eed]" />
          </div>
          <div className="text-left">
            <p className="text-[#4d9eed] font-semibold text-sm">Connect Telegram Account</p>
            <p className="text-[#708499] text-xs mt-0.5">Add a new account to send messages</p>
          </div>
        </button>

        {/* Info card */}
        <div className="bg-[#0e1621] border border-[#1c2b3a] rounded-2xl p-4">
          <p className="text-xs text-[#708499] leading-relaxed">
            <span className="text-[#e8eaed] font-medium">How sending works: </span>
            Messages are sent through whichever account you select above. The recipient will see it
            as a Telegram message from that account.
          </p>
        </div>
      </div>

      {showModal && <ConnectModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
