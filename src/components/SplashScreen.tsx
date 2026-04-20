import { RefreshCw, AlertCircle } from 'lucide-react'
import { Spinner } from './common/Spinner'

interface Props {
  error?: string | null
  onRetry?: () => void
}

export function SplashScreen({ error, onRetry }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1621] select-none p-6">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/icon.svg"
          alt="Venysium"
          className="w-24 h-24 rounded-[28px] shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(77,158,237,0.25)' }}
        />
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">Venysium</h1>
          <p className="text-[#708499] text-sm mt-1">Entergram Workspace Chat</p>
        </div>

        {error ? (
          <div className="mt-2 max-w-sm w-full">
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-sm font-medium mb-1">Connection failed</p>
                <p className="text-red-400/70 text-xs leading-relaxed break-words">{error}</p>
              </div>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#17212b] hover:bg-[#1c2b3a] border border-[#2a3a4a] text-[#4d9eed] text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            )}

            <p className="text-center text-xs text-[#3d5267] mt-4 leading-relaxed">
              Make sure <code className="bg-[#17212b] px-1.5 py-0.5 rounded text-[#708499]">ENTERGRAM_API_KEY</code> is set in
              <br />
              Vercel → Project → Settings → Environment Variables
            </p>
          </div>
        ) : (
          <div className="mt-2 flex flex-col items-center gap-3">
            <Spinner size={28} />
            <p className="text-[#708499] text-xs">Connecting to workspace…</p>
          </div>
        )}
      </div>
    </div>
  )
}
