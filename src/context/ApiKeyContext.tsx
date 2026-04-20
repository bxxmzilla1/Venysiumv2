import { createContext, useContext, useState, ReactNode } from 'react'
import { getStoredApiKey, setStoredApiKey } from '../lib/storage'

interface ApiKeyContextValue {
  apiKey: string
  setApiKey: (key: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null)

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(getStoredApiKey)

  function setApiKey(key: string) {
    setApiKeyState(key)
    setStoredApiKey(key)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey(): ApiKeyContextValue {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKey must be used inside ApiKeyProvider')
  return ctx
}
