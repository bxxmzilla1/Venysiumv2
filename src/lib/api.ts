import { ApiEndpoint, ApiResponse } from '../types'

const BASE_URL = 'https://api.entergram.com'

interface CallApiOptions {
  endpoint: ApiEndpoint
  formValues: Record<string, string>
  apiKey: string
}

export async function callApi({ endpoint, formValues, apiKey }: CallApiOptions): Promise<ApiResponse> {
  const pathParams: Record<string, string> = {}
  const queryParams: Record<string, string> = {}
  const bodyParams: Record<string, unknown> = {}

  for (const param of endpoint.params) {
    const raw = formValues[param.name]
    if (!raw && raw !== '0') continue

    if (param.in === 'path') {
      pathParams[param.name] = raw
    } else if (param.in === 'query') {
      queryParams[param.name] = raw
    } else if (param.in === 'body') {
      if (param.type === 'integer') {
        bodyParams[param.name] = parseInt(raw, 10)
      } else if (param.type === 'boolean') {
        bodyParams[param.name] = raw === 'true'
      } else if (param.type === 'array') {
        bodyParams[param.name] = raw.split(',').map((s) => s.trim()).filter(Boolean)
      } else {
        try {
          bodyParams[param.name] = JSON.parse(raw)
        } catch {
          bodyParams[param.name] = raw
        }
      }
    }
  }

  let url = endpoint.path
  for (const [key, value] of Object.entries(pathParams)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value))
  }

  const qs = new URLSearchParams(queryParams).toString()
  const fullUrl = `${BASE_URL}${url}${qs ? `?${qs}` : ''}`

  const headers: Record<string, string> = { 'X-API-Key': apiKey }
  let body: string | undefined

  const hasBody = endpoint.method !== 'GET' && endpoint.method !== 'DELETE'
  if (hasBody && Object.keys(bodyParams).length > 0) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(bodyParams)
  }

  const start = performance.now()

  try {
    const res = await fetch(fullUrl, { method: endpoint.method, headers, body })
    const duration = Math.round(performance.now() - start)

    let data: unknown
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    return { status: res.status, statusText: res.statusText, data, duration }
  } catch (err) {
    const duration = Math.round(performance.now() - start)
    const message = err instanceof Error ? err.message : 'Unknown network error'
    return {
      status: 0,
      statusText: 'Network Error',
      data: null,
      duration,
      error: `${message}. This may be a CORS issue — the Entergram API must allow requests from this origin.`,
    }
  }
}
