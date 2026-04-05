import { api } from './api'

function normalizePedidoItems(itens) {
  if (typeof itens === 'string') {
    const trimmed = itens.trim()
    if (!trimmed) {
      throw new Error('Informe os itens do pedido em formato JSON.')
    }

    itens = JSON.parse(trimmed)
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error('Informe ao menos um item no pedido.')
  }

  return itens.map((item, index) => {
    const fkProduto = Number(item?.fkProduto)
    const quantidade = Number(item?.quantidade)
    const valorUnitario = Number(item?.valorUnitario)

    if (!Number.isFinite(fkProduto) || fkProduto <= 0) {
      throw new Error(`Item ${index + 1}: fkProduto invalido.`)
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      throw new Error(`Item ${index + 1}: quantidade invalida.`)
    }

    if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
      throw new Error(`Item ${index + 1}: valorUnitario invalido.`)
    }

    return {
      fkProduto,
      quantidade,
      valorUnitario,
    }
  })
}

function normalizePayload(payload, isEditMode = false) {
  const normalized = {
    ...payload,
    fkCliente: Number(payload?.fkCliente),
    fkDistribuidor: Number(payload?.fkDistribuidor),
  }

  const hasItens = Array.isArray(payload?.itens)
    ? payload.itens.length > 0
    : Boolean(payload?.itens)

  if (!Number.isFinite(normalized.fkCliente) || normalized.fkCliente <= 0) {
    throw new Error('Selecione um cliente valido para o pedido.')
  }

  if (!Number.isFinite(normalized.fkDistribuidor) || normalized.fkDistribuidor <= 0) {
    throw new Error('Selecione um distribuidor valido para o pedido.')
  }

  if (!isEditMode || hasItens) {
    normalized.itens = normalizePedidoItems(payload?.itens)
  } else if (isEditMode) {
    delete normalized.itens
  }

  return normalized
}

export const pedidoService = {
  async list() {
    const response = await api.get('/pedidos/listar')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/pedidos/buscar/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await api.post('/pedidos/cadastrar', normalizePayload(payload, false))
    return response.data
  },

  async update(id, payload) {
    const response = await api.put(`/pedidos/atualizar/${id}`, normalizePayload(payload, true))
    return response.data
  },

  async remove(id) {
    await api.delete(`/pedidos/deletar/${id}`)
  },
}
