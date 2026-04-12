import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleOptions = [
  { value: 1, label: 'VEND (Vendas)' },
  { value: 2, label: 'FINAN (Financeiro)' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    role: '1',
    percentualComissao: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const percentualComissao = form.percentualComissao.trim()

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
      telefone: form.telefone.trim(),
      role: Number(form.role),
      percentualComissao: percentualComissao ? Number(percentualComissao) : null,
    }

    try {
      setIsSubmitting(true)
      await register(payload)

      navigate('/login', {
        replace: true,
        state: { message: 'Cadastro realizado com sucesso. Faça login para continuar.' },
      })
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
          <h1>Criar conta</h1>
          <p>Cadastre um usuário para acessar e validar os fluxos com JWT.</p>
        </header>

        {error && <p className="status-banner error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              required
              type="text"
              value={form.nome}
            />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
              required
              type="password"
              value={form.senha}
            />
          </label>

          <label className="field">
            <span>Telefone</span>
            <input
              onChange={(event) => setForm((prev) => ({ ...prev, telefone: event.target.value }))}
              required
              type="text"
              value={form.telefone}
            />
          </label>

          <label className="field">
            <span>Perfil</span>
            <select
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              required
              value={form.role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Percentual de Comissão</span>
            <input
              min="0"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, percentualComissao: event.target.value }))
              }
              placeholder="Ex: 5.5"
              step="0.01"
              type="number"
              value={form.percentualComissao}
            />
          </label>

          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Já possui conta?</span>
          <Link className="btn btn-light" to="/login">
            Voltar para login
          </Link>
        </footer>
      </article>
    </section>
  )
}
