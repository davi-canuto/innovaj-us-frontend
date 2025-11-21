'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email,
          password,
        }
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login falhou' }))
      return { error: error.error || 'Email ou senha inválidos' }
    }

    const result = await response.json()
    const token = result.record?.token || result.token
    const userData = result.record || result.user || result

    if (!token) {
      return { error: 'Token não recebido' }
    }

    // Salva o token em um cookie HTTP-only
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    // Salva os dados do usuário em um cookie separado
    if (userData) {
      const userInfo = {
        name: userData.name,
        email: userData.email,
        id: userData.id,
      }
      cookieStore.set('user_data', JSON.stringify(userInfo), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Erro ao fazer login. Tente novamente.' }
  }
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const cpf = formData.get('cpf') as string
  const password = formData.get('password') as string
  const password_confirmation = formData.get('password_confirmation') as string

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          name,
          email,
          cpf,
          password,
          password_confirmation,
        }
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar conta' }))
      return { error: error.message || 'Erro ao criar conta' }
    }

    const result = await response.json()
    const token = result.record?.token || result.token

    if (token) {
      // Salva o token em um cookie HTTP-only
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      })

      // Salva os dados do usuário
      const userData = result.record || result.user || result
      if (userData) {
        const userInfo = {
          name: userData.name,
          email: userData.email,
          id: userData.id,
        }
        cookieStore.set('user_data', JSON.stringify(userInfo), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 horas
          path: '/',
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('user_data')
  redirect('/login')
}

export async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value
}

export async function getUserData() {
  const cookieStore = await cookies()
  const userDataCookie = cookieStore.get('user_data')?.value
  if (!userDataCookie) return null

  try {
    return JSON.parse(userDataCookie)
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  const token = await getToken()
  return !!token
}
