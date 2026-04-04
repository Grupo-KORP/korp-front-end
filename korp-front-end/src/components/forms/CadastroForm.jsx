import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../ui/InputField'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { useForm } from '../../hooks/useForm'
import { cadastrarColaborador } from '../../services/api'

/**
 * CadastroForm
 *
 * Formulário de cadastro de colaborador/vendedor.
 * Campos: Nome completo, E-mail TND, Telefone.
 */
function CadastroForm() {
  const navigate  = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState(null)
  const [success, setSuccess]   = useState(false)

  const { values, errors, handleChange, handleBlur, validate, reset } = useForm(
    { nome: '', email: '', telefone: ''},
    {
      nome: v => !v?.trim()
        ? 'Nome obrigatório.'
        : v.trim().split(' ').length < 2
          ? 'Informe o nome completo.'
          : null,
      email: v => !v
        ? 'E-mail obrigatório.'
        : !v.includes('@')
          ? 'Informe um e-mail válido.'
          : null,
      telefone: v => !v
        ? 'Telefone obrigatório.'
        : v.replace(/\D/g, '').length < 10
          ? 'Telefone inválido.'
          : null,
    }
  )

  // Máscara simples de telefone
  function handleTelefoneChange(e) {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 11)
    let masked = raw
    if (raw.length > 2)  masked = `(${raw.slice(0,2)}) ${raw.slice(2)}`
    if (raw.length > 7)  masked = `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`
    handleChange({ target: { name: 'telefone', value: masked } })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError(null)

    // Modificar, caso o financeiro utilize

    // try {
    //   // TODO: integração real — chamar endpoint POST /colaboradores
    //   await cadastrarColaborador(values)
    //   setSuccess(true)
    //   reset()

    //   // Redireciona para login após 2s
    //   setTimeout(() => navigate('/login'), 2000)
    // } catch (err) {
    //   setApiError(err.message)
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 w-full">
      {/* Feedback global */}
      {apiError && <Alert type="error"   message={apiError} />}
      {success  && <Alert type="success" message="Colaborador cadastrado com sucesso! Redirecionando..." />}

      <InputField
        name="nome"
        type="text"
        placeholder="Nome completo"
        value={values.nome}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.nome}
        autoFocus
      />

      <InputField
        name="email"
        type="email"
        placeholder="E-mail TND"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
      />

      <InputField
        name="telefone"
        type="tel"
        placeholder="Telefone"
        value={values.telefone}
        onChange={handleTelefoneChange}
        onBlur={handleBlur}
        error={errors.telefone}
      />


      <div className="flex justify-end mt-2">
        <Button type="submit" loading={loading} variant="primary">
          Cadastrar
        </Button>
      </div>
    </form>
  )
}

export default CadastroForm
