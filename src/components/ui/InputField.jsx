import React, { useState } from 'react'

/**
 * InputField
 *
 * Campo de input reutilizável com suporte a:
 *   - label flutuante (placeholder visível)
 *   - exibição de erro
 *   - toggle de senha (show/hide)
 *   - ícone opcional
 *
 * Props:
 *   name        {string}   - name do input (usado pelo useForm)
 *   type        {string}   - tipo do input (text, email, password, tel…)
 *   placeholder {string}   - placeholder exibido
 *   value       {string}   - valor controlado
 *   onChange    {function} - handler de mudança
 *   onBlur      {function} - handler de blur
 *   error       {string}   - mensagem de erro
 *   disabled    {boolean}  - desabilita o campo
 *   autoFocus   {boolean}  - foco automático
 */
function InputField({
  name,
  type        = 'text',
  placeholder = '',
  value       = '',
  onChange,
  onBlur,
  error,
  disabled    = false,
  autoFocus   = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative">
        <input
          id={name}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete={isPassword ? 'current-password' : 'on'}
          className={[
            'w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-gray-800',
            'placeholder-gray-400 outline-none transition-all duration-200',
            'focus:bg-white focus:ring-2',
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-brand-blue focus:ring-blue-100',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            isPassword ? 'pr-11' : '',
          ].join(' ')}
        />

        {/* Botão show/hide senha */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-xs text-red-500 pl-1 animate-pulse">{error}</p>
      )}
    </div>
  )
}

// ── Ícones de olho (inline SVG) ──────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.27-3.592M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.977 9.977 0 01-4.28 5.47M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3l18 18" />
    </svg>
  )
}

export default InputField
