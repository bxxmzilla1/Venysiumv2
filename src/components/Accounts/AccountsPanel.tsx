import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Plus,
  Hash,
  ChevronRight,
  Loader2,
  ExternalLink,
  WifiOff,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../common/Avatar'
import { Spinner } from '../common/Spinner'
import { Account } from '../../types/api'
import clsx from 'clsx'

export function accountLabel(a: Account): string {
  return a.displayName ?? a.phoneNumber ?? `Account ${a.id.slice(-6)}`
}

// ── Account card ─────────────────────────────────────────────────────────────
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
          ? 'bg-[#2b5278]/30 border-[#2b5278]'
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
        <span className="text-[10px] font-bold text-[#4d9eed] bg-[#4d9eed]/15 px-2 py-0.5 rounded-full flex-shrink-0">
          Active
        </span>
      ) : (
        <ChevronRight size={14} className="text-[#3d5267] flex-shrink-0" />
      )}
    </button>
  )
}

// ── Popup watcher state ───────────────────────────────────────────────────────
type ConnectState = 'idle' | 'open' | 'checking' | 'success' | 'blocked'

// ── Main panel ───────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void
}

export function AccountsPanel({ onBack }: Props) {
  const { accounts, accountsLoading, refreshAccounts, selectedAccount, setSelectedAccount } =
    useApp()

  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [prevCount, setPrevCount] = useState(accounts.length)
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Detect new account after popup closes
  useEffect(() => {
    if (connectState === 'checking') {
      refreshTimerRef.current = setInterval(async () => {
        await refreshAccounts()
      }, 3000)
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [connectState, refreshAccounts])

  // Watch if accounts count grew → success
  useEffect(() => {
    if (connectState === 'checking' && accounts.length > prevCount) {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
      setConnectState('success')
      setTimeout(() => setConnectState('idle'), 3000)
    }
  }, [accounts.length, connectState, prevCount])

  function handleConnect() {
    setPrevCount(accounts.length)
    setConnectState('open')

    const w = 920
    const h = 680
    const left = Math.max(0, (window.screen.width - w) / 2)
    const top = Math.max(0, (window.screen.height - h) / 2)

    const popup = window.open(
      'https://app.entergram.com',
      'entergram_connect',
      `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1`,
    )

    if (!popup) {
      // Popup blocked by browser — fall back gracefully
      setConnectState('blocked')
      return
    }

    popupRef.current = popup

    // Watch for the popup to close
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        if (pollRef.current) clearInterval(pollRef.current)
        setConnectState('checking')
        refreshAccounts()
      }
    }, 600)
  }

  function handleCancel() {
    popupRef.current?.close()
    if (pollRef.current) clearInterval(pollRef.current)
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    setConnectState('idle')
  }

  async function handleManualRefresh() {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    setConnectState('checking')
    await refreshAccounts()
    setConnectState('idle')
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
          onClick={handleManualRefresh}
          disabled={accountsLoading}
          title="Refresh"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#708499] hover:text-[#4d9eed] hover:bg-[#1c2b3a] transition-colors disabled:opacity-40"
        >
          {accountsLoading ? <Spinner size={14} /> : <RefreshCw size={14} />}
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

        {/* ── Accounts list ──────────────────────────────────────── */}
        {accounts.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#708499] uppercase tracking-widest mb-2 px-1">
              Connected ({accounts.length})
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
        )}

        {/* ── Connect states ────────────────────────────────────── */}

        {connectState === 'idle' && (
          <button
            onClick={handleConnect}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-[#2b5278]/60 hover:border-[#4d9eed] hover:bg-[#2b5278]/10 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#4d9eed]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4d9eed]/25 transition-colors">
              <Plus size={22} className="text-[#4d9eed]" />
            </div>
            <div className="text-left">
              <p className="text-[#4d9eed] font-semibold text-sm">Connect Telegram Account</p>
              <p className="text-[#708499] text-xs mt-0.5">
                Opens Entergram — go to Settings → Accounts and connect yours
              </p>
            </div>
          </button>
        )}

        {connectState === 'open' && (
          <div className="bg-[#0e1621] border border-[#243447] rounded-2xl p-5 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4d9eed]/15 flex items-center justify-center">
              <ExternalLink size={26} className="text-[#4d9eed]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Entergram is open</p>
              <p className="text-[#708499] text-xs mt-1 leading-relaxed">
                In the Entergram window, go to{' '}
                <span className="text-white font-medium">Settings → Accounts</span>{' '}
                and connect your Telegram account.
                <br className="mb-1" />
                This app will detect it automatically when you close the window.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[#708499] text-xs">
              <Loader2 size={13} className="animate-spin" />
              Waiting for you to finish…
            </div>
            <button
              onClick={handleCancel}
              className="text-xs text-[#3d5267] hover:text-[#708499] transition-colors underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        )}

        {connectState === 'checking' && (
          <div className="bg-[#0e1621] border border-[#243447] rounded-2xl p-5 text-center space-y-3">
            <Loader2 size={28} className="animate-spin text-[#4d9eed] mx-auto" />
            <div>
              <p className="text-white font-semibold text-sm">Checking for new account…</p>
              <p className="text-[#708499] text-xs mt-1">Polling every 3 seconds</p>
            </div>
            <button
              onClick={() => setConnectState('idle')}
              className="text-xs text-[#3d5267] hover:text-[#708499] transition-colors underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        )}

        {connectState === 'success' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center space-y-2">
            <CheckCircle2 size={32} className="text-green-400 mx-auto" />
            <p className="text-green-400 font-semibold text-sm">Account connected!</p>
            <p className="text-[#708499] text-xs">Your new Telegram account is ready to use.</p>
          </div>
        )}

        {connectState === 'blocked' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 font-semibold text-sm">Popup was blocked</p>
            </div>
            <p className="text-[#708499] text-xs leading-relaxed">
              Your browser blocked the popup. Allow popups for this site, or open Entergram manually:
            </p>
            <a
              href="https://app.entergram.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { setConnectState('checking') }}
              className="flex items-center justify-center gap-2 w-full bg-[#4d9eed] hover:bg-[#5ba3f0] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Open Entergram <ExternalLink size={14} />
            </a>
            <button
              onClick={() => setConnectState('idle')}
              className="w-full text-xs text-[#3d5267] hover:text-[#708499] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Info box ───────────────────────────────────────────── */}
        {accounts.length === 0 && connectState === 'idle' && (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <Smartphone size={36} className="text-[#2b5278]" />
            <p className="text-[#708499] text-sm font-medium">No accounts yet</p>
            <p className="text-[#3d5267] text-xs leading-relaxed max-w-[220px]">
              Connect your Telegram account above to start sending messages
            </p>
          </div>
        )}

        <div className="bg-[#0e1621] border border-[#1c2b3a] rounded-2xl p-4">
          <p className="text-xs text-[#708499] leading-relaxed">
            <span className="text-[#e8eaed] font-medium">How it works: </span>
            Entergram manages the Telegram connection securely. Once connected here, you can send
            and read messages using that account from this app.
          </p>
        </div>
      </div>
    </div>
  )
}
