import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bgLogin from './../assets/bg-azul-preto.png'

const IcoRaio = ({ tamanho = 22 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IcoEmail = ({ tamanho = 16 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

export default function PaginaRecuperarSenha() {
  const navegar = useNavigate()

  const [email, setEmail]         = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [passo, setPasso]         = useState(1)

  function validarEmail(valor) {
    if (!valor.trim()) return 'E-mail obrigatório.'
    if (!valor.includes('@')) return 'Informe um e-mail válido.'
    return ''
  }

  function handleProximo() {
    const erro = validarEmail(email)
    setErroEmail(erro)
    if (erro) return
    setPasso(2)
  }

  function handleCancelar() {
    navegar(-1)
  }

  function handleOk() {
    navegar(-1)
  }

  const temErro = Boolean(erroEmail)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Foto de fundo responsiva com blur */}
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
      />

      {/* Overlay escuro com baixa opacidade */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Card */}
      <div className="relative w-full mx-4 sm:w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {passo === 1 ? (
          /* ── Passo 1: digitar e-mail ── */
          <div className="px-7 py-8 flex flex-col gap-5">

            {/* Ícone */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(10,52,144,0.1)' }}
            >
              <IcoRaio tamanho={18} style={{ color: '#0a3490' }} />
            </div>

            {/* Título e descrição */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-black text-gray-900 m-0 leading-tight">
                Recuperar sua conta
              </h1>
              <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
                Podemos ajudá-lo a redefinir sua senha e informações de segurança.
                Primeiro, insira seu email e siga suas instruções a seguir
              </p>
            </div>

            {/* Campo e-mail */}
            <div className="flex flex-col gap-1">
              <div className={[
                'flex items-center gap-2 px-3 h-10 rounded-xl border bg-white transition-all duration-200',
                temErro
                  ? 'border-red-300 ring-1 ring-red-300'
                  : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200',
              ].join(' ')}>
                <span className={temErro ? 'text-red-400' : 'text-gray-300'}>
                  <IcoEmail tamanho={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (erroEmail) setErroEmail(validarEmail(e.target.value))
                  }}
                  onBlur={() => setErroEmail(validarEmail(email))}
                  onKeyDown={(e) => e.key === 'Enter' && handleProximo()}
                  placeholder="example@dominio.com"
                  autoComplete="email"
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-[14px] text-gray-700 placeholder:text-gray-300 font-medium"
                />
              </div>
              {temErro && (
                <p className="text-[12px] font-semibold text-red-500 pl-1">{erroEmail}</p>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-1">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-5 h-9 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 cursor-pointer transition-all duration-150 hover:bg-gray-50 active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProximo}
                className="px-5 h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
                style={{ background: '#0a3490', boxShadow: '0 4px 14px rgba(10,52,144,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#082a75'}
                onMouseLeave={e => e.currentTarget.style.background = '#0a3490'}
              >
                Próximo
              </button>
            </div>
          </div>

        ) : (
          /* ── Passo 2: confirmação ── */
          <div className="px-7 py-8 flex flex-col gap-5">

            {/* Ícone */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(10,52,144,0.1)' }}
            >
              <IcoRaio tamanho={18} style={{ color: '#0a3490' }} />
            </div>

            {/* Título e descrição */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-black text-gray-900 m-0 leading-tight">
                Instruções enviadas
              </h1>
              <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
                Enviamos as instruções de mudanças de senha para{' '}
                <span className="font-bold text-gray-700">{email}</span>,
                verifique sua caixa de entrada e de spam.
              </p>
            </div>

            {/* Botão Ok */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleOk}
                className="px-6 h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
                style={{ background: '#0a3490', boxShadow: '0 4px 14px rgba(10,52,144,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#082a75'}
                onMouseLeave={e => e.currentTarget.style.background = '#0a3490'}
              >
                Ok
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}