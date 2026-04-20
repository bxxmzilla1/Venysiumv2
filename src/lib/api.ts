import { Account, Chat, Contact, MeData, Message, Workspace } from '../types/api'

// In production (Vercel) this is proxied by api/[...path].ts (Edge Function).
// In development Vite proxies /api → https://api.entergram.com via vite.config.ts.
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

async function request<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'X-API-Key': apiKey }
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
  getMe: (key: string) =>
    request<{ data: MeData }>('/v1/me', key).then((r) => r.data),

  getWorkspace: (key: string) =>
    request<{ data: Workspace }>('/v1/workspace', key).then((r) => r.data),

  getAccounts: (key: string) =>
    request<ListResp<Account>>('/v1/accounts', key).then((r) => r.data.items ?? []),

  listChats: (key: string, params?: { limit?: number; offset?: number }) =>
    request<ListResp<Chat>>('/v1/chats' + qs(params), key).then((r) => r.data.items ?? []),

  getChat: (key: string, chatId: string) =>
    request<{ data: Chat }>(`/v1/chats/${encodeURIComponent(chatId)}`, key).then((r) => r.data),

  listMessages: (
    key: string,
    chatId: string,
    params?: { account_id?: string; limit?: number; before_message_id?: number },
  ) =>
    request<{ data: { items?: Message[]; hasMore?: boolean; accountId?: string; chatId?: string } }>(
      `/v1/chats/${encodeURIComponent(chatId)}/messages` + qs(params),
      key,
    ).then((r) => r.data.items ?? []),

  sendMessage: (
    key: string,
    chatId: string,
    body: {
      accountId: string
      idempotencyKey: string
      text: string
      parseMode?: string
      replyToMessageId?: number
    },
  ) =>
    request<{ data: unknown }>(`/v1/chats/${encodeURIComponent(chatId)}/messages`, key, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  editMessage: (
    key: string,
    chatId: string,
    messageId: number,
    body: { accountId: string; text: string; parseMode?: string },
  ) =>
    request<void>(`/v1/chats/${encodeURIComponent(chatId)}/messages/${messageId}`, key, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteMessage: (
    key: string,
    chatId: string,
    messageId: number,
    params?: { account_id?: string; revoke?: boolean },
  ) =>
    request<void>(
      `/v1/chats/${encodeURIComponent(chatId)}/messages/${messageId}` + qs(params),
      key,
      { method: 'DELETE' },
    ),

  listContacts: (key: string, params?: { limit?: number; offset?: number; search?: string }) =>
    request<ListResp<Contact>>('/v1/contacts' + qs(params), key).then((r) => r.data.items ?? []),
}
