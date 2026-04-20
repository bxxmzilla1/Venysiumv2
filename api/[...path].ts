export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-API-Key',
  'Access-Control-Max-Age': '86400',
}

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const { pathname, search } = new URL(req.url)
  const apiPath = pathname.replace(/^\/api/, '')
  const target = `https://api.entergram.com${apiPath}${search}`

  // Forward only the headers Entergram needs
  const fwd = new Headers()
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) fwd.set('X-API-Key', apiKey)
  const ct = req.headers.get('content-type')
  if (ct) fwd.set('Content-Type', ct)

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: fwd,
      // body may be null for DELETE — that's fine, fetch ignores null
      body: hasBody ? req.body : null,
      // Required for streaming request bodies in the Edge runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(hasBody ? ({ duplex: 'half' } as any) : {}),
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ detail: 'Proxy error', error: String(err) }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const resHeaders: Record<string, string> = { ...CORS }
  const resCt = upstream.headers.get('content-type')
  if (resCt) resHeaders['Content-Type'] = resCt

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  })
}
