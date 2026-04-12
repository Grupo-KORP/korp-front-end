import axios from 'axios'
import { clearAuthSession, getAuthToken } from '../auth/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (!token) {
    return config
  }

  const headers = config.headers || {}
  if (!headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  return {
    ...config,
    headers,
  }
})

function getErrorMessage(error) {
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  return (
    data?.message ||
    data?.erro ||
    data?.mensagem ||
    error?.message ||
    'Erro inesperado ao comunicar com a API.'
  )
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession()

      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        const isPublicAuthRoute = path.startsWith('/login') || path.startsWith('/cadastro')
        if (!isPublicAuthRoute) {
          window.location.href = '/login'
        }
      }
    }

    const message = getErrorMessage(error)

    return Promise.reject(new Error(message))
  },
)
