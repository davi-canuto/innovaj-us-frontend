import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1] ?? null
}

function saveTokenToCookie(token: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax${isProduction ? '; secure' : ''}`
}

// Promise compartilhada para evitar múltiplas chamadas de refresh simultâneas
let refreshPromise: Promise<string | null> | null = null

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const token = getTokenFromCookie()
      if (!token) return null

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) return null

      const result = await response.json()
      const newToken = result.record?.token ?? result.token ?? null
      if (newToken) saveTokenToCookie(newToken)
      return newToken
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getTokenFromCookie()
  const isFormData = options.body instanceof FormData

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  // Token expirado — tenta refresh uma vez
  if (response.status === 401 && !isRetry) {
    const newToken = await attemptRefresh()
    if (newToken) {
      return request(endpoint, options, true)
    }
    // Refresh falhou — redireciona para login
    if (typeof window !== 'undefined') {
      toast.error("Sessão expirada. Faça login novamente.")
      window.location.href = '/login'
    }
    throw new Error("Sessão expirada")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }))

    let errorMessage = error.message || error.error || `Erro ${response.status}`

    if (error.errors && typeof error.errors === 'object') {
      errorMessage = Object.entries(error.errors)
        .flatMap(([field, msgs]) => (msgs as string[]).map((m) => `${field}: ${m}`))
        .join(', ') || errorMessage
    }

    const isGetRequest = !options.method || options.method === 'GET'
    const shouldSuppressToast = isGetRequest && response.status === 404

    if (!shouldSuppressToast && typeof window !== 'undefined') {
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
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data: any) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),

  postFormData: (endpoint: string, formData: FormData) =>
    request(endpoint, {
      method: "POST",
      body: formData,
    }),
}
