import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      error?.response?.data?.mensagem ||
      error?.message ||
      'Erro inesperado ao comunicar com a API.'

    return Promise.reject(new Error(message))
  },
)
