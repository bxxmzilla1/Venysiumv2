import { AppProvider, useApp } from './context/AppContext'
import { AuthScreen } from './components/AuthScreen'
import { ChatApp } from './components/ChatApp'
import { Spinner } from './components/common/Spinner'

function Inner() {
  const { apiKey, me, meLoading, meError } = useApp()

  // No key yet → auth screen
  if (!apiKey) return <AuthScreen />

  // Key set but we got an auth error → show auth screen with error
  if (meError) return <AuthScreen />

  // Key set, loading bootstrap data
  if (meLoading && !me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1621]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={32} />
          <p className="text-[#708499] text-sm">Connecting to Entergram…</p>
        </div>
      </div>
    )
  }

  // Authenticated → full chat UI
  return <ChatApp />
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
