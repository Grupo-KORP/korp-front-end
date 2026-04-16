import React from 'react'
import AuthLayout from '../layouts/AuthLayout'
import CadastroForm from '../components/forms/CadastroForm'

/**
 * CadastroPage  →  rota: /cadastro
 *
 * Tela de cadastro de novo colaborador/vendedor.
 * Usa o AuthLayout (split-screen) e injeta o CadastroForm no painel esquerdo.
 */
function CadastroPage() {
  return (
    <AuthLayout
      title={<>Cadastrar<br />colaborador</>}
      rightTitle="Bem-vindo!"
      rightText="Insira as informações para o cadastro."
    >
      <CadastroForm />
    </AuthLayout>
  )
}

export default CadastroPage
