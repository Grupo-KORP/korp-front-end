import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EntityForm } from '../components/crud/EntityForm'
import { StatusBanner } from '../components/crud/StatusBanner'
import { useCrudEntity } from '../hooks/useCrudEntity'
import { clienteService } from '../services/clienteService'
import { distribuidorService } from '../services/distribuidorService'

export function EntityFormPage() {
  const navigate = useNavigate()
  const { entityKey, id } = useParams()
  const { entity, service } = useCrudEntity(entityKey)

  const isEditMode = useMemo(() => Boolean(id), [id])

  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [fieldOptions, setFieldOptions] = useState({})

  useEffect(() => {
    if (!entity || !service || !isEditMode) {
      return
    }

    async function loadById() {
      try {
        setIsLoading(true)
        const data = await service.getById(id)
        setInitialData(data)
      } catch (error) {
        setStatus({ type: 'error', message: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadById()
  }, [entity, id, isEditMode, service])

  useEffect(() => {
    if (entityKey !== 'contatos') {
      setFieldOptions({})
      return
    }

    async function loadContactOptions() {
      try {
        const [clientes, distribuidores] = await Promise.all([
          clienteService.list(),
          distribuidorService.list(),
        ])

        setFieldOptions({
          idCliente: clientes.map((item) => ({
            value: item.idCliente,
            label: item.nomeFantasia || item.razaoSocial || `Cliente #${item.idCliente}`,
          })),
          idDistribuidor: distribuidores.map((item) => ({
            value: item.idDistribuidor,
            label:
              item.nomeFantasia ||
              item.razaoSocial ||
              `Distribuidor #${item.idDistribuidor}`,
          })),
        })
      } catch (error) {
        setStatus({ type: 'error', message: error.message })
      }
    }

    loadContactOptions()
  }, [entityKey])

  async function handleSubmit(payload) {
    if (!entity || !service) {
      return
    }

    try {
      setIsSubmitting(true)
      if (isEditMode) {
        await service.update(id, payload)
      } else {
        await service.create(payload)
      }

      navigate(entity.routeBase)
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!entity) {
    return <StatusBanner type="error" message="Entidade nao mapeada." />
  }

  return (
    <section className="page-panel">
      <header className="page-header split">
        <div>
          <h2>{isEditMode ? `Editar ${entity.singularLabel}` : `Novo ${entity.singularLabel}`}</h2>
          <p>Preencha os campos para salvar no backend Spring Boot.</p>
        </div>
        <Link className="btn btn-light" to={entity.routeBase}>
          Voltar
        </Link>
      </header>

      <StatusBanner message={status.message} type={status.type} />

      {isLoading ? (
        <p className="info-text">Carregando registro...</p>
      ) : (
        <EntityForm
          entity={entity}
          fieldOptions={fieldOptions}
          initialData={initialData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
