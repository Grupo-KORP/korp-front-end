import React from "react";

export default function EntityDetailsModal({ entity, onClose, title }) {
  if (!entity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[96vw] max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between px-8 py-4 rounded-t-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
          <div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-slate-200">{title || "Detalhes"}</p>
            <p className="text-sm font-extrabold">{entity.razaoSocial}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="text-2xl leading-none opacity-85 hover:opacity-100"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-8 space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4">Informações da Empresa</h3>
              <div className="grid gap-3">
                <InfoItem label="Razão Social" value={entity.razaoSocial} />
                <InfoItem label="Nome Fantasia" value={entity.nomeFantasia} />
                <InfoItem label="CNPJ" value={entity.cnpj} />
                <InfoItem label="Inscrição Estadual" value={entity.inscricaoEstadual} />
                <InfoItem label="Telefone" value={entity.telefone} />
                <InfoItem label="CEP" value={entity.cep} />
                <InfoItem label="Endereço" value={entity.endereco} />
                <InfoItem label="Número" value={entity.numero} />
                <InfoItem label="Complemento" value={entity.complemento || "-"} />
                <InfoItem label="Cidade" value={entity.cidade} />
                <InfoItem label="UF" value={entity.uf} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-4">Contatos Cadastrados</h3>
              <div className="space-y-3">
                {Array.isArray(entity.contatos) && entity.contatos.length > 0 ? (
                  entity.contatos.map((contact, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{contact.nome || "Contato sem nome"}</p>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div><span className="font-semibold">E-mail:</span> {contact.email || "-"}</div>
                        <div><span className="font-semibold">Telefone:</span> {contact.telefone || "-"}</div>
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
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="grid gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{value || "-"}</span>
    </div>
  );
}
