import { useState } from 'react'
import { X, Eye, EyeOff, Key } from 'lucide-react'
import { useApiKey } from '../context/ApiKeyContext'

interface Props {
  onClose: () => void
}

export function ApiKeyModal({ onClose }: Props) {
  const { apiKey, setApiKey } = useApiKey()
  const [draft, setDraft] = useState(apiKey)
  const [show, setShow] = useState(false)

  function handleSave() {
    setApiKey(draft.trim())
    onClose()
  }

  function handleClear() {
    setDraft('')
    setApiKey('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-1 border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">API Key</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Your{' '}
          <code className="bg-surface-3 px-1.5 py-0.5 rounded text-blue-300 text-xs">X-API-Key</code>{' '}
          is stored only in your browser's localStorage — it never leaves your device.
        </p>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Paste your Entergram API key…"
            autoFocus
            className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-mono pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2">
          Generate keys in Entergram → Settings → Developers.
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Save Key
          </button>
          {apiKey && (
            <button
              onClick={handleClear}
              className="px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium py-2 rounded-lg border border-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
