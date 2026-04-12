import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const successMessage = useMemo(() => {
    return location.state?.message || ''
  }, [location.state])

  const fromPath = useMemo(() => {
    const from = location.state?.from
    return from?.pathname || '/'
  }, [location.state])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)
      await login({
        email: form.email.trim(),
        senha: form.senha,
      })

      navigate(fromPath, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-shell">
      <article className="auth-card">
        <header>
          <h1>Entrar no Korp</h1>
          <p>Use suas credenciais para testar os endpoints autenticados com JWT.</p>
        </header>

        {successMessage && <p className="status-banner success">{successMessage}</p>}
        {error && <p className="status-banner error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input
              autoComplete="email"
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
              required
              type="password"
              value={form.senha}
            />
          </label>

          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Não possui conta?</span>
          <Link className="btn btn-light" to="/cadastro">
            Criar conta
          </Link>
        </footer>
      </article>
    </section>
  )
}
