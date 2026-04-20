import { useState } from 'react'
import { ChevronDown, Play, Loader2 } from 'lucide-react'
import { ApiEndpoint, ApiResponse } from '../types'
import { MethodBadge } from './MethodBadge'
import { ResponseViewer } from './ResponseViewer'
import { callApi } from '../lib/api'
import { useApiKey } from '../context/ApiKeyContext'
import clsx from 'clsx'

interface Props {
  endpoint: ApiEndpoint
}

export function EndpointCard({ endpoint }: Props) {
  const { apiKey } = useApiKey()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleRun() {
    if (!apiKey) {
      alert('Please set your X-API-Key first.')
      return
    }
    setLoading(true)
    setResponse(null)
    try {
      const res = await callApi({ endpoint, formValues: values, apiKey })
      setResponse(res)
    } finally {
      setLoading(false)
    }
  }

  const pathParams = endpoint.params.filter((p) => p.in === 'path')
  const queryParams = endpoint.params.filter((p) => p.in === 'query')
  const bodyParams = endpoint.params.filter((p) => p.in === 'body')

  const hasParams = endpoint.params.length > 0

  function renderPreviewPath() {
    let preview = endpoint.path
    for (const p of pathParams) {
      const val = values[p.name]
      preview = preview.replace(`{${p.name}}`, val ? val : `{${p.name}}`)
    }
    return preview
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm text-gray-300 font-mono truncate">{endpoint.path}</code>
          <span className="hidden sm:block text-sm text-gray-500 truncate">{endpoint.title}</span>
        </div>
        <ChevronDown
          size={16}
          className={clsx('text-gray-500 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: description + params */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-white text-sm">{endpoint.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{endpoint.description}</p>
                {endpoint.scopes && endpoint.scopes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Required scopes:{' '}
                    {endpoint.scopes.map((s) => (
                      <code key={s} className="bg-surface-3 px-1.5 py-0.5 rounded text-blue-300 text-xs ml-1">
                        {s}
                      </code>
                    ))}
                  </p>
                )}
              </div>

              {hasParams && (
                <div className="space-y-3">
                  {pathParams.length > 0 && (
                    <ParamGroup label="Path Parameters" params={pathParams} values={values} setValue={setValue} />
                  )}
                  {queryParams.length > 0 && (
                    <ParamGroup label="Query Parameters" params={queryParams} values={values} setValue={setValue} />
                  )}
                  {bodyParams.length > 0 && (
                    <ParamGroup label="Body" params={bodyParams} values={values} setValue={setValue} />
                  )}
                </div>
              )}
            </div>

            {/* Right: request preview + response */}
            <div className="p-4 space-y-4">
              <div className="rounded-md bg-[#0a0a0a] border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MethodBadge method={endpoint.method} />
                    <code className="text-xs text-gray-400 font-mono">{renderPreviewPath()}</code>
                  </div>
                </div>
                <pre className="text-xs text-gray-500 font-mono">
                  {`curl https://api.entergram.com${renderPreviewPath()} \\`}
                  {'\n'}
                  {`  --header 'X-API-Key: ${apiKey || 'YOUR_SECRET_TOKEN'}'`}
                  {endpoint.method !== 'GET' && Object.keys(values).some((k) => bodyParams.find((p) => p.name === k))
                    ? `\n  --request ${endpoint.method}`
                    : endpoint.method !== 'GET'
                    ? `\n  --request ${endpoint.method}`
                    : ''}
                </pre>
              </div>

              <button
                onClick={handleRun}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                {loading ? 'Running…' : 'Test Request'}
              </button>

              {response && <ResponseViewer response={response} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ParamGroupProps {
  label: string
  params: ApiEndpoint['params']
  values: Record<string, string>
  setValue: (name: string, value: string) => void
}

function ParamGroup({ label, params, values, setValue }: ParamGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-2">
        {params.map((param) => (
          <div key={param.name}>
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs text-gray-300 font-mono">{param.name}</code>
              <span className="text-xs text-gray-600">{param.type}</span>
              {param.required && (
                <span className="text-xs text-red-400 font-medium">required</span>
              )}
            </div>
            <input
              type="text"
              placeholder={param.example ?? param.description}
              value={values[param.name] ?? ''}
              onChange={(e) => setValue(param.name, e.target.value)}
              className="w-full bg-surface-3 border border-border rounded px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-mono"
            />
            <p className="text-xs text-gray-600 mt-1">{param.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
