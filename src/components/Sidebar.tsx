import { NavLink } from 'react-router-dom'
import {
  Cpu,
  Building2,
  Users,
  BookUser,
  MessageSquare,
  Send,
  LayoutGrid,
  Ticket,
  Key,
  X,
  LucideIcon,
} from 'lucide-react'
import { API_SECTIONS } from '../data/endpoints'
import { useApiKey } from '../context/ApiKeyContext'
import clsx from 'clsx'

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  Building2,
  Users,
  BookUser,
  MessageSquare,
  Send,
  LayoutGrid,
  Ticket,
}

interface Props {
  onApiKeyClick: () => void
  onClose?: () => void
}

export function Sidebar({ onApiKeyClick, onClose }: Props) {
  const { apiKey } = useApiKey()

  return (
    <aside className="flex flex-col h-full bg-surface-1 border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="Venysium" className="w-7 h-7 rounded-md" />
          <div>
            <p className="font-bold text-white text-sm leading-tight">Venysium</p>
            <p className="text-xs text-gray-500 leading-tight">Entergram API</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* API Key button */}
      <div className="px-3 py-3 border-b border-border">
        <button
          onClick={onApiKeyClick}
          className={clsx(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
            apiKey
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/15'
              : 'bg-surface-3 text-gray-400 border border-border hover:bg-surface-4',
          )}
        >
          <Key size={14} />
          <span className="font-mono text-xs truncate flex-1 text-left">
            {apiKey ? `${apiKey.slice(0, 8)}…` : 'Set API Key'}
          </span>
          <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', apiKey ? 'bg-green-400' : 'bg-gray-600')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">
          Endpoints
        </p>
        {API_SECTIONS.map((section) => {
          const Icon = ICONS[section.icon] ?? Cpu
          return (
            <NavLink
              key={section.id}
              to={`/${section.id}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full',
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-2',
                )
              }
            >
              <Icon size={15} className="flex-shrink-0" />
              <span>{section.title}</span>
              <span className="ml-auto text-xs text-gray-600 font-mono">
                {section.endpoints.length}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-gray-600">
          <a
            href="https://api.entergram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            api.entergram.com ↗
          </a>
        </p>
      </div>
    </aside>
  )
}
