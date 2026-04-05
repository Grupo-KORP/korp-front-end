import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EntityForm } from '../components/crud/EntityForm'
import { PedidoForm } from '../components/crud/PedidoForm'
import { StatusBanner } from '../components/crud/StatusBanner'
import { useCrudEntity } from '../hooks/useCrudEntity'
import { clienteService } from '../services/clienteService'
import { distribuidorService } from '../services/distribuidorService'
import { produtoService } from '../services/produtoService'

export function EntityFormPage() {
  const navigate = useNavigate()
  const { entityKey, id } = useParams()
  const { entity, service } = useCrudEntity(entityKey)

  const isEditMode = useMemo(() => Boolean(id), [id])
  const canUseForm = useMemo(() => {
    if (!entity) {
      return false
    }

    if (isEditMode) {
      return entity.allowEdit !== false
    }

    return entity.allowCreate !== false
  }, [entity, isEditMode])

  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [fieldOptions, setFieldOptions] = useState({})

  useEffect(() => {
    if (!entity || !service || !isEditMode || !canUseForm) {
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
  }, [canUseForm, entity, id, isEditMode, service])

  useEffect(() => {
    if (!entity || !canUseForm) {
      setFieldOptions({})
      return
    }

    if (entityKey === 'contatos') {
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
      return
    }

    if (entityKey === 'pedidos') {
      async function loadPedidoOptions() {
        try {
          const [clientes, distribuidores, produtos] = await Promise.all([
            clienteService.list(),
            distribuidorService.list(),
            produtoService.list(),
          ])

          setFieldOptions({
            fkCliente: clientes.map((item) => ({
              value: item.idCliente,
              label: item.nomeFantasia || item.razaoSocial || `Cliente #${item.idCliente}`,
            })),
            fkDistribuidor: distribuidores.map((item) => ({
              value: item.idDistribuidor,
              label:
                item.nomeFantasia ||
                item.razaoSocial ||
                `Distribuidor #${item.idDistribuidor}`,
            })),
            frete: [
              { value: 'true', label: 'Sim' },
              { value: 'false', label: 'Nao' },
            ],
            statusPedido: [
              { value: 'Em Andamento', label: 'Em Andamento' },
              { value: 'Faturado', label: 'Faturado' },
              { value: 'Concluído', label: 'Concluído' },
              { value: 'Cancelado', label: 'Cancelado' },
            ],
            fkProduto: produtos.map((item) => ({
              value: item.idProduto,
              label: item.nome || `Produto #${item.idProduto}`,
            })),
          })
        } catch (error) {
          setStatus({ type: 'error', message: error.message })
        }
      }

      loadPedidoOptions()
      return
    }

    setFieldOptions({})
  }, [canUseForm, entity, entityKey])

  async function handleSubmit(payload) {
    if (!entity || !service || !canUseForm) {
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

  if (!canUseForm) {
    return (
      <section className="page-panel">
        <header className="page-header split">
          <div>
            <h2>{entity.label}</h2>
            <p>Essa entidade nao possui operacao de formulario para esta rota.</p>
          </div>
          <Link className="btn btn-light" to={entity.routeBase}>
            Voltar
          </Link>
        </header>
        <StatusBanner
          message="A API nao disponibiliza criacao/edicao para esta entidade."
          type="error"
        />
      </section>
    )
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
      ) : entityKey === 'pedidos' ? (
        <PedidoForm
          fieldOptions={fieldOptions}
          initialData={initialData}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
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
