/**
 * services/api.js
 */

import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('korp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: trata erros HTTP de forma centralizada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || `Erro HTTP ${status}`

    const err = new Error(message)
    err.status = status 
    throw err
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, senha }) {
  const { data } = await api.post('/auth/login', { email, senha })
  // data = { token, nome, email }
  localStorage.setItem('korp_token', data.token)
  return { usuario: { nome: data.nome, email: data.email } }
}

export async function logout() {
  localStorage.removeItem('korp_token')
}

// ─── Colaboradores ───────────────────────────────────────────────────────────

export async function cadastrarColaborador(dados) {
  const payload = {
    idUsuario: "",
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone.replace(/\D/g, ''), // envia só números
    senha: "12345678",   // mockado
    role: 1,             // mockado
    percentualComissao: 6.00,
  }

  const { data } = await api.post('/usuario', payload)
  return data
}

export async function listarColaboradores() {
  await new Promise(r => setTimeout(r, 500))
  return []
}