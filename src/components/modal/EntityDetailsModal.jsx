import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDarkMode } from "../../hooks/useDarkMode";
import "../catalog/CatalogPage.css";
import "./EntityDetails.css";

export default function EntityDetailsModal({ entity, onClose, title, open = true, onSaveContact, onDeleteContact, onSaveCompany, onLookupCEP, onSaved }) {
  const { darkMode } = useDarkMode();
  const [drafts, setDrafts] = useState({});
  const [company, setCompany] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const sequence = useRef(0);
  const actionInProgress = useRef(false);
  const confirmationRef = useRef(null);
  const entityId = entity?.idCliente ?? entity?.idDistribuidor ?? entity?.id;

  useEffect(() => {
    setDrafts({});
    setCompany(null);
    setContactToDelete(null);
    setCepError("");
  }, [open, entityId]);

  const cep = company?.cep;
  const originalCep = entity?.cep;
  useEffect(() => {
    if (cep == null || onlyDigits(cep) === onlyDigits(originalCep)) {
      setCepLoading(false);
      setCepError("");
      return;
    }
    let cancelled = false;
    setCepError("");
    if (onlyDigits(cep).length !== 8) {
      setCepLoading(false);
      setCepError("Informe um CEP com 8 dígitos.");
      return;
    }
    setCepLoading(true);
    const timer = setTimeout(async () => {
      try {
        const address = await onLookupCEP(onlyDigits(cep));
        if (!cancelled) setCompany((previous) => ({ ...previous, logradouro: address.endereco, cidade: address.cidade, uf: address.uf }));
      } catch {
        if (!cancelled) setCepError("Não foi possível consultar o CEP. Confira o número e tente novamente.");
      } finally {
        if (!cancelled) setCepLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cep, originalCep, onLookupCEP]);

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

  useEffect(() => {
    if (!contactToDelete) return;
    const previousFocus = document.activeElement;
    confirmationRef.current?.querySelector(".catalog-cancel")?.focus();
    return () => previousFocus?.isConnected && previousFocus.focus();
  }, [contactToDelete]);

  if (!open || !entity) return null;

  const contacts = Array.isArray(entity.contatos) ? entity.contatos : [];
  const hasChanges = company !== null || Object.keys(drafts).length > 0;
  const shownCompany = company ?? entity;
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
    if (actionInProgress.current || !hasChanges || cepLoading || cepError || contactToDelete) return;
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
    return <InfoItem label={label} value={shownCompany[name]} {...options}>
      {company && <input className="modal-contact-input" aria-label={label}
        value={company[name] ?? ""} disabled={busy} required={name !== "complemento"}
        type={name === "telefone" ? "tel" : "text"}
        pattern={name === "telefone" ? "\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}" : name === "cep" ? "[0-9]{5}-[0-9]{3}" : name === "complemento" ? undefined : ".*\\S.*"}
        onChange={(event) => {
          let value = event.target.value;
          if (name === "telefone") value = maskPhone(value);
          if (name === "cep") value = maskCEP(value);
          setCompany((previous) => ({ ...previous, [name]: value,
            ...(name === "cep" ? (onlyDigits(value) === onlyDigits(originalCep)
              ? { logradouro: entity.logradouro, cidade: entity.cidade, uf: entity.uf }
              : { logradouro: "", cidade: "", uf: "" }) : {}),
          }));
        }} />}
    </InfoItem>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy && !contactToDelete) onClose(); }}
      role="dialog" aria-modal="true" aria-label="Detalhes do cadastro">
      <form onSubmit={save} inert={contactToDelete ? "" : undefined}
        className={`w-full max-w-[96vw] max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border flex flex-col modal-frozen-theme ${darkMode ? "modal-frozen-dark" : "modal-frozen-light"}`}
        style={{ animation: "modalEntrar 0.2s ease-out" }}>
        <div className="flex items-center justify-between px-8 py-4 rounded-t-2xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="text-xs font-extrabold text-white">{entity.nomeFantasia?.slice(0, 2).toUpperCase() || "ID"}</span>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">{title || "Detalhes do Cadastro"}</p>
              <p className="text-sm font-extrabold text-white">{entity.razaoSocial}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} title="Fechar detalhes" aria-label="Fechar detalhes"
            className="text-2xl leading-none text-white opacity-85 hover:opacity-100">×</button>
        </div>

        <div className="modal-detalhe-scroll overflow-y-auto flex-1 min-h-0 p-8 space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="modal-frozen-section rounded-xl border p-5">
              <SectionTitle title="Informações da Empresa" color="bg-blue-600">
                {onSaveCompany && <IconButton icon="edit" title="Editar informações do cliente" disabled={busy || !!company}
                  onClick={() => setCompany({ ...entity, telefone: maskPhone(entity.telefone), cep: maskCEP(entity.cep) })} />}
              </SectionTitle>
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
                <InfoItem label="Razão Social" value={entity.razaoSocial} colSpan={2} />
                {companyField("Nome Fantasia", "nomeFantasia")}
                <InfoItem label="CNPJ" value={formatCNPJ(entity.cnpj)} />
                <InfoItem label="Inscrição Estadual" value={entity.inscricaoEstadual} />
                {companyField("Telefone", "telefone", { value: maskPhone(shownCompany.telefone) })}
                {companyField("CEP", "cep", { value: maskCEP(shownCompany.cep) })}
                <InfoItem label="Endereço" value={shownCompany.logradouro} colSpan={2} />
                {companyField("Número", "numero")}
                {companyField("Complemento", "complemento")}
                <InfoItem label="Cidade" value={shownCompany.cidade} />
                <InfoItem label="UF" value={shownCompany.uf} />
              </div>
              {cepLoading && <p className="mt-3 text-sm text-slate-500" role="status">Consultando CEP...</p>}
              {cepError && <p className="mt-3 text-sm text-red-500" role="alert">{cepError}</p>}
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
                      {draft ? <input className="modal-contact-input modal-contact-name min-w-0 flex-1" aria-label="Nome do contato"
                        placeholder="Nome do contato" value={draft.nome} required pattern=".*\S.*" autoFocus disabled={busy}
                        onChange={(event) => update("nome", event.target.value)} />
                        : <p className="text-sm font-semibold text-slate-800 flex-1 break-words min-w-0">{contact.nome || "Contato sem nome"}</p>}
                      {onSaveContact && <div className="flex gap-1 shrink-0">
                        <IconButton icon="edit" title="Editar contato" disabled={busy || !!draft}
                          onClick={() => setDrafts((previous) => ({ ...previous, [key]: { ...contact, telefone: maskPhone(contact.telefone) } }))} />
                        <IconButton icon="delete" title="Excluir contato" disabled={busy}
                          onClick={() => setContactToDelete({ key, contact: displayed })} />
                      </div>}
                    </div>
                    {draft ? <div className="mt-2 space-y-3">
                      <label className="block text-sm text-slate-600"><span className="font-semibold">E-mail</span>
                        <input className="modal-contact-input" type="email" placeholder="contato@empresa.com" required disabled={busy}
                          value={draft.email ?? ""} onChange={(event) => update("email", event.target.value)} />
                      </label>
                      <label className="block text-sm text-slate-600"><span className="font-semibold">Telefone</span>
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
          {hasChanges && <button data-ui-action type="submit" disabled={busy || cepLoading || !!cepError} className={buttonClass}>{busy ? "Salvando..." : "Salvar"}</button>}
          <button data-ui-action type="button" onClick={onClose} disabled={busy} className={buttonClass}>Fechar</button>
        </div>
      </form>

      {contactToDelete && <div className="produto-modal-backdrop"
        onClick={(event) => { if (event.target === event.currentTarget && !busy) setContactToDelete(null); }}>
        <div ref={confirmationRef} role="alertdialog" aria-modal="true" aria-labelledby="contact-delete-title" aria-describedby="contact-delete-description"
          className="produto-modal-card"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const buttons = [...confirmationRef.current.querySelectorAll("button:not(:disabled)")];
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
              event.preventDefault();
              (event.shiftKey ? last : first)?.focus();
            }
          }}>
          <div className="produto-modal-header">
            <div>
              <p className="produto-eyebrow">Excluir contato</p>
              <h2 id="contact-delete-title">Tem certeza?</h2>
            </div>
            <button type="button" className="produto-close-btn" title="Fechar confirmação" aria-label="Fechar confirmação"
              disabled={busy} onClick={() => setContactToDelete(null)}>×</button>
          </div>
          <p id="contact-delete-description" className="produto-confirm-text">Deseja realmente excluir o contato <strong>{contactToDelete.contact.nome || "sem nome"}</strong>?</p>
          <div className="produto-confirm-actions">
            <button data-ui-action type="button" className="catalog-cancel" disabled={busy} onClick={() => setContactToDelete(null)}>Não</button>
            <button data-ui-action type="button" className="catalog-submit catalog-submit--danger" disabled={busy} onClick={confirmDelete}>{busy ? "Excluindo..." : "Sim"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

function IconButton({ icon, title, ...props }) {
  return <button type="button" className={`modal-contact-add ${icon === "delete" ? "modal-contact-delete" : ""}`} title={title} aria-label={title} {...props}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon === "add" ? <path d="M12 5v14M5 12h14" /> : icon === "edit" ? <path d="m16 3 5 5L8 21H3v-5L16 3Zm-3 3 5 5" /> : <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>}
    </svg>
  </button>;
}

function SectionTitle({ title, color, children }) {
  return <div className="flex items-center gap-2 mb-3">
    <div className={`w-1 h-4 rounded-full ${color}`} />
    <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-900">{title}</span>
    {children}
  </div>;
}

function InfoItem({ label, value, colSpan = 1, children }) {
  return <div className={`grid gap-1 ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
    <span className="text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">{label}</span>
    {children || <span className="text-sm font-medium text-slate-900">{value || "-"}</span>}
  </div>;
}

function onlyDigits(value) { return String(value ?? "").replace(/\D/g, ""); }

function formatCNPJ(value) {
  const raw = onlyDigits(value).slice(0, 14);
  if (raw.length !== 14) return value || "-";
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
}

function maskCEP(value) {
  const raw = onlyDigits(value).slice(0, 8);
  return raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
}

function maskPhone(value) {
  const raw = onlyDigits(value).slice(0, 11);
  if (raw.length < 3) return raw;
  if (raw.length < 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
  const split = raw.length > 10 ? 7 : 6;
  return `(${raw.slice(0, 2)}) ${raw.slice(2, split)}-${raw.slice(split)}`;
}
