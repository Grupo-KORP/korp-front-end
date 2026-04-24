import React from 'react'
import AuthLayout from '../layout/AuthLayout'
import LoginForm from '../components/forms/LoginForm'

/**
 * LoginPage  →  rota: /login
 *
 * Tela de login do vendedor.
 * Usa o AuthLayout (split-screen) e injeta o LoginForm no painel esquerdo.
 */
function LoginPage() {
  return (
    <AuthLayout
      title="Entrar"
      rightTitle="Bem-vindo!"
      rightText="Para se conectar insira suas informações pessoais."
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
