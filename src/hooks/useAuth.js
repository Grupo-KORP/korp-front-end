import { useState } from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/api'

export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function entrar(credentials) {
    setLoading(true)
    setError(null)
    try {
      const data = await apiLogin(credentials)
      setUsuario(data.usuario)
      return data
    } catch (err) {
      const mensagem =
        err.status === 401
        ? 'Usuário ou senha incorretos.'
        : err.status === 403
        ? err.message || 'Acesso negado.'
        : 'Erro inesperado. Tente novamente.'

      setError(mensagem)
      throw new Error(mensagem) // relança para o componente tratar se quiser
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