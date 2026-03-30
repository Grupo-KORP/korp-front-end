import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EntityTable } from '../components/crud/EntityTable'
import { StatusBanner } from '../components/crud/StatusBanner'
import { useCrudEntity } from '../hooks/useCrudEntity'
import { clienteService } from '../services/clienteService'
import { distribuidorService } from '../services/distribuidorService'

export function EntityListPage() {
  const { entityKey } = useParams()
  const { entity, service } = useCrudEntity(entityKey)
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [lookup, setLookup] = useState({ clientes: {}, distribuidores: {} })

  useEffect(() => {
    if (!entity || !service) {
      setStatus({ type: 'error', message: 'Entidade nao mapeada.' })
      setIsLoading(false)
      return
    }

    async function load() {
      try {
        setIsLoading(true)
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
        setStatus({ type: 'error', message: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [entity, entityKey, service])

  function renderCell(field, row) {
    if (entityKey !== 'contatos') {
      return String(row[field.name] ?? '-')
    }

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

    return String(row[field.name] ?? '-')
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
        <Link className="btn btn-primary" to={`${entity.routeBase}/new`}>
          Novo {entity.singularLabel}
        </Link>
      </header>

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
