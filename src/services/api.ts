const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Pega o token do localStorage se existir
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unkown error" }))
    throw new Error(error.message || `Error ${response.status}`)
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
