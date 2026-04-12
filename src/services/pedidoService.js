import { api } from './api'
import { parseFlexibleNumber } from '../utils/numberParsers'

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
    const fkProduto = parseFlexibleNumber(item?.fkProduto)
    const quantidade = parseFlexibleNumber(item?.quantidade)
    const valorUnitario = parseFlexibleNumber(item?.valorUnitario)

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
      fkProduto: Math.trunc(fkProduto),
      quantidade: Math.trunc(quantidade),
      valorUnitario,
    }
  })
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key)
}

function normalizePayload(payload, isEditMode = false) {
  const fkCliente = parseFlexibleNumber(payload?.fkCliente)
  const fkDistribuidor = parseFlexibleNumber(payload?.fkDistribuidor)
  const valorTotalRevenda = parseFlexibleNumber(payload?.valorTotalRevenda)
  const valorTotalFaturamento = parseFlexibleNumber(payload?.valorTotalFaturamento)
  const numeroNotaDistribuidorRaw = payload?.numeroNotaDistribuidor

  const numeroNotaDistribuidor =
    numeroNotaDistribuidorRaw === '' ||
    numeroNotaDistribuidorRaw === null ||
    numeroNotaDistribuidorRaw === undefined
      ? null
      : Math.trunc(parseFlexibleNumber(numeroNotaDistribuidorRaw))

  const normalized = {
    ...payload,
    fkCliente: Math.trunc(fkCliente),
    fkDistribuidor: Math.trunc(fkDistribuidor),
    numeroNotaDistribuidor,
    valorTotalRevenda,
    valorTotalFaturamento,
  }

  const itensProvided = hasOwn(payload, 'itens')

  if (!Number.isFinite(normalized.fkCliente) || normalized.fkCliente <= 0) {
    throw new Error('Selecione um cliente valido para o pedido.')
  }

  if (!Number.isFinite(normalized.fkDistribuidor) || normalized.fkDistribuidor <= 0) {
    throw new Error('Selecione um distribuidor valido para o pedido.')
  }

  if (!Number.isFinite(normalized.valorTotalRevenda)) {
    throw new Error('Informe um valor de revenda valido.')
  }

  if (!Number.isFinite(normalized.valorTotalFaturamento)) {
    throw new Error('Informe um valor de faturamento valido.')
  }

  if (
    normalized.numeroNotaDistribuidor !== null &&
    !Number.isFinite(normalized.numeroNotaDistribuidor)
  ) {
    throw new Error('Informe um numero de nota distribuidor valido.')
  }

  if (!isEditMode) {
    normalized.itens = normalizePedidoItems(payload?.itens)
  } else if (itensProvided) {
    if (Array.isArray(payload?.itens) && payload.itens.length === 0) {
      normalized.itens = []
    } else {
      normalized.itens = normalizePedidoItems(payload?.itens)
    }
  } else {
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
