import { createContext, useContext, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession, saveAuthSession } from '../auth/authStorage'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = window.atob(base64 + padding)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function extractUserIdFromToken(token) {
  const payload = parseJwtPayload(token)
  const rawId = payload?.id ?? payload?.idUsuario
  const parsedId = Number(rawId)
  return Number.isFinite(parsedId) ? parsedId : null
}

function normalizeSessionFromLogin(response, fallbackEmail) {
  const usuarioResponseDTO = response?.usuarioResponseDTO

  return {
    token: response?.token || '',
    tipo: response?.tipo || 'Bearer',
    nome: usuarioResponseDTO?.nome || response?.nome || '',
    email: usuarioResponseDTO?.email || response?.email || fallbackEmail || '',
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAuthSession())

  const user = useMemo(() => {
    if (!session) {
      return null
    }

    return {
      ...session,
      idUsuario: extractUserIdFromToken(session?.token),
    }
  }, [session])

  async function login(credentials) {
    const response = await authService.login(credentials)
    const nextSession = normalizeSessionFromLogin(response, credentials?.email)

    saveAuthSession(nextSession)
    setSession(nextSession)

    return nextSession
  }

  async function register(payload) {
    return authService.register(payload)
  }

  function logout() {
    clearAuthSession()
    setSession(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
