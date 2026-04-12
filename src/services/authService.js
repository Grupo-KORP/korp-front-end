import { api } from './api'

export const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  async register(payload) {
    const response = await api.post('/usuario', payload)
    return response.data
  },
}
