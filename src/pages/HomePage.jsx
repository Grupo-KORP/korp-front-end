import { Link } from 'react-router-dom'
import { entities } from '../config/entities'

export function HomePage() {
  return (
    <section className="page-panel">
      <header className="page-header">
        <h2>Frontend CRUD automatico</h2>
        <p>
          Este painel detecta as entidades mapeadas e gera listagem, criacao,
          edicao e exclusao de forma padronizada.
        </p>
      </header>

      <div className="card-grid">
        {entities.map((entity) => (
          <article className="entity-card" key={entity.key}>
            <h3>{entity.label}</h3>
            <p>API: {entity.apiBasePath}</p>
            <div className="actions-inline">
              <Link className="btn btn-light" to={entity.routeBase}>
                Listar
              </Link>
              <Link className="btn btn-primary" to={`${entity.routeBase}/new`}>
                Novo
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
