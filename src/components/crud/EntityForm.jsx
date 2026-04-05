function parseValueByType(field, value) {
  if (field.valueType === 'boolean') {
    if (value === '' || value === null || value === undefined) {
      return null
    }

    return value === 'true'
  }

  if (field.valueType === 'number' || field.type === 'number') {
    if (value === '' || value === null || value === undefined) {
      return null
    }

    return Number(value)
  }

  if (field.valueType === 'json') {
    if (!value) {
      return []
    }

    return JSON.parse(value)
  }

  return value
}

function buildInitialForm(entity, initialData) {
  return entity.fields.reduce((acc, field) => {
    const initialValue = initialData?.[field.name]

    if (field.valueType === 'json' && initialValue !== undefined && initialValue !== null) {
      acc[field.name] = JSON.stringify(initialValue, null, 2)
      return acc
    }

    if (field.valueType === 'boolean') {
      if (initialValue === true) {
        acc[field.name] = 'true'
        return acc
      }

      if (initialValue === false) {
        acc[field.name] = 'false'
        return acc
      }
    }

    const fallback = field.type === 'number' ? '' : ''
    acc[field.name] = initialValue ?? fallback
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
          ) : field.type === 'textarea' ? (
            <textarea
              defaultValue={initialForm[field.name]}
              name={field.name}
              required={field.required}
              rows={5}
            />
          ) : (
            <input
              defaultValue={initialForm[field.name]}
              name={field.name}
              required={field.required}
              type={field.type}
            />
          )}
          {field.helpText && <small className="field-help">{field.helpText}</small>}
        </label>
      ))}

      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
