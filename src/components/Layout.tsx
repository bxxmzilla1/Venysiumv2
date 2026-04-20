import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ApiKeyModal } from './ApiKeyModal'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0">
        <div className="w-full">
          <Sidebar onApiKeyClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 h-full shadow-2xl">
            <Sidebar
              onApiKeyClick={() => {
                setSidebarOpen(false)
                setModalOpen(true)
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center gap-3 px-4 py-3 border-b border-border bg-surface-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Venysium" className="w-6 h-6 rounded" />
            <span className="font-semibold text-white text-sm">Venysium</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {modalOpen && <ApiKeyModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
