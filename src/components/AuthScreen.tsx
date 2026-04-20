import { useState } from 'react'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function AuthScreen() {
  const { setApiKey, meError, meLoading } = useApp()
  const [draft, setDraft] = useState('')
  const [show, setShow] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (trimmed) setApiKey(trimmed)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1621] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/icon.svg" alt="Venysium" className="w-20 h-20 rounded-2xl mb-4 shadow-2xl" />
          <h1 className="text-2xl font-bold text-white">Venysium</h1>
          <p className="text-[#708499] text-sm mt-1">Entergram Workspace Chat</p>
        </div>

        {/* Card */}
        <div className="bg-[#17212b] rounded-2xl p-6 shadow-2xl border border-[#0d1825]">
          <h2 className="text-white font-semibold mb-1">Sign in with API Key</h2>
          <p className="text-[#708499] text-sm mb-5">
            Generate your key in{' '}
            <a
              href="https://app.entergram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4d9eed] hover:underline"
            >
              Entergram → Settings → Developers
            </a>
          </p>

          {meError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs leading-relaxed">{meError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#708499] mb-1.5 uppercase tracking-wide">
                X-API-Key
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Paste your API key…"
                  autoFocus
                  className="w-full bg-[#06090d] border border-[#2a3a4a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5267] font-mono focus:outline-none focus:border-[#4d9eed] focus:ring-1 focus:ring-[#4d9eed]/30 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#708499] hover:text-white transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!draft.trim() || meLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#4d9eed] hover:bg-[#5ba3f0] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {meLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn size={16} />
              )}
              {meLoading ? 'Connecting…' : 'Connect Workspace'}
            </button>
          </form>

          <p className="text-center text-xs text-[#3d5267] mt-4">
            Your key is stored only in this browser.
          </p>
        </div>
      </div>
    </div>
  )
}
