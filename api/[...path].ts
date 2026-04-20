export const config = { runtime: 'edge' }

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  // ── API key from Vercel environment variable — never exposed to the browser ──
  const apiKey = process.env.ENTERGRAM_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        detail:
          'ENTERGRAM_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables.',
      }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const { pathname, search } = new URL(req.url)
  const apiPath = pathname.replace(/^\/api/, '')
  const target = `https://api.entergram.com${apiPath}${search}`

  const fwd = new Headers()
  fwd.set('X-API-Key', apiKey)
  const ct = req.headers.get('content-type')
  if (ct) fwd.set('Content-Type', ct)

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: fwd,
      body: hasBody ? req.body : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(hasBody ? ({ duplex: 'half' } as any) : {}),
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ detail: 'Upstream fetch failed', error: String(err) }),
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
