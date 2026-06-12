import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { redefinirSenha } from '../services/api'
import bgLogin from './../assets/bg-azul-preto.png'

/* ══════════════════════════════════════════
   REGRAS E VALIDAÇÕES
══════════════════════════════════════════ */
const REGRAS_SENHA = [
  { id: 'tamanho',   label: 'Mínimo 8 caracteres',  validar: (s) => s.length >= 8 },
  { id: 'maiuscula', label: 'Uma letra maiúscula',   validar: (s) => /[A-Z]/.test(s) },
  { id: 'numero',    label: 'Um número',             validar: (s) => /\d/.test(s) },
  { id: 'especial',  label: 'Um caractere especial', validar: (s) => /[^A-Za-z0-9]/.test(s) },
]

/* ══════════════════════════════════════════
   ÍCONES
══════════════════════════════════════════ */
const IcoCadeado = ({ tamanho = 18 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IcoOlho = ({ aberto }) => aberto ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IcoCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IcoAlerta = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/* ══════════════════════════════════════════
   SUBCOMPONENTES
══════════════════════════════════════════ */
function CampoSenha({ id, label, valor, onChange, onBlur, erro, visivel, onToggleVisivel, placeholder, disabled }) {
  const temErro = Boolean(erro)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}
        className="text-[11px] font-bold tracking-[0.1em] uppercase select-none"
        style={{ color: '#0a3490' }}>
        {label}
      </label>
      <div className={[
        'flex items-center gap-3 px-3 h-10 rounded-xl border bg-white transition-all duration-200',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        temErro
          ? 'border-red-300 ring-1 ring-red-300'
          : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100',
      ].join(' ')}>
        <span className={temErro ? 'text-red-400' : 'text-gray-300'}>
          <IcoCadeado tamanho={15} />
        </span>
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="new-password"
          className="flex-1 bg-transparent outline-none text-[14px] text-gray-700 placeholder:text-gray-300 font-medium [&::-ms-reveal]:hidden [&::-ms-clear]:hidden disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onToggleVisivel}
          tabIndex={-1}
          disabled={disabled}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          className="text-gray-300 transition-colors duration-150 flex-shrink-0 disabled:cursor-not-allowed"
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = '#0a3490' }}
          onMouseLeave={e => { e.currentTarget.style.color = '' }}>
          <IcoOlho aberto={visivel} />
        </button>
      </div>
      {temErro && (
        <p className="text-[12px] font-semibold text-red-500 pl-1">{erro}</p>
      )}
    </div>
  )
}

function IndicadorForca({ senha }) {
  const pontos = REGRAS_SENHA.filter((r) => r.validar(senha)).length
  const cores = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']
  const labels = ['', 'Fraca', 'Regular', 'Boa', 'Forte']
  const corTexto = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-600']

  if (!senha) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${senha && i <= pontos ? cores[pontos] : 'bg-gray-200'}`}
            />
          ))}
        </div>
        {labels[pontos] && (
          <span className={`text-[11px] font-bold ${corTexto[pontos]}`}>{labels[pontos]}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {REGRAS_SENHA.map((r) => {
          const ok = r.validar(senha)
          return (
            <div key={r.id} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${ok ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                  {ok
                    ? <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    : <line x1="3" y1="3" x2="7" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  }
                </svg>
              </span>
              <span className={`text-[11px] font-medium transition-colors duration-200 ${ok ? 'text-emerald-700' : 'text-gray-400'}`}>
                {r.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function PaginaRedefinirSenha() {
  const navegar = useNavigate()
  const [searchParams] = useSearchParams()

  // Captura o token da URL: /reset-password?token=abc123
  const token = searchParams.get('token')

  const [novaSenha,        setNovaSenha]        = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [erroNova,         setErroNova]         = useState('')
  const [erroConfirmacao,  setErroConfirmacao]  = useState('')
  const [visivelNova,      setVisivelNova]      = useState(false)
  const [visivelConf,      setVisivelConf]      = useState(false)
  const [carregando,       setCarregando]       = useState(false)

  // 'formulario' | 'sucesso' | 'token-invalido'
  const [passo, setPasso] = useState(token ? 'formulario' : 'token-invalido')

  useEffect(() => {
    if (!token) setPasso('token-invalido')
  }, [token])

  const senhaForte    = REGRAS_SENHA.every((r) => r.validar(novaSenha))
  const confirmacaoOk = novaSenha === confirmacaoSenha && confirmacaoSenha.length > 0
  const podeSalvar    = senhaForte && confirmacaoOk

  function validarNova(v) {
    if (!v) return 'Informe a nova senha.'
    if (!REGRAS_SENHA.every((r) => r.validar(v))) return 'A senha não atende aos requisitos.'
    return ''
  }

  function validarConf(nova, conf) {
    if (!conf) return 'Confirme a nova senha.'
    if (nova !== conf) return 'As senhas não coincidem.'
    return ''
  }

  async function handleSalvar() {
    const eNova = validarNova(novaSenha)
    const eConf = validarConf(novaSenha, confirmacaoSenha)
    setErroNova(eNova)
    setErroConfirmacao(eConf)
    if (eNova || eConf) return

    setCarregando(true)
    try {    
    await redefinirSenha({ token, novaSenha, confirmaSenha: confirmacaoSenha })
      setPasso('sucesso')
    } catch (err) {
      // Token expirado ou inválido retornado pelo backend
      if (err.status === 400 || err.status === 404) {
        setPasso('token-invalido')
      } else {
        setErroNova(err.message || 'Erro ao redefinir a senha. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Fundo */}
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Card */}
      <div className="relative w-full mx-4 sm:w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Passo: token inválido / ausente ── */}
        {passo === 'token-invalido' && (
          <div className="px-7 py-8 flex flex-col items-center gap-5 text-center">
            <div className="text-red-400">
              <IcoAlerta />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-black text-gray-900 m-0 leading-tight">
                Link inválido ou expirado
              </h1>
              <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
                Este link de redefinição de senha não é mais válido.
                Solicite um novo link pela tela de login.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navegar('/login')}
              className="px-6 h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
              style={{ background: '#0a3490', boxShadow: '0 4px 14px rgba(10,52,144,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#082a75'}
              onMouseLeave={e => e.currentTarget.style.background = '#0a3490'}
            >
              Voltar ao login
            </button>
          </div>
        )}

        {/* ── Passo: formulário ── */}
        {passo === 'formulario' && (
          <div className="px-7 py-8 flex flex-col gap-5">

            {/* Ícone + título */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(10,52,144,0.1)' }}
            >
              <IcoCadeado tamanho={18} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-black text-gray-900 m-0 leading-tight">
                Redefinir senha
              </h1>
              <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
                Crie uma nova senha segura para sua conta. Ela não pode ser igual à senha anterior.
              </p>
            </div>

            {/* Campos */}
            <CampoSenha
              id="nova-senha"
              label="Nova senha"
              valor={novaSenha}
              onChange={setNovaSenha}
              onBlur={() => setErroNova(validarNova(novaSenha))}
              erro={erroNova}
              visivel={visivelNova}
              onToggleVisivel={() => setVisivelNova(p => !p)}
              placeholder="Crie uma senha forte"
              disabled={carregando}
            />

            <IndicadorForca senha={novaSenha} />

            <CampoSenha
              id="confirmacao-senha"
              label="Confirmar nova senha"
              valor={confirmacaoSenha}
              onChange={setConfirmacaoSenha}
              onBlur={() => setErroConfirmacao(validarConf(novaSenha, confirmacaoSenha))}
              erro={erroConfirmacao}
              visivel={visivelConf}
              onToggleVisivel={() => setVisivelConf(p => !p)}
              placeholder="Repita a nova senha"
              disabled={carregando}
            />

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-1">
              <button
                type="button"
                onClick={() => navegar('/login')}
                disabled={carregando}
                className="px-5 h-9 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 cursor-pointer transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={!podeSalvar || carregando}
                className="px-5 h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
                style={{
                  background: podeSalvar && !carregando ? '#0a3490' : '#94a3b8',
                  boxShadow: podeSalvar && !carregando ? '0 4px 14px rgba(10,52,144,0.3)' : 'none',
                }}
                onMouseEnter={e => { if (podeSalvar && !carregando) e.currentTarget.style.background = '#082a75' }}
                onMouseLeave={e => { if (podeSalvar && !carregando) e.currentTarget.style.background = '#0a3490' }}
              >
                {carregando ? 'Salvando...' : 'Salvar senha'}
              </button>
            </div>
          </div>
        )}

        {/* ── Passo: sucesso ── */}
        {passo === 'sucesso' && (
          <div className="px-7 py-8 flex flex-col items-center gap-5 text-center">
            <div className="text-emerald-500">
              <IcoCheck />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-black text-gray-900 m-0 leading-tight">
                Senha redefinida!
              </h1>
              <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
                Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navegar('/login')}
              className="px-6 h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
              style={{ background: '#0a3490', boxShadow: '0 4px 14px rgba(10,52,144,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#082a75'}
              onMouseLeave={e => e.currentTarget.style.background = '#0a3490'}
            >
              Ir para o login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}