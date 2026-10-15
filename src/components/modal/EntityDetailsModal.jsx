import { maskCEP, maskPhone } from "../../utils/inputMasks";
import DeleteConfirmation from "./DeleteConfirmation";
import RequiredMark from "../ui/RequiredMark";
import IconActionButton from "../ui/IconActionButton";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDarkMode } from "../../hooks/useDarkMode";
import "../catalog/CatalogPage.css";
import "./EntityDetails.css";

export default function EntityDetailsModal({ entity, onClose, title, open = true, onSaveContact, onDeleteContact, onSaveCompany, onSaved }) {
  const { darkMode } = useDarkMode();
  const [drafts, setDrafts] = useState({});
  const [company, setCompany] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const actionInProgress = useRef(false);

  const entityId = entity?.idCliente ?? entity?.idDistribuidor ?? entity?.id;

  useEffect(() => {
    setDrafts({});
    setCompany(null);
    setContactToDelete(null);
  }, [open, entityId]);

  useEffect(() => {
    if (!open || !entity) return;
    function handleKeyDown(event) {
      if (event.key === "Escape" && !actionInProgress.current) {
        if (contactToDelete) setContactToDelete(null);
        else onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, entity, onClose, contactToDelete]);



  if (!open || !entity) return null;

  const contacts = Array.isArray(entity.contatos) ? entity.contatos : [];
  const hasChanges = company !== null || Object.keys(drafts).length > 0;
  const shownCompany = { ...entity, ...company };
  const cards = [
    ...contacts.map((contact) => ({ key: `contact-${contact.idContato}`, contact })),
    ...Object.entries(drafts).filter(([, contact]) => contact.idContato == null).map(([key, contact]) => ({ key, contact })),
  ];
  const buttonClass = "px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";

  function removeDraft(key) {
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  async function save(event) {
    event.preventDefault();
    if (actionInProgress.current || !hasChanges || contactToDelete) return;
    actionInProgress.current = true;
    setBusy(true);
    try {
      if (company) {
        await onSaveCompany(company);
        setCompany(null);
      }
      for (const [key, contact] of Object.entries(drafts)) {
        await onSaveContact(contact);
        removeDraft(key);
      }
      toast.success("Alterações salvas com sucesso!");
    } catch (error) {
      toast.error(error?.message || "Erro ao salvar. Tente novamente.");
    } finally {
      await onSaved?.();
      actionInProgress.current = false;
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (actionInProgress.current || !contactToDelete) return;
    actionInProgress.current = true;
    setBusy(true);
    try {
      if (contactToDelete.contact.idContato != null) await onDeleteContact(contactToDelete.contact);
      removeDraft(contactToDelete.key);
      setContactToDelete(null);
      toast.success("Contato excluído.");
    } catch (error) {
      toast.error(error?.message || "Erro ao excluir contato. Tente novamente.");
    } finally {
      actionInProgress.current = false;
      setBusy(false);
    }
  }

  function companyField(label, name, options = {}) {
    return <InfoItem label={label} value={shownCompany[name]} {...options} required={Boolean(company)}>
      {company && <input className="modal-contact-input" aria-label={label}
        value={company[name] ?? ""} disabled={busy} required
        type={name === "telefone" ? "tel" : "text"}
        pattern={name === "telefone" ? "\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}" : ".*\\S.*"}
        onChange={(event) => {
          let value = event.target.value;
          if (name === "telefone") value = maskPhone(value);
          setCompany((previous) => ({ ...previous, [name]: value }));
        }} />}
    </InfoItem>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy && !contactToDelete) onClose(); }}
      role="dialog" aria-modal="true" aria-label="Detalhes do cadastro">
      <form onSubmit={save} inert={contactToDelete ? "" : undefined}
        className={`registration-details details-panel max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border flex flex-col modal-frozen-theme ${darkMode ? "modal-frozen-dark" : "modal-frozen-light"}`}
        style={{ animation: "modalEntrar 0.2s ease-out" }}>
        <div className="details-header flex justify-between rounded-t-2xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}>
          <div className="details-identity">
            <div className="details-code rounded-xl bg-white/15 flex items-center justify-center">
              <span className="text-xs font-extrabold text-white">{entity.nomeFantasia?.slice(0, 2).toUpperCase() || "ID"}</span>
            </div>
            <div className="details-heading">
              <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">{title || "Detalhes do Cadastro"}</p>
              <p className="text-sm font-extrabold text-white">{entity.razaoSocial}</p>
            </div>
          </div>
          <IconActionButton icon="close" contrast onClick={onClose} disabled={busy} title="Fechar detalhes" />
        </div>

        <div className="details-body modal-detalhe-scroll overflow-y-auto flex-1 min-h-0 space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="modal-frozen-section rounded-xl border p-5">
              <SectionTitle title="Informações da Empresa" color="bg-blue-600">
                {onSaveCompany && <IconButton icon="edit" title="Editar nome fantasia e telefone" disabled={busy || !!company}
                  onClick={() => setCompany({ nomeFantasia: entity.nomeFantasia ?? "", telefone: maskPhone(entity.telefone) })} />}
              </SectionTitle>
              <div className="company-details-group grid sm:grid-cols-2">
                <InfoItem label="Razão Social" value={entity.razaoSocial} colSpan={2} />
                <InfoItem label="CNPJ" value={formatCNPJ(entity.cnpj)} />
                <InfoItem label="Inscrição Estadual" value={entity.inscricaoEstadual} />
              </div>
              <div className="company-details-group grid sm:grid-cols-2">
                {company && <p className="company-edit-hint sm:col-span-2 text-slate-500">Você pode alterar o nome fantasia e o telefone.</p>}
                {companyField("Nome Fantasia", "nomeFantasia")}
                {companyField("Telefone", "telefone", { value: maskPhone(shownCompany.telefone) })}
              </div>
              <div className="company-details-group grid sm:grid-cols-2">
                <InfoItem label="Endereço" value={entity.logradouro} colSpan={2} />
                <InfoItem label="Número" value={entity.numero} />
                <InfoItem label="Complemento" value={entity.complemento} />
                <InfoItem label="Cidade" value={entity.cidade} />
                <InfoItem label="UF" value={entity.uf} />
                <InfoItem label="CEP" value={maskCEP(entity.cep)} colSpan={2} />
              </div>
            </div>

            <div className="modal-frozen-section rounded-xl border p-5">
              <SectionTitle title="Contatos Cadastrados" color="bg-indigo-500">
                {onSaveContact && <IconButton icon="add" title="adicionar contato" disabled={busy}
                  onClick={() => {
                    const key = `new-${++sequence.current}`;
                    setDrafts((previous) => ({ ...previous, [key]: { nome: "", email: "", telefone: "" } }));
                  }} />}
              </SectionTitle>
              <div className="space-y-3">
                {!cards.length && <p className="text-sm text-slate-500">Nenhum contato cadastrado.</p>}
                {cards.map(({ key, contact }) => {
                  const draft = drafts[key];
                  const displayed = draft ?? contact;
                  const update = (field, value) => setDrafts((previous) => ({ ...previous, [key]: { ...previous[key], [field]: value } }));
                  return <div key={key} className="modal-frozen-contact rounded-xl border p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      {draft ? <label className="min-w-0 flex-1 text-sm text-slate-600">
                        <span className="font-semibold">Nome do contato<RequiredMark /></span>
                        <input className="modal-contact-input modal-contact-name" aria-label="Nome do contato"
                        placeholder="Nome do contato" value={draft.nome} required pattern=".*\S.*" autoFocus disabled={busy}
                        onChange={(event) => update("nome", event.target.value)} /></label>
                        : <p className="text-sm font-semibold text-slate-800 flex-1 break-words min-w-0">{contact.nome || "Contato sem nome"}</p>}
                      {onSaveContact && <div className="flex gap-1 shrink-0">
                        <IconButton icon="edit" title="Editar contato" disabled={busy || !!draft}
                          onClick={() => setDrafts((previous) => ({ ...previous, [key]: { ...contact, telefone: maskPhone(contact.telefone) } }))} />
                        <IconButton icon="delete" title="Excluir contato" disabled={busy}
                          onClick={() => setContactToDelete({ key, contact: displayed })} />
                      </div>}
                    </div>
                    {draft ? <div className="mt-2 space-y-3">
                      <label className="block text-sm text-slate-600"><span className="font-semibold">E-mail<RequiredMark /></span>
                        <input className="modal-contact-input" type="email" placeholder="contato@empresa.com" required disabled={busy}
                          value={draft.email ?? ""} onChange={(event) => update("email", event.target.value)} />
                      </label>
                      <label className="block text-sm text-slate-600"><span className="font-semibold">Telefone<RequiredMark /></span>
                        <input className="modal-contact-input" type="tel" placeholder="(00) 00000-0000" required disabled={busy}
                          pattern="\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}" title="Informe um telefone com DDD e 10 ou 11 dígitos."
                          value={draft.telefone ?? ""} onChange={(event) => update("telefone", maskPhone(event.target.value))} />
                      </label>
                    </div> : <div className="mt-2 text-sm text-slate-600 space-y-1 break-words">
                      <div><span className="font-semibold">E-mail:</span> {contact.email || "-"}</div>
                      <div><span className="font-semibold">Telefone:</span> {maskPhone(contact.telefone) || "-"}</div>
                    </div>}
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-frozen-footer flex justify-end gap-2 px-8 py-4 border-t flex-shrink-0">
          {hasChanges && <button data-ui-action type="submit" disabled={busy} className={`modal-save-button ${buttonClass}`}>{busy ? "Salvando..." : "Salvar"}</button>}
          <button data-ui-action type="button" onClick={onClose} disabled={busy} className="modal-close-button">Fechar</button>
        </div>
      </form>

      {contactToDelete && <DeleteConfirmation name={contactToDelete.contact.nome || 'Contato sem nome'} entityLabel="contato" busy={busy} onCancel={() => setContactToDelete(null)} onConfirm={confirmDelete} />}
    </div>
  );
}

function IconButton({ icon, title, ...props }) {
  return <IconActionButton icon={icon} title={title} className="modal-contact-action" {...props} />;
}

function SectionTitle({ title, color, children }) {
  return <div className="flex items-center gap-2 mb-3">
    <div className={`w-1 h-4 rounded-full ${color}`} />
    <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-900">{title}</span>
    {children}
  </div>;
}

function InfoItem({ label, value, colSpan = 1, children, required = false }) {
  return <div className={`details-field grid gap-1 ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
    <span className="text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">{label}{required && <RequiredMark />}</span>
    {children || <span className="text-sm font-medium text-slate-900">{value || "-"}</span>}
  </div>;
}

function onlyDigits(value) { return String(value ?? "").replace(/\D/g, ""); }

function formatCNPJ(value) {
  const raw = onlyDigits(value).slice(0, 14);
  if (raw.length !== 14) return value || "-";
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
}
