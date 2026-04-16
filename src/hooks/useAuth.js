import { useState } from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/api'

/**
 * Hook de autenticação.
 * Encapsula a lógica de login/logout e mantém o estado do usuário.
 *
 * Uso:
 *   const { usuario, loading, error, entrar, sair } = useAuth()
 */
export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState(null)

  async function entrar(credentials) {
    setLoading(true)
    setError(null)
    try {
      const data = await apiLogin(credentials)
      setUsuario(data.usuario)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function sair() {
    await apiLogout()
    setUsuario(null)
  }

  return { usuario, loading, error, entrar, sair }
}
