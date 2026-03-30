import { Link } from 'react-router-dom'

export function EntityTable({ entity, rows, isLoading, onDelete, renderCell }) {
  if (isLoading) {
    return <p className="info-text">Carregando dados...</p>
  }

  if (!rows.length) {
    return <p className="info-text">Nenhum registro encontrado.</p>
  }

  return (
    <div className="table-wrap">
      <table className="entity-table">
        <thead>
          <tr>
            {entity.fields.map((field) => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowId = row?.[entity.idField]
            const rowKey = `${entity.key}-${rowId ?? 'sem-id'}-${rowIndex}`

            return (
            <tr key={rowKey}>
              {entity.fields.map((field, fieldIndex) => (
                <td key={`${rowKey}-${field.name}-${fieldIndex}`}>
                  {renderCell ? renderCell(field, row) : String(row[field.name] ?? '-')}
                </td>
              ))}
              <td>
                <div className="actions-inline">
                  <Link
                    className="btn btn-light"
                    to={`${entity.routeBase}/edit/${rowId}`}
                  >
                    Editar
                  </Link>
                  {entity.allowDelete && (
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(rowId)}
                      type="button"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
