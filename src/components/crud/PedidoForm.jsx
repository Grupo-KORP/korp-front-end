import { useEffect, useMemo, useState } from 'react'

function mapInitialItems(initialItems) {
  if (!Array.isArray(initialItems)) {
    return []
  }

  return initialItems
    .map((item) => {
      const fkProduto = Number(item?.fkProduto ?? item?.produto?.idProduto)
      const quantidade = Number(item?.quantidade)
      const valorUnitario = Number(item?.valorUnitario)

      if (!Number.isFinite(fkProduto) || fkProduto <= 0) {
        return null
      }

      return {
        fkProduto,
        quantidade: Number.isFinite(quantidade) ? quantidade : 1,
        valorUnitario: Number.isFinite(valorUnitario) ? valorUnitario : 0,
      }
    })
    .filter(Boolean)
}

function normalizeInitialData(initialData) {
  const normalizedStatusMap = {
    PENDENTE: 'Em Andamento',
    APROVADO: 'Em Andamento',
    FATURADO: 'Faturado',
    ENVIADO: 'Em Andamento',
    ENTREGUE: 'Concluído',
    CANCELADO: 'Cancelado',
  }

  const originalStatus = initialData?.statusPedido || ''

  return {
    dataPedido: initialData?.dataPedido || '',
    numeroNotaDistribuidor: initialData?.numeroNotaDistribuidor ?? '',
    valorTotalRevenda: initialData?.valorTotalRevenda ?? '',
    valorTotalFaturamento: initialData?.valorTotalFaturamento ?? '',
    statusPedido: normalizedStatusMap[originalStatus] || originalStatus,
    frete:
      typeof initialData?.frete === 'boolean'
        ? String(initialData.frete)
        : initialData?.frete || '',
    transportadora: initialData?.transportadora || '',
    observacoes: initialData?.observacoes || '',
    fkCliente: initialData?.fkCliente ?? initialData?.cliente?.idCliente ?? '',
    fkDistribuidor:
      initialData?.fkDistribuidor ?? initialData?.distribuidor?.idDistribuidor ?? '',
    itens: mapInitialItems(initialData?.itens),
  }
}

function formatMoney(value) {
  if (!Number.isFinite(value)) {
    return '0.00'
  }

  return value.toFixed(2)
}

export function PedidoForm({
  initialData,
  isSubmitting,
  isEditMode,
  isReadOnly = false,
  onSubmit,
  fieldOptions = {},
}) {
  const parsedInitial = useMemo(() => normalizeInitialData(initialData), [initialData])

  const [form, setForm] = useState(parsedInitial)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSingleItemWarningOpen, setIsSingleItemWarningOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    fkProduto: '',
    quantidade: 1,
    valorUnitario: '',
  })
  const [localError, setLocalError] = useState('')

  const valorTotalVenda = useMemo(() => {
    return form.itens.reduce((acc, item) => {
      const quantidade = Number(item?.quantidade)
      const valorUnitario = Number(item?.valorUnitario)

      if (!Number.isFinite(quantidade) || !Number.isFinite(valorUnitario)) {
        return acc
      }

      return acc + quantidade * valorUnitario
    }, 0)
  }, [form.itens])

  const produtoOptions = fieldOptions.fkProduto || []
  const statusOptions = fieldOptions.statusPedido || []
  const itemsRequired = true

  useEffect(() => {
    setForm(parsedInitial)
  }, [parsedInitial])

  function labelRequired(text, requiredInCreate = false) {
    return (
      <>
        {text}
        {requiredInCreate && <span className="required-mark"> *</span>}
      </>
    )
  }

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openModal() {
    setLocalError('')
    setNewItem({ fkProduto: '', quantidade: 1, valorUnitario: '' })
    setIsModalOpen(true)
  }

  function closeModal() {
    setLocalError('')
    setIsModalOpen(false)
  }

  function closeSingleItemWarningModal() {
    setIsSingleItemWarningOpen(false)
  }

  function handleAddItemFromWarning() {
    setIsSingleItemWarningOpen(false)
    openModal()
  }

  function handleAddItem(event) {
    event.preventDefault()

    const fkProduto = Number(newItem.fkProduto)
    const quantidade = Number(newItem.quantidade)
    const valorUnitario = Number(newItem.valorUnitario)

    if (!Number.isFinite(fkProduto) || fkProduto <= 0) {
      setLocalError('Selecione um produto valido.')
      return
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setLocalError('Informe uma quantidade valida.')
      return
    }

    if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
      setLocalError('Informe um valor unitario valido.')
      return
    }

    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, { fkProduto, quantidade, valorUnitario }],
    }))

    closeModal()
  }

  function removeItem(itemIndex) {
    if (isReadOnly) {
      return
    }

    if (form.itens.length <= 1) {
      setIsSingleItemWarningOpen(true)
      return
    }

    setLocalError('')
    setForm((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, index) => index !== itemIndex),
    }))
  }

  function applyTotalVendaToRevenda() {
    updateField('valorTotalRevenda', formatMoney(valorTotalVenda))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isReadOnly) {
      return
    }

    if (!form.itens.length) {
      setLocalError('Adicione ao menos um item ao pedido.')
      return
    }

    setLocalError('')

    const numeroNotaDistribuidor =
      form.numeroNotaDistribuidor === '' || form.numeroNotaDistribuidor === null
        ? null
        : Number(form.numeroNotaDistribuidor)

    await onSubmit({
      dataPedido: form.dataPedido,
      numeroNotaDistribuidor,
      valorTotalRevenda: Number(form.valorTotalRevenda),
      valorTotalFaturamento: Number(form.valorTotalFaturamento),
      statusPedido: form.statusPedido,
      frete: form.frete === 'true',
      transportadora: form.transportadora,
      observacoes: form.observacoes,
      fkCliente: Number(form.fkCliente),
      fkDistribuidor: Number(form.fkDistribuidor),
      itens: form.itens,
    })
  }

  return (
    <>
      <form className="entity-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>{labelRequired('Data do Pedido', !isEditMode)}</span>
          <input
            disabled={isReadOnly}
            name="dataPedido"
            onChange={(event) => updateField('dataPedido', event.target.value)}
            required
            type="date"
            value={form.dataPedido}
          />
        </label>

        <label className="field">
          <span>Nota Distribuidor</span>
          <input
            disabled={isReadOnly}
            name="numeroNotaDistribuidor"
            onChange={(event) => updateField('numeroNotaDistribuidor', event.target.value)}
            type="number"
            value={form.numeroNotaDistribuidor}
          />
        </label>

        <label className="field">
          <span>{labelRequired('Valor Revenda', !isEditMode)}</span>
          <input
            disabled={isReadOnly}
            name="valorTotalRevenda"
            onChange={(event) => updateField('valorTotalRevenda', event.target.value)}
            required
            step="0.01"
            type="number"
            value={form.valorTotalRevenda}
          />
        </label>

        <label className="field">
          <span>{labelRequired('Valor Faturamento', !isEditMode)}</span>
          <input
            disabled={isReadOnly}
            name="valorTotalFaturamento"
            onChange={(event) => updateField('valorTotalFaturamento', event.target.value)}
            required
            step="0.01"
            type="number"
            value={form.valorTotalFaturamento}
          />
        </label>

        <label className="field">
          <span>{labelRequired('Status', !isEditMode)}</span>
          <select
            disabled={isReadOnly}
            name="statusPedido"
            onChange={(event) => updateField('statusPedido', event.target.value)}
            required
            value={form.statusPedido}
          >
            <option value="">Selecione...</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{labelRequired('Frete', !isEditMode)}</span>
          <select
            disabled={isReadOnly}
            name="frete"
            onChange={(event) => updateField('frete', event.target.value)}
            required
            value={form.frete}
          >
            <option value="">Selecione...</option>
            {(fieldOptions.frete || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Transportadora</span>
          <input
            disabled={isReadOnly}
            name="transportadora"
            onChange={(event) => updateField('transportadora', event.target.value)}
            type="text"
            value={form.transportadora}
          />
        </label>

        <label className="field">
          <span>Observacoes</span>
          <input
            disabled={isReadOnly}
            name="observacoes"
            onChange={(event) => updateField('observacoes', event.target.value)}
            type="text"
            value={form.observacoes}
          />
        </label>

        <label className="field">
          <span>{labelRequired('Cliente', !isEditMode)}</span>
          <select
            disabled={isReadOnly}
            name="fkCliente"
            onChange={(event) => updateField('fkCliente', event.target.value)}
            required
            value={form.fkCliente}
          >
            <option value="">Selecione...</option>
            {(fieldOptions.fkCliente || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{labelRequired('Distribuidor', !isEditMode)}</span>
          <select
            disabled={isReadOnly}
            name="fkDistribuidor"
            onChange={(event) => updateField('fkDistribuidor', event.target.value)}
            required
            value={form.fkDistribuidor}
          >
            <option value="">Selecione...</option>
            {(fieldOptions.fkDistribuidor || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <section className={`pedido-items-block ${itemsRequired ? 'required' : 'optional'}`}>
          <header className="pedido-items-header">
            <div className="pedido-items-title-wrap">
              <h3>
                Itens do Pedido
                {itemsRequired && <span className="required-mark"> *</span>}
              </h3>
              <span className={`field-required-tag ${itemsRequired ? 'required' : 'optional'}`}>
                {itemsRequired ? 'Obrigatorio' : 'Opcional'}
              </span>
            </div>
            {!isReadOnly && (
              <button className="btn btn-light" onClick={openModal} type="button">
                Adicionar Item
              </button>
            )}
          </header>

          <div className="table-wrap">
            <table className="entity-table pedido-items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Unitario</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {!form.itens.length && (
                  <tr>
                    <td colSpan={4}>Nenhum item adicionado.</td>
                  </tr>
                )}
                {form.itens.map((item, index) => {
                  const produto = produtoOptions.find((option) => Number(option.value) === item.fkProduto)
                  return (
                    <tr key={`${item.fkProduto}-${index}`}>
                      <td>{produto?.label || `Produto #${item.fkProduto}`}</td>
                      <td>{item.quantidade}</td>
                      <td>{item.valorUnitario}</td>
                      <td>
                        {!isReadOnly ? (
                          <button
                            className="btn btn-danger"
                            onClick={() => removeItem(index)}
                            type="button"
                          >
                            Remover
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>
                    <div className="pedido-items-summary">
                      <div className="pedido-total-venda">
                        <span>Valor Total Venda:</span>
                        <strong>{formatMoney(valorTotalVenda)}</strong>
                      </div>
                      <button
                        className="btn btn-light"
                        disabled={isReadOnly || !form.itens.length}
                        onClick={applyTotalVendaToRevenda}
                        type="button"
                      >
                        Usar no Valor Revenda
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {(localError || (itemsRequired && !form.itens.length)) && (
          <p className="info-text form-error">
            {localError || 'Itens sao obrigatorios para criar um pedido.'}
          </p>
        )}

        {!isReadOnly && (
          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        )}
      </form>

      {isModalOpen && !isReadOnly && (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="modal-panel" role="dialog">
            <header className="modal-header">
              <h3>Adicionar Item</h3>
            </header>

            <form className="modal-body" onSubmit={handleAddItem}>
              <label className="field">
                <span>Produto</span>
                <select
                  onChange={(event) => setNewItem((prev) => ({ ...prev, fkProduto: event.target.value }))}
                  required
                  value={newItem.fkProduto}
                >
                  <option value="">Selecione...</option>
                  {produtoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Quantidade</span>
                <input
                  min="1"
                  onChange={(event) => setNewItem((prev) => ({ ...prev, quantidade: event.target.value }))}
                  required
                  type="number"
                  value={newItem.quantidade}
                />
              </label>

              <label className="field">
                <span>Valor Unitario</span>
                <input
                  min="0.01"
                  onChange={(event) => setNewItem((prev) => ({ ...prev, valorUnitario: event.target.value }))}
                  required
                  step="0.01"
                  type="number"
                  value={newItem.valorUnitario}
                />
              </label>

              {localError && <p className="info-text form-error">{localError}</p>}

              <div className="actions-inline modal-actions">
                <button className="btn btn-light" onClick={closeModal} type="button">
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSingleItemWarningOpen && !isReadOnly && (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="modal-panel" role="dialog">
            <header className="modal-header">
              <h3>Não é possível remover o último item</h3>
            </header>

            <div className="modal-body">
              <p>
                Todo pedido precisa manter pelo menos um item para continuar valido no sistema.
              </p>
              <p>
                Se este produto não deve mais fazer parte do pedido, primeiro adicione um novo
                item e depois remova o item atual.
              </p>

              <div className="actions-inline modal-actions">
                <button className="btn btn-light" onClick={closeSingleItemWarningModal} type="button">
                  Entendi
                </button>
                <button className="btn btn-primary" onClick={handleAddItemFromWarning} type="button">
                  Adicionar outro item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
