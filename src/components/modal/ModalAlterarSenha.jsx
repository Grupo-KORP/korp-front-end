import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const REGRAS_SENHA = [
  { id: "tamanho",  label: "Mínimo 8 caracteres",   validar: (s) => s.length >= 8 },
  { id: "maiuscula",label: "Uma letra maiúscula",    validar: (s) => /[A-Z]/.test(s) },
  { id: "numero",   label: "Um número",              validar: (s) => /\d/.test(s) },
  { id: "especial", label: "Um caractere especial",  validar: (s) => /[^A-Za-z0-9]/.test(s) },
];

function validarSenhaAtual(v) {
  if (!v.trim()) return "Informe sua senha atual.";
  return "";
}
function validarNovaSenha(v) {
  if (!v) return "Informe a nova senha.";
  if (!REGRAS_SENHA.every((r) => r.validar(v))) return "A senha não atende aos requisitos abaixo.";
  return "";
}
function validarConfirmacao(nova, conf) {
  if (!conf) return "Confirme a nova senha.";
  if (nova !== conf) return "As senhas não coincidem.";
  return "";
}

const IcoCadeado = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IcoOlho = ({ aberto }) => aberto ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoInfo = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function CampoSenha({ id, label, valor, onChange, onBlur, erro, visivel, onToggleVisivel, placeholder }) {
  const temErro = Boolean(erro);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}
        className="text-[11px] font-bold tracking-[0.1em] uppercase select-none"
        style={{ color: "#0a3490" }}>
        {label}
      </label>
      <div className={[
        "flex items-center gap-3 px-3 h-9 rounded-xl border bg-white transition-all duration-200",
        temErro
          ? "border-red-300 ring-1 ring-red-300"
          : "border-gray-200 focus-within:scale-[1.01]",
      ].join(" ")}>
        <span className={temErro ? "text-red-400" : "text-gray-300"}>
          <IcoCadeado size={15} />
        </span>
        <input
          id={id}
          type={visivel ? "text" : "password"}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="new-password"
          className="flex-1 bg-transparent outline-none text-[14px] text-gray-700 placeholder:text-gray-300 font-medium [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        />
        <button
          type="button"
          onClick={onToggleVisivel}
          tabIndex={-1}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="text-gray-300 transition-colors duration-150 flex-shrink-0"
          onMouseEnter={e => e.currentTarget.style.color = "#0a3490"}
          onMouseLeave={e => e.currentTarget.style.color = ""}>
          <IcoOlho aberto={visivel} />
        </button>
      </div>
      {temErro && (
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 pl-1">
          <IcoInfo size={12} /> {erro}
        </p>
      )}
    </div>
  );
}

function IndicadorForca({ senha }) {
  const pontos = REGRAS_SENHA.filter((r) => r.validar(senha)).length;
  const cores = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];
  const labels = ["", "Fraca", "Regular", "Boa", "Forte"];
  const corTexto = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-600"];

  if (!senha) return null;

  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1,2,3,4].map((i) => (
            <div key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${senha && i <= pontos ? cores[pontos] : "bg-gray-200"}`}
            />
          ))}
        </div>
        {senha && labels[pontos] && (
          <span className={`text-[11px] font-bold ${corTexto[pontos]}`}>{labels[pontos]}</span>
        )}
      </div>
      {senha && <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {REGRAS_SENHA.map((r) => {
          const ok = r.validar(senha);
          return (
            <div key={r.id} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${ok ? "bg-emerald-500" : "bg-gray-200"}`}>
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                  {ok
                    ? <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    : <line x1="3" y1="3" x2="7" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  }
                </svg>
              </span>
              <span className={`text-[11px] font-medium transition-colors duration-200 ${ok ? "text-emerald-700" : "text-gray-400"}`}>
                {r.label}
              </span>
            </div>
          );
        })}
      </div>}
    </div>
  );
}

export default function ModalAlterarSenha({ aoConfirmar, aoFechar }) {
  const [senhaAtual,       setSenhaAtual]       = useState("");
  const [novaSenha,        setNovaSenha]        = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [erroAtual,       setErroAtual]       = useState("");
  const [erroNova,        setErroNova]        = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");

  const [visivelAtual,       setVisivelAtual]       = useState(false);
  const [visivelNova,        setVisivelNova]        = useState(false);
  const [visivelConfirmacao, setVisivelConfirmacao] = useState(false);

  const senhaForte    = REGRAS_SENHA.every((r) => r.validar(novaSenha));
  const confirmacaoOk = novaSenha === confirmacaoSenha && confirmacaoSenha.length > 0;
  const podeSalvar    = senhaAtual.trim() && senhaForte && confirmacaoOk;
  const temPendencia  = !podeSalvar;

  useEffect(() => {
    const fn = (e) => {
      if (e.key !== "Escape") return;
      if (temPendencia) { e.preventDefault(); e.stopPropagation(); }
      else aoFechar?.();
    };
    document.addEventListener("keydown", fn, true);
    return () => document.removeEventListener("keydown", fn, true);
  }, [temPendencia, aoFechar]);

  const dispararErros = useCallback(() => {
    setErroAtual(validarSenhaAtual(senhaAtual));
    setErroNova(validarNovaSenha(novaSenha));
    setErroConfirmacao(validarConfirmacao(novaSenha, confirmacaoSenha));
  }, [senhaAtual, novaSenha, confirmacaoSenha]);

  const tentarFechar = () => {
    aoFechar?.();
  };

  const handleSubmit = () => {
    dispararErros();
    if (!podeSalvar) return;
    aoConfirmar?.({ senhaAtual, novaSenha });
  };

  const handleOverlay = (e) => {
    if (e.target !== e.currentTarget) return;
    aoFechar?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(148,163,184,0.45)", backdropFilter: "blur(6px)" }}
      onClick={handleOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div
        className="w-[420px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden flex flex-col shadow-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(10,52,144,0.08)" }}
          >
            <IcoCadeado size={17} style={{ color: "#0a3490" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="modal-titulo" className="text-[16px] font-black leading-tight m-0" style={{ color: "#0a3490" }}>
              Alterar Senha
            </h2>
            <p className="text-[12px] font-medium mt-0.5 mb-0 leading-snug text-gray-400">
              Preencha todos os campos para atualizar sua senha.
            </p>
          </div>
          <button
            type="button"
            onClick={tentarFechar}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <CampoSenha
            id="senha-atual"
            label="Senha atual"
            valor={senhaAtual}
            onChange={setSenhaAtual}
            onBlur={() => setErroAtual(validarSenhaAtual(senhaAtual))}
            erro={erroAtual}
            visivel={visivelAtual}
            onToggleVisivel={() => setVisivelAtual((p) => !p)}
            placeholder="Digite sua senha atual"
          />

          <CampoSenha
            id="nova-senha"
            label="Nova senha"
            valor={novaSenha}
            onChange={setNovaSenha}
            onBlur={() => setErroNova(validarNovaSenha(novaSenha))}
            erro={erroNova}
            visivel={visivelNova}
            onToggleVisivel={() => setVisivelNova((p) => !p)}
            placeholder="Crie uma nova senha forte"
          />

          <CampoSenha
            id="confirmacao-senha"
            label="Confirmação da nova senha"
            valor={confirmacaoSenha}
            onChange={setConfirmacaoSenha}
            onBlur={() => setErroConfirmacao(validarConfirmacao(novaSenha, confirmacaoSenha))}
            erro={erroConfirmacao}
            visivel={visivelConfirmacao}
            onToggleVisivel={() => setVisivelConfirmacao((p) => !p)}
            placeholder="Repita a nova senha"
          />


          <IndicadorForca senha={novaSenha} />

          {/* Botão salvar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!podeSalvar}
            className="w-full h-9 rounded-xl text-[13px] font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-1"
            style={{
              background: podeSalvar ? "#0a3490" : "#94a3b8",
              cursor: podeSalvar ? "pointer" : "not-allowed",
              boxShadow: podeSalvar ? "0 4px 14px rgba(10,52,144,0.28)" : "none",
            }}
          >
            <IcoCadeado size={13} />
            Salvar senha
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}