function parseValueByType(field, value) {
  if (field.valueType === 'number' || field.type === 'number') {
    if (value === '' || value === null || value === undefined) {
      return null
    }

    return Number(value)
  }

  return value
}

function buildInitialForm(entity, initialData) {
  return entity.fields.reduce((acc, field) => {
    const fallback = field.type === 'number' ? '' : ''
    acc[field.name] = initialData?.[field.name] ?? fallback
    return acc
  }, {})
}

export function EntityForm({ entity, initialData, onSubmit, isSubmitting, fieldOptions = {} }) {
  const initialForm = buildInitialForm(entity, initialData)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = entity.fields.reduce((acc, field) => {
      const rawValue = formData.get(field.name)
      const cleanValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue

      acc[field.name] = parseValueByType(field, cleanValue)
      return acc
    }, {})

    await onSubmit(payload)
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {entity.fields.map((field) => (
        <label className="field" key={field.name}>
          <span>{field.label}</span>
          {field.type === 'select' ? (
            <select
              defaultValue={initialForm[field.name] ?? ''}
              name={field.name}
              required={field.required}
            >
              <option value="">Selecione...</option>
              {(fieldOptions[field.name] || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              defaultValue={initialForm[field.name]}
              name={field.name}
              required={field.required}
              type={field.type}
            />
          )}
        </label>
      ))}

      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
