/**
 * services/api.js
 *
 * Camada de serviços da aplicação KORP.
 * Todas as chamadas ao backend passam por aqui.
 *
 * ─────────────────────────────────────────────
 * Para integração real, substitua BASE_URL pelo
 * endereço do seu backend e remova os mocks.
 * ─────────────────────────────────────────────
 */

// TODO: mover para variável de ambiente (.env)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tnd.com.br/v1'

// ─── Utilitário de requisição ───────────────────────────────────────────────

/**
 * Wrapper genérico sobre fetch com tratamento de erros centralizado.
 * @param {string} endpoint  - Caminho relativo, ex: '/auth/login'
 * @param {object} options   - Opções do fetch (method, body, headers…)
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('korp_token')

  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Adiciona Bearer token se existir
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  // TODO: integração real — descomentar e remover mock abaixo
  // const response = await fetch(`${BASE_URL}${endpoint}`, {
  //   ...options,
  //   headers: { ...defaultHeaders, ...options.headers },
  // })
  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({}))
  //   throw new Error(error.message || `Erro HTTP ${response.status}`)
  // }
  // return response.json()

  // ─── MOCK: simula latência de rede ───
  await new Promise(r => setTimeout(r, 800))
}

// ─── Auth ───────────────────────────────────────────────────────────────────

/**
 * Realiza login do vendedor.
 * @param {{ email: string, senha: string }} credentials
 * @returns {{ token: string, usuario: object }}
 */
export async function login({ email, senha }) {
  // TODO: substituir pelo request() real
  // return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) })

  await new Promise(r => setTimeout(r, 800))

  // Mock de validação
  if (email.endsWith('@tnd.com.br') && senha.length >= 6) {
    const token = 'mock_token_' + Math.random().toString(36).slice(2)
    localStorage.setItem('korp_token', token)
    return {
      token,
      usuario: { id: 1, nome: 'Vendedor Demo', email, perfil: 'vendedor' },
    }
  }

  throw new Error('E-mail ou senha inválidos.')
}

/**
 * Realiza logout, removendo o token local.
 */
export async function logout() {
  // TODO: chamar endpoint de invalidação de sessão no backend
  // await request('/auth/logout', { method: 'POST' })
  localStorage.removeItem('korp_token')
}

// ─── Colaboradores ──────────────────────────────────────────────────────────

/**
 * Cadastra um novo colaborador.
 * @param {{ nome: string, email: string, telefone: string, senhaInicial: string }} dados
 */
export async function cadastrarColaborador(dados) {
  // TODO: substituir pelo request() real
  // return request('/colaboradores', { method: 'POST', body: JSON.stringify(dados) })

  await new Promise(r => setTimeout(r, 800))

  // Mock: valida apenas que os campos não estão vazios
  const camposVazios = Object.entries(dados).filter(([, v]) => !v)
  if (camposVazios.length > 0) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  return { id: Math.floor(Math.random() * 1000), ...dados }
}

/**
 * Lista todos os colaboradores.
 * @returns {Array<object>}
 */
export async function listarColaboradores() {
  // TODO: return request('/colaboradores')
  await new Promise(r => setTimeout(r, 500))
  return []
}
