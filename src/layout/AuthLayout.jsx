import React from 'react'
import { useNavigate } from 'react-router-dom'
import logoTnd from '../assets/logo-tnd.webp'
import bgDireito from '../assets/bg-direito.png'

/**
 * AuthLayout
 *
 * Layout da tela de autenticação (Login).
 * Divide a tela em dois painéis:
 *   - Esquerdo: formulário (branco)
 *   - Direito:  branding TND Brasil (preto + imagem de ondas)
 *
 * Props:
 *   title      {string}      - Título exibido no painel esquerdo
 *   rightTitle {string}      - Título exibido no painel direito (padrão: "Bem-vindo!")
 *   rightText  {string}      - Subtítulo do painel direito
 *   children   {ReactNode}   - Conteúdo do formulário
 *   showClose  {boolean}     - Exibe o botão "X" de fechar (padrão: true)
 *   onClose    {function}    - Callback do botão fechar (padrão: navega para /)
 */
function AuthLayout({
  title,
  rightTitle = 'Bem-vindo!',
  rightText = 'Para se conectar insira suas informações pessoais.',
  children,
  showClose = true,
  onClose,
}) {
  const navigate = useNavigate()

  function handleClose() {
    if (onClose) return onClose()
    navigate('/')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Painel Esquerdo (formulário) ── */}
      <div className="relative flex flex-col w-full md:w-1/2 bg-white px-8 sm:px-14 lg:px-20 py-10 overflow-y-auto panel-enter">
        {/* Botão fechar */}
        {showClose && (
          <button
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition-colors text-xl font-light leading-none"
          >
            ✕
          </button>
        )}

        {/* Espaço acima do título */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">
            {title}
          </h1>

          {/* Conteúdo do formulário injetado via children */}
          {children}
        </div>
      </div>

      {/* ── Painel Direito (branding) ── */}
      <div
        className="hidden md:flex md:w-1/2 flex-col panel-right-enter relative"
        style={{
          backgroundImage: `url(${bgDireito})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay escuro para o texto ficar legível */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Logo */}
        <div className="relative z-10 flex justify-end p-8">
          <img src={logoTnd} alt="TND Brasil" className="h-10 w-auto object-contain" />
        </div>

        {/* Texto */}
        <div className="relative z-10 px-12 lg:px-16 mt-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            {rightTitle}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-xs">
            {rightText}
          </p>
        </div>
      </div>

    </div>
  )
}

export default AuthLayout
