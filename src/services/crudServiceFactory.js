import { api } from './api'

export function createCrudService(basePath) {
  return {
    async list() {
      const response = await api.get(basePath)
      return response.data
    },

    async getById(id) {
      const response = await api.get(`${basePath}/${id}`)
      return response.data
    },

    async create(payload) {
      const response = await api.post(basePath, payload)
      return response.data
    },

    async update(id, payload) {
      const response = await api.put(`${basePath}/${id}`, payload)
      return response.data
    },

    async remove(id) {
      await api.delete(`${basePath}/${id}`)
    },
  }
}
