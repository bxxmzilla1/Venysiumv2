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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../common/Avatar'
import { Spinner } from '../common/Spinner'
import { Account } from '../../types/api'
import { ApiError } from '../../lib/api'
import clsx from 'clsx'

function formatError(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e.body ? JSON.stringify(e.body, null, 2) : ''
    return `HTTP ${e.status}: ${e.message}${body ? '\n' + body : ''}`
  }
  return String(e)
}

export function accountLabel(a: Account): string {
  return a.displayName ?? a.phoneNumber ?? `Account …${a.id.slice(-6)}`
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
        <p className="font-semibold text-white text-sm truncate">{name}</p>
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

// ── Diagnostics accordion ─────────────────────────────────────────────────────
function DiagnosticsPanel({ me, accounts, lastError }: {
  me: { workspace: { name: string; id: string } } | null
  accounts: Account[]
  lastError: string | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[#0e1621] border border-[#1c2b3a] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#1c2b3a] transition-colors"
      >
        <Info size={13} className="text-[#708499] flex-shrink-0" />
        <span className="text-xs text-[#708499] flex-1">API Diagnostics</span>
        {open ? <ChevronUp size={12} className="text-[#3d5267]" /> : <ChevronDown size={12} className="text-[#3d5267]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-[#1c2b3a] pt-3">
          <Row label="Workspace" value={me?.workspace.name ?? '—'} />
          <Row label="Workspace ID" value={me?.workspace.id ?? '—'} mono />
          <Row
            label="Accounts from API"
            value={`${accounts.length} found`}
            ok={accounts.length > 0}
          />
          {accounts.map((a, i) => (
            <Row key={a.id} label={`  Account ${i + 1}`} value={accountLabel(a)} mono />
          ))}
          {lastError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-2">
              <pre className="text-red-400 text-[10px] font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{lastError}</pre>
            </div>
          )}
          <p className="text-[10px] text-[#3d5267] pt-1 leading-relaxed">
            If Accounts from API shows 0, your Telegram account is not yet connected to this Entergram workspace.
            Open Entergram and go to <span className="text-[#708499]">Settings → Telegram Accounts</span>.
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono, ok }: { label: string; value: string; mono?: boolean; ok?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-[#3d5267] w-32 flex-shrink-0">{label}</span>
      <span className={clsx(
        'text-[10px] break-all flex-1',
        ok === false ? 'text-amber-400' : ok === true ? 'text-green-400' : 'text-[#708499]',
        mono && 'font-mono',
      )}>
        {value}
      </span>
    </div>
  )
}

// ── Popup watcher state ───────────────────────────────────────────────────────
type ConnectState = 'idle' | 'open' | 'checking' | 'success' | 'blocked' | 'error'

// ── Main panel ───────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void
}

export function AccountsPanel({ onBack }: Props) {
  const { me, accounts, accountsLoading, refreshAccounts, selectedAccount, setSelectedAccount } =
    useApp()

  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [checkCount, setCheckCount] = useState(0)
  const [pollFound, setPollFound] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [prevCount, setPrevCount] = useState(accounts.length)
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll accounts every 3s while in checking state
  useEffect(() => {
    if (connectState !== 'checking') return

    setCheckCount(0)
    refreshTimerRef.current = setInterval(async () => {
      setCheckCount((c) => c + 1)
      try {
        const accts = await refreshAccounts()
        setPollFound(accts?.length ?? 0)
        if ((accts?.length ?? 0) > prevCount) {
          clearInterval(refreshTimerRef.current!)
          setConnectState('success')
          setTimeout(() => setConnectState('idle'), 3500)
        }
      } catch (e) {
        setLastError(formatError(e))
        clearInterval(refreshTimerRef.current!)
        setConnectState('error')
      }
    }, 3000)

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectState])

  function handleConnect() {
    setPrevCount(accounts.length)
    setPollFound(null)
    setLastError(null)
    setCheckCount(0)
    setConnectState('open')

    const w = 960
    const h = 700
    const left = Math.max(0, (window.screen.width - w) / 2)
    const top = Math.max(0, (window.screen.height - h) / 2)

    const popup = window.open(
      'https://app.entergram.com',
      'entergram_connect',
      `width=${w},height=${h},left=${left},top=${top},toolbar=1,menubar=0,scrollbars=1`,
    )

    if (!popup) {
      setConnectState('blocked')
      return
    }

    popupRef.current = popup

    pollRef.current = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollRef.current!)
        setConnectState('checking')
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
    setLastError(null)
    try {
      const accts = await refreshAccounts()
      setPollFound(accts?.length ?? 0)
    } catch (e) {
      setLastError(formatError(e))
    }
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
          title="Refresh accounts"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#708499] hover:text-[#4d9eed] hover:bg-[#1c2b3a] transition-colors disabled:opacity-40"
        >
          {accountsLoading ? <Spinner size={14} /> : <RefreshCw size={14} />}
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

        {/* ── Poll feedback (outside checking state) ─────────────── */}
        {pollFound !== null && connectState === 'idle' && (
          <div className={clsx(
            'rounded-xl px-4 py-2.5 text-xs flex items-center gap-2',
            (pollFound ?? 0) > 0
              ? 'bg-green-500/10 border border-green-500/25 text-green-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-300',
          )}>
            {(pollFound ?? 0) > 0
              ? <CheckCircle2 size={13} />
              : <AlertCircle size={13} />}
            {(pollFound ?? 0) > 0
              ? `${pollFound} account${pollFound !== 1 ? 's' : ''} found`
              : 'API returned 0 accounts — see diagnostics below'}
          </div>
        )}

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
                Sign in to Entergram, go to Settings → Telegram Accounts
              </p>
            </div>
          </button>
        )}

        {connectState === 'open' && (
          <div className="bg-[#0e1621] border border-[#243447] rounded-2xl p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4d9eed]/15 flex items-center justify-center">
                <ExternalLink size={26} className="text-[#4d9eed]" />
              </div>
              <p className="text-white font-semibold text-sm">Entergram is open</p>
            </div>
            <ol className="space-y-2">
              {[
                'Log in to Entergram if prompted',
                'Go to Settings (gear icon)',
                'Tap Telegram Accounts',
                'Connect your Telegram account',
                'Then close that window',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2b5278] text-[#4d9eed] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-[#a0b8cc]">{step}</span>
                </li>
              ))}
            </ol>
            <div className="flex items-center justify-center gap-1.5 text-[#708499] text-xs pt-1">
              <Loader2 size={13} className="animate-spin" />
              Waiting for you to close the window…
            </div>
            <button
              onClick={handleCancel}
              className="w-full text-xs text-[#3d5267] hover:text-[#708499] transition-colors underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        )}

        {connectState === 'checking' && (
          <div className="bg-[#0e1621] border border-[#243447] rounded-2xl p-5 text-center space-y-3">
            <Loader2 size={28} className="animate-spin text-[#4d9eed] mx-auto" />
            <div>
              <p className="text-white font-semibold text-sm">Checking for your account…</p>
              <p className="text-[#708499] text-xs mt-1">
                Check #{checkCount} · Currently {accounts.length} account{accounts.length !== 1 ? 's' : ''} in workspace
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-xs text-[#3d5267] hover:text-[#708499] transition-colors underline underline-offset-2"
            >
              Stop checking
            </button>
          </div>
        )}

        {connectState === 'success' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center space-y-2">
            <CheckCircle2 size={32} className="text-green-400 mx-auto" />
            <p className="text-green-400 font-semibold text-sm">Account connected!</p>
            <p className="text-[#708499] text-xs">Your Telegram account is ready to use.</p>
          </div>
        )}

        {connectState === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 font-semibold text-sm">API error while checking</p>
            </div>
            {lastError && (
              <pre className="text-[10px] text-red-400/80 font-mono whitespace-pre-wrap break-all bg-red-500/5 rounded-lg p-2 max-h-40 overflow-y-auto">
                {lastError}
              </pre>
            )}
            <button
              onClick={() => setConnectState('idle')}
              className="text-xs text-[#708499] hover:text-white transition-colors underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {connectState === 'blocked' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 font-semibold text-sm">Popup was blocked</p>
            </div>
            <p className="text-[#708499] text-xs leading-relaxed">
              Allow popups for this site, or open Entergram manually. When you're done, tap "I'm done" below.
            </p>
            <a
              href="https://app.entergram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#4d9eed] hover:bg-[#5ba3f0] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Open Entergram <ExternalLink size={14} />
            </a>
            <button
              onClick={() => setConnectState('checking')}
              className="w-full text-xs text-[#4d9eed] hover:text-white transition-colors py-1"
            >
              I'm done — check for accounts now
            </button>
            <button
              onClick={() => setConnectState('idle')}
              className="w-full text-xs text-[#3d5267] hover:text-[#708499] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {accounts.length === 0 && connectState === 'idle' && (
          <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
            <Smartphone size={32} className="text-[#2b5278]" />
            <p className="text-[#708499] text-sm font-medium">No accounts found</p>
            <p className="text-[#3d5267] text-xs leading-relaxed max-w-[230px]">
              Connect a Telegram account in Entergram, then tap the button above
            </p>
          </div>
        )}

        {/* ── Diagnostics ───────────────────────────────────────── */}
        <DiagnosticsPanel me={me} accounts={accounts} lastError={lastError} />
      </div>
    </div>
  )
}
