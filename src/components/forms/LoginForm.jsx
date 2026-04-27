import React from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../ui/InputField'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useAuth } from '../../hooks/useAuth'

/**
 * LoginForm
 *
 * Formulário de login do vendedor.
 * Conecta-se ao hook useAuth para autenticação via API.
 */
function LoginForm() {
  const navigate = useNavigate()
  const { entrar, loading, error } = useAuth()

  // Definição dos campos e validações
  const { values, errors, handleChange, handleBlur, validate } = useForm(
    { email: '', senha: '' },
    {
      email: v => !v
        ? 'E-mail obrigatório.'
        : !v.includes('@')
          ? 'Informe um e-mail válido.'
          : null,
      senha: v => !v
        ? 'Senha obrigatória.'
        : v.length < 6
          ? 'Mínimo de 6 caracteres.'
          : null,
    }
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    try {
      // TODO: após login bem-sucedido, redirecionar para /dashboard
      await entrar({ email: values.email, senha: values.senha })
      navigate('/vendedores')
    } catch {
      // Erro já capturado pelo hook useAuth e exibido via `error`
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 w-full">
      {/* Feedback de erro global */}
      <Alert type="error" message={error} />

      <InputField
        name="email"
        type="email"
        placeholder="E-mail TND"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        autoFocus
      />

      <InputField
        name="senha"
        type="password"
        placeholder="Senha"
        value={values.senha}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.senha}
      />

      <div className="flex justify-end mt-2">
        <Button type="submit" loading={loading} variant="primary">
          Entrar
        </Button>
      </div>
      
      {/* Link esqueci senha — TODO: criar rota /esqueci-senha */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-brand-blue hover:underline"
          onClick={() => {/* TODO: navigate('/esqueci-senha') */ }}
        >
          Esqueci minha senha
        </button>
      </div>
    </form>
  )
}

export default LoginForm
