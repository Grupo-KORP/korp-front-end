import React from 'react'

/**
 * Button
 *
 * Botão reutilizável com variantes e estados de loading.
 *
 * Props:
 *   children  {ReactNode}  - Texto ou conteúdo do botão
 *   variant   {string}     - 'primary' | 'secondary' | 'ghost'
 *   loading   {boolean}    - Exibe spinner e desabilita interação
 *   disabled  {boolean}    - Desabilita o botão
 *   fullWidth {boolean}    - Ocupa 100% da largura
 *   type      {string}     - 'button' | 'submit' | 'reset'
 *   onClick   {function}   - Callback de clique
 *   className {string}     - Classes adicionais
 */
function Button({
  children,
  variant   = 'primary',
  loading   = false,
  disabled  = false,
  fullWidth = false,
  type      = 'button',
  onClick,
  className = '',
}) {
  const isDisabled = disabled || loading

  const base = [
    'inline-flex items-center justify-center gap-2',
    'rounded-xl px-6 py-3 text-sm font-semibold',
    'transition-all duration-200 outline-none',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    fullWidth ? 'w-full' : '',
    isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
  ]

  const variants = {
    primary: [
      'bg-brand-blue-btn text-white',
      'hover:bg-brand-blue-dark active:scale-[0.98]',
      'focus-visible:ring-blue-400',
      'shadow-md hover:shadow-lg',
    ],
    secondary: [
      'bg-white text-brand-blue border border-brand-blue',
      'hover:bg-blue-50 active:scale-[0.98]',
      'focus-visible:ring-blue-400',
    ],
    ghost: [
      'bg-transparent text-gray-600',
      'hover:bg-gray-100 active:scale-[0.98]',
      'focus-visible:ring-gray-300',
    ],
  }

  const classes = [
    ...base,
    ...(variants[variant] || variants.primary),
    className,
  ].join(' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default Button
