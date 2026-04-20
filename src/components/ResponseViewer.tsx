import { ApiResponse } from '../types'

function statusColor(status: number): string {
  if (status === 0) return 'text-red-400'
  if (status < 300) return 'text-green-400'
  if (status < 400) return 'text-yellow-400'
  return 'text-red-400'
}

function colorizeJson(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-blue-300">${match}</span>`
        }
        return `<span class="text-green-300">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span class="text-amber-300">${match}</span>`
      if (/null/.test(match)) return `<span class="text-gray-500">${match}</span>`
      return `<span class="text-violet-300">${match}</span>`
    },
  )
}

interface Props {
  response: ApiResponse
}

export function ResponseViewer({ response }: Props) {
  const isError = response.status === 0 || response.status >= 400

  let formattedBody = ''
  if (response.error) {
    formattedBody = response.error
  } else if (typeof response.data === 'string') {
    formattedBody = response.data
  } else {
    try {
      formattedBody = JSON.stringify(response.data, null, 2)
    } catch {
      formattedBody = String(response.data)
    }
  }

  const colorized = response.error || typeof response.data === 'string'
    ? formattedBody
    : colorizeJson(formattedBody)

  return (
    <div className="mt-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className={`font-mono font-bold text-sm ${statusColor(response.status)}`}>
            {response.status || 'ERR'} {response.statusText}
          </span>
          {isError && (
            <span className="text-xs text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded">
              Error
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 font-mono">{response.duration}ms</span>
      </div>
      <div className="bg-[#0a0a0a] p-4 overflow-x-auto max-h-96">
        <pre
          className="text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: colorized }}
        />
      </div>
    </div>
  )
}
