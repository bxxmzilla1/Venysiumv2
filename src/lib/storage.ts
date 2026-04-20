const API_KEY = 'venysium:apiKey'

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY) ?? ''
}

export function setStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(API_KEY, key)
  } else {
    localStorage.removeItem(API_KEY)
  }
}
