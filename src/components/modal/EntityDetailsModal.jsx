import { useEffect } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function EntityDetailsModal({ entity, onClose, title, open = true }) {
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!open || !entity) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, entity, onClose]);

  if (!open || !entity) return null;

  const contacts = Array.isArray(entity.contatos) ? entity.contatos : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-[96vw] max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border flex flex-col modal-frozen-theme ${
          darkMode ? "modal-frozen-dark" : "modal-frozen-light"
        }`}
        style={{ animation: "modalEntrar 0.2s ease-out" }}
      >
        <div
          className="flex items-center justify-between px-8 py-4 rounded-t-2xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="text-xs font-extrabold text-white">{entity.nomeFantasia?.slice(0, 2).toUpperCase() || "ID"}</span>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">{title || "Detalhes do Cadastro"}</p>
              <p className="text-sm font-extrabold text-white">{entity.razaoSocial}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="text-2xl leading-none text-white opacity-85 hover:opacity-100"
          >
            x
          </button>
        </div>

        <div className="modal-detalhe-scroll overflow-y-auto flex-1 min-h-0 p-8 space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="modal-frozen-section rounded-xl border p-5">
              <SectionTitle title="Informacoes da Empresa" color="bg-blue-600" />
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
                <InfoItem label="Razao Social" value={entity.razaoSocial} colSpan={2} />
                <InfoItem label="Nome Fantasia" value={entity.nomeFantasia} />
                <InfoItem label="CNPJ" value={formatCNPJ(entity.cnpj)} />
                <InfoItem label="Inscricao Estadual" value={entity.inscricaoEstadual} />
                <InfoItem label="Telefone" value={formatPhone(entity.telefone)} />
                <InfoItem label="CEP" value={formatCEP(entity.cep)} />
                <InfoItem label="Endereco" value={entity.logradouro} colSpan={2} />
                <InfoItem label="Numero" value={entity.numero} />
                <InfoItem label="Complemento" value={entity.complemento || "-"} />
                <InfoItem label="Cidade" value={entity.cidade} />
                <InfoItem label="UF" value={entity.uf} />
              </div>
            </div>

            <div className="modal-frozen-section rounded-xl border p-5">
              <SectionTitle title="Contatos Cadastrados" color="bg-indigo-500" />
              <div className="space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <div key={index} className="modal-frozen-contact rounded-xl border p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-800">{contact.nome || "Contato sem nome"}</p>
                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        <div><span className="font-semibold">E-mail:</span> {contact.email || "-"}</div>
                        <div><span className="font-semibold">Telefone:</span> {formatPhone(contact.telefone)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhum contato cadastrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-frozen-footer flex justify-end gap-2 px-8 py-4 border-t flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-blue-600 text-white hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>

        <style>{`
          @keyframes modalEntrar {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* Tema claro congelado */
          .modal-frozen-light {
            background-color: #f3f4f6;
            border-color: #d1d5db;
            color: #111827;
          }

          /* Tema escuro congelado */
          .modal-frozen-dark {
            background-color: #1f2937;
            border-color: #374151;
            color: #f3f4f6;
          }

          /* Seções com tema congelado */
          .modal-frozen-light .modal-frozen-section {
            background-color: #f9fafb;
            border-color: #e5e7eb;
            color: #111827;
          }

          .modal-frozen-dark .modal-frozen-section {
            background-color: rgba(17, 24, 39, 0.6);
            border-color: #374151;
            color: #f3f4f6;
          }

          /* Cards de contato congelados */
          .modal-frozen-light .modal-frozen-contact {
            background-color: #ffffff;
            border-color: #e5e7eb;
            color: #111827;
          }

          .modal-frozen-dark .modal-frozen-contact {
            background-color: #111827;
            border-color: #374151;
            color: #f3f4f6;
          }

          /* Footer congelado */
          .modal-frozen-light .modal-frozen-footer {
            border-color: #e5e7eb;
            background-color: #ffffff;
          }

          .modal-frozen-dark .modal-frozen-footer {
            border-color: #374151;
            background-color: #111827;
          }

          /* Textos e labels dentro do modal congelado */
          .modal-frozen-light .text-gray-900,
          .modal-frozen-light .text-slate-900,
          .modal-frozen-light .text-slate-800 {
            color: #111827;
          }

          .modal-frozen-dark .text-gray-900,
          .modal-frozen-dark .text-slate-900,
          .modal-frozen-dark .text-slate-800 {
            color: #f3f4f6;
          }

          .modal-frozen-light .text-slate-600,
          .modal-frozen-light .text-slate-500 {
            color: #4b5563;
          }

          .modal-frozen-dark .text-slate-600,
          .modal-frozen-dark .text-slate-500 {
            color: #cbd5e1;
          }

          .modal-frozen-light .text-slate-100 {
            color: #111827;
          }

          .modal-frozen-dark .text-slate-100 {
            color: #f3f4f6;
          }

          .modal-frozen-dark .text-white {
            color: #ffffff;
          }

          /* Scrollbar congelado */
          .modal-frozen-light .modal-detalhe-scroll {
            scrollbar-width: thin;
            scrollbar-color: #9ca3af #e5e7eb;
          }

          .modal-frozen-dark .modal-detalhe-scroll {
            scrollbar-width: thin;
            scrollbar-color: #6b7280 #374151;
          }

          .modal-frozen-light .modal-detalhe-scroll::-webkit-scrollbar-track {
            background: #e5e7eb;
          }

          .modal-frozen-dark .modal-detalhe-scroll::-webkit-scrollbar-track {
            background: #374151;
          }

          .modal-frozen-light .modal-detalhe-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%);
            border-color: #e5e7eb;
          }

          .modal-frozen-dark .modal-detalhe-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
            border-color: #374151;
          }

          .modal-detalhe-scroll {
            scrollbar-width: thin;
          }

          .modal-detalhe-scroll::-webkit-scrollbar {
            width: 10px;
          }

          .modal-detalhe-scroll::-webkit-scrollbar-track {
            border-radius: 0 16px 16px 0;
            margin: 14px 0;
          }

          .modal-detalhe-scroll::-webkit-scrollbar-thumb {
            border: 2px solid;
            border-radius: 999px;
            min-height: 42px;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ title, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-900">
        {title}
      </span>
    </div>
  );
}

function InfoItem({ label, value, colSpan = 1 }) {
  return (
    <div className={`grid gap-1 ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value || "-"}</span>
    </div>
  );
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCNPJ(value) {
  const raw = onlyDigits(value).slice(0, 14);
  if (raw.length !== 14) return value || "-";
  return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8,12)}-${raw.slice(12)}`;
}

function formatCEP(value) {
  const raw = onlyDigits(value).slice(0, 8);
  if (raw.length !== 8) return value || "-";
  return `${raw.slice(0,5)}-${raw.slice(5)}`;
}

function formatPhone(value) {
  const raw = onlyDigits(value).slice(0, 11);
  if (raw.length < 10) return value || "-";
  if (raw.length === 10) return `(${raw.slice(0,2)}) ${raw.slice(2,6)}-${raw.slice(6)}`;
  return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`;
}
