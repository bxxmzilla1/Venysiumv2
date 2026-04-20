import { AppProvider, useApp } from './context/AppContext'
import { SplashScreen } from './components/SplashScreen'
import { ChatApp } from './components/ChatApp'

function Inner() {
  const { bootstrapLoading, bootstrapError, retry } = useApp()

  if (bootstrapLoading) return <SplashScreen />
  if (bootstrapError) return <SplashScreen error={bootstrapError} onRetry={retry} />

  return <ChatApp />
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
