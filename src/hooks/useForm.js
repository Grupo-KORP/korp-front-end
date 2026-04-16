import { useState } from 'react'

/**
 * Hook para controle de formulários.
 *
 * Uso:
 *   const { values, errors, handleChange, validate, reset } = useForm(
 *     { email: '', senha: '' },
 *     { email: v => !v && 'Obrigatório' }
 *   )
 *
 * @param {object} initialValues  - Valores iniciais dos campos
 * @param {object} validators     - Mapa de campo → função validadora (retorna mensagem ou null)
 */
export function useForm(initialValues, validators = {}) {
  const [values, setValues]   = useState(initialValues)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))

    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    // Valida campo ao perder foco
    if (validators[name]) {
      const msg = validators[name](values[name])
      setErrors(prev => ({ ...prev, [name]: msg || null }))
    }
  }

  /**
   * Valida todos os campos e retorna true se válido.
   */
  function validate() {
    const newErrors = {}
    Object.keys(validators).forEach(field => {
      const msg = validators[field](values[field])
      if (msg) newErrors[field] = msg
    })
    setErrors(newErrors)
    setTouched(Object.fromEntries(Object.keys(initialValues).map(k => [k, true])))
    return Object.keys(newErrors).length === 0
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return { values, errors, touched, handleChange, handleBlur, validate, reset }
}
