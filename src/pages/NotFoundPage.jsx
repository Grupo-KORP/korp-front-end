import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-panel not-found">
      <h2>Pagina nao encontrada</h2>
      <p>A rota informada nao existe neste frontend.</p>
      <Link className="btn btn-primary" to="/">
        Ir para inicio
      </Link>
    </section>
  )
}
