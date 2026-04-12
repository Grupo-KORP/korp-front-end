import { createContext, useContext, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession, saveAuthSession } from '../auth/authStorage'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

function normalizeSessionFromLogin(response, fallbackEmail) {
  return {
    token: response?.token || '',
    tipo: response?.tipo || 'Bearer',
    nome: response?.nome || '',
    email: response?.email || fallbackEmail || '',
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAuthSession())

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
      user: session,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
    }),
    [session],
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
