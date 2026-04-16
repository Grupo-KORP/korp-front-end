import React from 'react'

/**
 * Alert
 *
 * Exibe mensagens de feedback inline (erro, sucesso, aviso).
 *
 * Props:
 *   type    {string}  - 'error' | 'success' | 'warning'
 *   message {string}  - Texto a exibir
 */
function Alert({ type = 'error', message }) {
  if (!message) return null

  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  }

  const icons = {
    error:   '⚠',
    success: '✓',
    warning: '⚠',
  }

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}
    >
      <span className="font-bold">{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

export default Alert
