import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Debug: verificar todos os cookies
  console.log('🍪 All Cookies:', typeof window !== 'undefined' ? document.cookie : 'Server-side (no cookies)')

  const token = typeof window !== 'undefined'
    ? document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
    : null;

  console.log('🔑 Token extracted:', token || 'NO TOKEN FOUND!')

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  }

  // Debug logs
  console.log('🔍 API Request Debug:')
  console.log('  URL:', url)
  console.log('  Method:', options.method || 'GET')
  console.log('  Authorization header:', token ? `Bearer ${token.substring(0, 20)}...` : 'NOT SET!')
  console.log('  All Headers:', config.headers)
  console.log('  Credentials:', config.credentials)
  if (options.method === 'POST' || options.method === 'PUT') {
    console.log('  Body:', options.body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }))
    const errorMessage = error.message || error.error || `Erro ${response.status}`

    console.log('❌ API Error:', response.status, errorMessage)

    if (typeof window !== 'undefined') {
      toast.error(errorMessage)
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: "GET" }),

  post: (endpoint: string, data: any) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  put: (endpoint: string, data: any) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
}
