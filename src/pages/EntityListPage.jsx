import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EntityTable } from '../components/crud/EntityTable'
import { StatusBanner } from '../components/crud/StatusBanner'
import { useCrudEntity } from '../hooks/useCrudEntity'
import { clienteService } from '../services/clienteService'
import { distribuidorService } from '../services/distribuidorService'

function getValueByPath(source, path) {
  if (!source || !path) {
    return undefined
  }

  return path.split('.').reduce((acc, key) => acc?.[key], source)
}

export function EntityListPage() {
  const { entityKey } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { entity, service } = useCrudEntity(entityKey)
  const idPedidoParam = searchParams.get('idPedido') || ''

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [lookup, setLookup] = useState({ clientes: {}, distribuidores: {} })
  const [pedidoFilter, setPedidoFilter] = useState(idPedidoParam)

  useEffect(() => {
    setPedidoFilter(idPedidoParam)
  }, [idPedidoParam])

  useEffect(() => {
    if (!entity || !service) {
      setStatus({ type: 'error', message: 'Entidade nao mapeada.' })
      setIsLoading(false)
      return
    }

    async function load() {
      try {
        setIsLoading(true)

        if (entityKey === 'itens-pedido') {
          if (!idPedidoParam) {
            setRows([])
            setStatus({ type: '', message: '' })
            return
          }

          const data = await service.list({ idPedido: idPedidoParam })
          setRows(Array.isArray(data) ? data : [])
          setStatus({ type: '', message: '' })
          return
        }

        const requests = [service.list()]
        if (entityKey === 'contatos') {
          requests.push(clienteService.list(), distribuidorService.list())
        }

        const [data, clientes = [], distribuidores = []] = await Promise.all(requests)
        setRows(Array.isArray(data) ? data : [])

        if (entityKey === 'contatos') {
          setLookup({
            clientes: clientes.reduce((acc, item) => {
              acc[item.idCliente] = item.nomeFantasia || item.razaoSocial || `Cliente #${item.idCliente}`
              return acc
            }, {}),
            distribuidores: distribuidores.reduce((acc, item) => {
              acc[item.idDistribuidor] =
                item.nomeFantasia || item.razaoSocial || `Distribuidor #${item.idDistribuidor}`
              return acc
            }, {}),
          })
        }
      } catch (error) {
        setRows([])
        setStatus({ type: 'error', message: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [entity, entityKey, idPedidoParam, service])

  function renderCell(field, row) {
    if (entityKey === 'contatos') {
      if (field.name === 'idCliente') {
        const idCliente = row.idCliente
        return idCliente ? lookup.clientes[idCliente] || `Cliente #${idCliente}` : '-'
      }

      if (field.name === 'idDistribuidor') {
        const idDistribuidor = row.idDistribuidor
        return idDistribuidor
          ? lookup.distribuidores[idDistribuidor] || `Distribuidor #${idDistribuidor}`
          : '-'
      }
    }

    if (entityKey === 'pedidos' && field.name === 'itens') {
      return Array.isArray(row.itens) ? `${row.itens.length} item(ns)` : '0 item(ns)'
    }

    const value = getValueByPath(row, field.name)
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Nao'
    }

    if (Array.isArray(value)) {
      return `${value.length} item(ns)`
    }

    if (typeof value === 'object') {
      return value?.nome || value?.id || '-'
    }

    return String(value)
  }

  function handleItemPedidoFilterSubmit(event) {
    event.preventDefault()

    if (!pedidoFilter) {
      setSearchParams({})
      return
    }

    setSearchParams({ idPedido: pedidoFilter })
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm('Deseja realmente excluir este registro?')
    if (!confirmDelete) {
      return
    }

    try {
      await service.remove(id)
      setRows((prevRows) => prevRows.filter((item) => item[entity.idField] !== id))
      setStatus({ type: 'success', message: 'Registro removido com sucesso.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    }
  }

  if (!entity) {
    return <StatusBanner type="error" message="Entidade nao mapeada." />
  }

  return (
    <section className="page-panel">
      <header className="page-header split">
        <div>
          <h2>{entity.label}</h2>
          <p>Gerencie os registros de {entity.singularLabel.toLowerCase()}.</p>
        </div>
        {entity.allowCreate !== false && (
          <Link className="btn btn-primary" to={`${entity.routeBase}/new`}>
            Novo {entity.singularLabel}
          </Link>
        )}
      </header>

      {entityKey === 'itens-pedido' && (
        <form className="inline-filter" onSubmit={handleItemPedidoFilterSubmit}>
          <label className="field compact" htmlFor="pedido-filter">
            <span>ID do Pedido</span>
            <input
              id="pedido-filter"
              min="1"
              onChange={(event) => setPedidoFilter(event.target.value)}
              type="number"
              value={pedidoFilter}
            />
          </label>
          <button className="btn btn-light" type="submit">
            Buscar Itens
          </button>
        </form>
      )}

      {entityKey === 'itens-pedido' && !idPedidoParam && (
        <p className="info-text">Informe o ID do pedido para listar os itens.</p>
      )}

      <StatusBanner message={status.message} type={status.type} />
      <EntityTable
        entity={entity}
        isLoading={isLoading}
        onDelete={handleDelete}
        renderCell={renderCell}
        rows={rows}
      />
    </section>
  )
}
