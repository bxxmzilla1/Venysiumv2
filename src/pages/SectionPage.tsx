import { useParams, Navigate } from 'react-router-dom'
import { API_SECTIONS } from '../data/endpoints'
import { EndpointCard } from '../components/EndpointCard'
import { useApiKey } from '../context/ApiKeyContext'
import { AlertTriangle, Key } from 'lucide-react'

export function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const { apiKey } = useApiKey()

  const section = API_SECTIONS.find((s) => s.id === sectionId)
  if (!section) return <Navigate to={`/${API_SECTIONS[0].id}`} replace />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
          <span>OAS 3.1.0</span>
          <span>·</span>
          <span>api.entergram.com</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{section.title}</h1>
        <p className="text-gray-400 mt-1">{section.description}</p>
      </div>

      {/* API key warning */}
      {!apiKey && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-300 font-medium">API Key required</p>
            <p className="text-amber-400/70 mt-0.5">
              Click the key icon in the sidebar to enter your{' '}
              <code className="bg-amber-500/20 px-1 rounded">X-API-Key</code> before testing requests.
            </p>
          </div>
          <Key size={14} className="text-amber-400 flex-shrink-0 mt-0.5 ml-auto" />
        </div>
      )}

      {/* Endpoint cards */}
      <div className="space-y-3">
        {section.endpoints.map((endpoint) => (
          <EndpointCard key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>
    </div>
  )
}
