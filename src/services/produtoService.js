import { api } from './api'

export const produtoService = {
  async list() {
    const response = await api.get('/produto')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/produto/buscar/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await api.post('/produto/cadastrar', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await api.patch(`/produto/atualizar/${id}`, payload)
    return response.data
  },

  async remove(id) {
    await api.delete(`/produto/${id}`)
  },
}
