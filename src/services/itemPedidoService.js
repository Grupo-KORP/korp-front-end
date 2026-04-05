import { api } from './api'

export const itemPedidoService = {
  async list(options = {}) {
    const idPedido = Number(options?.idPedido)

    if (!Number.isFinite(idPedido) || idPedido <= 0) {
      throw new Error('Informe um idPedido valido para listar os itens.')
    }

    const response = await api.get('/item_pedido/buscar', {
      params: { idPedido },
    })

    return response.data
  },

  async getById(id) {
    const response = await api.get(`/item_pedido/buscar/${id}`)
    return response.data
  },

  async create() {
    throw new Error('Item de pedido eh criado pelo endpoint de pedidos.')
  },

  async update() {
    throw new Error('Atualizacao de item de pedido nao esta disponivel na API.')
  },

  async remove(id) {
    await api.delete(`/item_pedido/deletar/${id}`)
  },
}
