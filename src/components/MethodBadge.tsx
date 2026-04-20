import { HttpMethod } from '../types'

const styles: Record<HttpMethod, string> = {
  GET: 'bg-green-500/15 text-green-400 border border-green-500/30',
  POST: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  PUT: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  PATCH: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  DELETE: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide ${styles[method]}`}>
      {method}
    </span>
  )
}
