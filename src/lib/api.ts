import { Account, Chat, Contact, MeData, Message, Workspace } from '../types/api'

// In dev: Vite proxies /api/* → https://api.entergram.com/* and injects the API key.
// In prod (Vercel): the Edge Function at api/[...path].ts does the same server-side.
const BASE = '/api'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {}
  if (init?.body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  })

  if (res.status === 204) return undefined as T

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = { detail: res.statusText }
  }

  if (!res.ok) {
    const msg = (body as { detail?: string })?.detail ?? res.statusText
    throw new ApiError(msg, res.status, body)
  }

  return body as T
}

function qs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  }
  const s = p.toString()
  return s ? '?' + s : ''
}

type ListResp<T> = { data: { items?: T[]; hasMore?: boolean } }

export const api = {
  getMe: () =>
    request<{ data: MeData }>('/v1/me').then((r) => r.data),

  getWorkspace: () =>
    request<{ data: Workspace }>('/v1/workspace').then((r) => r.data),

  getAccounts: () =>
    request<ListResp<Account>>('/v1/accounts')
      .then((r) => r.data.items ?? [])
      .catch((e) => {
        // 404 means no accounts connected yet — treat as empty list
        if (e instanceof ApiError && e.status === 404) return [] as Account[]
        throw e
      }),

  listChats: (params?: { limit?: number; offset?: number }) =>
    request<ListResp<Chat>>('/v1/chats' + qs(params)).then((r) => r.data.items ?? []),

  listMessages: (
    chatId: string,
    params?: { account_id?: string; limit?: number; before_message_id?: number },
  ) =>
    request<{ data: { items?: Message[]; hasMore?: boolean } }>(
      `/v1/chats/${encodeURIComponent(chatId)}/messages` + qs(params),
    ).then((r) => r.data.items ?? []),

  sendMessage: (
    chatId: string,
    body: {
      accountId: string
      idempotencyKey: string
      text: string
      parseMode?: string
      replyToMessageId?: number
    },
  ) =>
    request<{ data: unknown }>(`/v1/chats/${encodeURIComponent(chatId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  editMessage: (
    chatId: string,
    messageId: number,
    body: { accountId: string; text: string; parseMode?: string },
  ) =>
    request<void>(`/v1/chats/${encodeURIComponent(chatId)}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteMessage: (
    chatId: string,
    messageId: number,
    params?: { account_id?: string; revoke?: boolean },
  ) =>
    request<void>(
      `/v1/chats/${encodeURIComponent(chatId)}/messages/${messageId}` + qs(params),
      { method: 'DELETE' },
    ),

  listContacts: (params?: { limit?: number; offset?: number; search?: string }) =>
    request<ListResp<Contact>>('/v1/contacts' + qs(params)).then((r) => r.data.items ?? []),
}
