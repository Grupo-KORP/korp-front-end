import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../ui/InputField'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useAuth } from '../../hooks/useAuth'
import { decodeJWT } from '../../services/api'
// import ModalAlterarSenha from '../modal/ModalAlterarSenha'

/**
 * LoginForm
 *
 * Formulário de login do vendedor.
 * Conecta-se ao hook useAuth para autenticação via API.
 */
function LoginForm() {
  const navegar = useNavigate()
  const { entrar, loading, error } = useAuth()
  // const [modalSenhaAberto, setModalSenhaAberto] = useState(false)

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
      await entrar({ email: values.email, senha: values.senha })
      const token = localStorage.getItem('korp_token')
      const isVendedor = decodeJWT(token).roles.includes('ROLE_VEND')

      if (isVendedor) {
        navegar('/vendedores/home')
      } else {
        navegar('/financeiro/vendedores')
      }
    } catch {
      // Erro já capturado pelo hook useAuth e exibido via `error`
    }
  }

  // function handleAlterarSenha({ senhaAtual, novaSenha }) {
  //   // TODO: chamar API para alterar senha
  //   console.log({ senhaAtual, novaSenha })
  //   setModalSenhaAberto(false)
  // }

  return (
    <>
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

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-brand-blue hover:underline"
            onClick={() => navegar('/vendedores/recuperar-senha')}
          >
            Esqueci minha senha
          </button>
        </div>
      </form>

      {/* Modal de alterar senha desativado temporariamente */}
      {/* {modalSenhaAberto && (
        <ModalAlterarSenha
          aoConfirmar={handleAlterarSenha}
          aoFechar={() => setModalSenhaAberto(false)}
        />
      )} */}
    </>
  )
}

export default LoginForm