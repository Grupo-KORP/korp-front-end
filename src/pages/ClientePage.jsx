import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";
import EntityDetailsModal from "../components/modal/EntityDetailsModal";

// ─── Máscaras ─────────────────────────────────────────────────────────────────
function maskCNPJ(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 14);
  if (raw.length > 12) return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8,12)}-${raw.slice(12)}`;
  if (raw.length > 8)  return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8)}`;
  if (raw.length > 5)  return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5)}`;
  if (raw.length > 2)  return `${raw.slice(0,2)}.${raw.slice(2)}`;
  return raw;
}

function maskCEP(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 8);
  if (raw.length > 5) return `${raw.slice(0,5)}-${raw.slice(5)}`;
  return raw;
}

function maskPhone(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 11);
  if (raw.length > 7) return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`;
  if (raw.length > 2) return `(${raw.slice(0,2)}) ${raw.slice(2)}`;
  return raw;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────
const emptyForm = {
  razaoSocial: "", nomeFantasia: "", cnpj: "", inscEst: "",
  fone: "", cep: "", endereco: "", numero: "", complemento: "",
  cidade: "", uf: "SP",
};

const emptyContact = { nome: "", email: "", telefone: "" };

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

async function fetchEmpresa(cnpjRaw) {
  await new Promise((r) => setTimeout(r, 600));
  return { razaoSocial: "EMPRESA MOCKADA LTDA", inscEst: "110.042.490.114", nomeFantasia: "Tech Solutions" };
}

async function fetchCEP(cepRaw) {
  const res = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}

// ─── Helper: mapeia cliente da API para row da tabela ─────────────────────────
function mapClienteToRow(c, onEdit, onDelete, onView) {
  return {
    id:       c.id,
    badge:    c.nomeFantasia?.slice(0, 2).toUpperCase() ?? "CL",
    title:    c.razaoSocial,
    subtitle: c.nomeFantasia || "",
    cells: [
      { value: c.contatos?.length ?? 0, className: "catalog-centered" },
      { value: c.uf || "-", className: "catalog-centered" },
      { value: c.comprasRealizadas ?? 0, className: "catalog-centered" },
    ],
    onEdit:   () => onEdit(c),
    onDelete: () => onDelete(c.id),
    onView:   () => onView(c),
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ClientePage() {
  const [form,          setForm]          = useState(emptyForm);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [loadingRows,   setLoadingRows]   = useState(false);
  const [rows,          setRows]          = useState([]);
  const [editingId,     setEditingId]     = useState(null);
  const [search,        setSearch]        = useState("");
  const [isContactStep, setIsContactStep] = useState(false);
  const [contacts,      setContacts]      = useState([ { ...emptyContact } ]);
  const [contactErrors, setContactErrors] = useState([ {} ]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP,  setLoadingCEP]  = useState(false);

  // ── Fetch lista ──
  const fetchClientes = useCallback(async (busca = "") => {
    setLoadingRows(true);
    try {
      const { data } = await api.get("/cliente", { params: busca ? { busca } : {} });
      setRows(data.map((c) => mapClienteToRow(c, handleEdit, handleDelete, handleView)));
    } catch {
      toast.error("Erro ao carregar clientes.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // ── Mudança de campo ──
  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;

    const updateField = (n, v) => {
      setForm((prev) => ({ ...prev, [n]: v }));
      setErrors((prev) => { const next = { ...prev }; delete next[n]; return next; });
    };

    if (name === "cnpj") {
      const masked = maskCNPJ(value);
      updateField("cnpj", masked);
      if (masked.replace(/\D/g, "").length === 14) {
        setLoadingCNPJ(true);
        try {
          const empresa = await fetchEmpresa(masked.replace(/\D/g, ""));
          setForm((prev) => ({ ...prev, razaoSocial: empresa.razaoSocial, inscEst: empresa.inscEst, nomeFantasia: empresa.nomeFantasia || "" }));
        } catch { toast.error("Não foi possível consultar o CNPJ."); }
        finally { setLoadingCNPJ(false); }
      } else {
        setForm((prev) => ({ ...prev, razaoSocial: "", inscEst: "", nomeFantasia: "" }));
      }
      return;
    }

    if (name === "cep") {
      const masked = maskCEP(value);
      updateField("cep", masked);
      if (masked.replace(/\D/g, "").length === 8) {
        setLoadingCEP(true);
        try {
          const end = await fetchCEP(masked.replace(/\D/g, ""));
          setForm((prev) => ({ ...prev, ...end }));
        } catch { toast.error("CEP não encontrado."); }
        finally { setLoadingCEP(false); }
      } else {
        setForm((prev) => ({ ...prev, endereco: "", cidade: "", uf: "SP" }));
      }
      return;
    }

    if (name === "fone") { updateField("fone", maskPhone(value)); return; }
    updateField(name, value);
  }, []);

  function handleContactChange(index, name, value) {
    setContacts((prev) => prev.map((item, idx) => idx === index ? { ...item, [name]: name === "telefone" ? maskPhone(value) : value } : item));
    setContactErrors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index] };
      delete next[index][name];
      return next;
    });
  }

  function addContact() {
    setContacts((prev) => [...prev, { ...emptyContact }]);
    setContactErrors((prev) => [...prev, {}]);
  }

  function handleView(c) {
    setSelectedClient(c);
    setShowDetailsModal(true);
  }

  // ── Editar ──
  function handleEdit(c) {
    setEditingId(c.id);
    setForm({
      razaoSocial:  c.razaoSocial  ?? "",
      nomeFantasia: c.nomeFantasia ?? "",
      cnpj:         maskCNPJ(c.cnpj ?? ""),
      inscEst:      c.inscricaoEstadual ?? "",
      fone:         maskPhone(c.telefone ?? ""),
      cep:          maskCEP(c.cep ?? ""),
      endereco:     c.endereco     ?? "",
      numero:       c.numero       ?? "",
      complemento:  c.complemento  ?? "",
      cidade:       c.cidade       ?? "",
      uf:           c.uf           ?? "SP",
    });
    setContacts(c.contatos && c.contatos.length > 0 ? c.contatos.map((item) => ({
      nome: item.nome || "",
      email: item.email || "",
      telefone: maskPhone(item.telefone || ""),
    })) : [{ ...emptyContact }]);
    setContactErrors([{ }]);
    setIsContactStep(false);
    setErrors({});
  }

  // ── Cancelar edição ──
  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setContacts([{ ...emptyContact }]);
    setContactErrors([{}]);
    setIsContactStep(false);
    setErrors({});
  }

  // ── Deletar ──
  async function handleDelete(id) {
    setLoadingRows(true);
    try {
      await api.delete(`/cliente/${id}`);
      toast.success("Cliente removido com sucesso!");
      await fetchClientes(search);
    } catch (err) {
      if (err?.status === 404) toast.error("Cliente não encontrado.");
      else toast.error("Erro ao remover cliente. Tente novamente.");
    } finally {
      setLoadingRows(false);
    }
  }

  // ── Validação ──
  function validateCompany() {
    const errs = {};
    if (!form.razaoSocial.trim())                          errs.razaoSocial  = "Razão social obrigatória.";
    if (!form.nomeFantasia.trim())                         errs.nomeFantasia = "Nome fantasia obrigatório.";
    if (form.cnpj.replace(/\D/g, "").length < 14)       errs.cnpj         = "CNPJ inválido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10) errs.fone   = "Telefone inválido.";
    if (form.cep.replace(/\D/g, "").length < 8)          errs.cep          = "CEP inválido.";
    if (!form.numero.trim())                               errs.numero       = "Número obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateContacts() {
    const errorsByContact = contacts.map((contact) => {
      const err = {};
      if (!contact.nome.trim()) err.nome = "Nome do contato obrigatório.";
      if (!contact.email || !contact.email.includes("@")) err.email = "E-mail inválido.";
      if (!contact.telefone || contact.telefone.replace(/\D/g, "").length < 10) err.telefone = "Telefone inválido.";
      return err;
    });
    const hasAny = errorsByContact.some((item) => Object.keys(item).length > 0);
    setContactErrors(errorsByContact);
    return !hasAny && contacts.length > 0;
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!isContactStep) {
      if (!validateCompany()) return;
      setIsContactStep(true);
      return;
    }

    if (!validateContacts()) {
      if (contacts.length === 0) toast.error("É necessário cadastrar pelo menos um contato.");
      return;
    }

    const payload = {
      razaoSocial:       form.razaoSocial,
      nomeFantasia:      form.nomeFantasia,
      cnpj:              form.cnpj.replace(/\D/g, ""),
      inscricaoEstadual: form.inscEst,
      telefone:          form.fone.replace(/\D/g, ""),
      cep:               form.cep.replace(/\D/g, ""),
      endereco:          form.endereco,
      numero:            form.numero,
      complemento:       form.complemento,
      cidade:            form.cidade,
      uf:                form.uf,
      contatos:          contacts.map((contact) => ({
        nome: contact.nome,
        email: contact.email,
        telefone: contact.telefone.replace(/\D/g, ""),
      })),
      contato: contacts[0]?.nome || "",
      email:   contacts[0]?.email || "",
    };

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/cliente/${editingId}`, payload);
        toast.success("Cliente atualizado com sucesso!");
        setEditingId(null);
      } else {
        await api.post("/cliente", payload);
        toast.success("Cliente cadastrado com sucesso!");
      }
      setForm(emptyForm);
      setContacts([{ ...emptyContact }]);
      setContactErrors([{}]);
      setIsContactStep(false);
      setErrors({});
      await fetchClientes(search);
    } catch (err) {
      if (err?.status === 409)      toast.error(err.message);
      else if (err?.status === 404) toast.error("Cliente não encontrado.");
      else if (err?.status === 400) toast.error(err.message ?? "Dados inválidos.");
      else toast.error(editingId ? "Erro ao atualizar cliente." : "Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Search ──
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    fetchClientes(val);
  }

  // ── Fields ──
  const fields = [
    { name: "cnpj",        label: "CNPJ",          pair: "start", placeholder: "00.000.000/0000-00", value: form.cnpj,        loading: loadingCNPJ, error: errors.cnpj },
    { name: "inscEst",     label: "Insc. Est.",     pair: "end",   placeholder: "110.042.490.114",    value: form.inscEst,     loading: loadingCNPJ },
    { name: "razaoSocial", label: "Razão Social",   placeholder: "Ex: Tech Solutions Ltda",          value: form.razaoSocial, readOnly: true, loading: loadingCNPJ, error: errors.razaoSocial },
    { name: "nomeFantasia",label: "Nome Fantasia",  placeholder: "Ex: Tech Solutions",               value: form.nomeFantasia,loading: loadingCNPJ, error: errors.nomeFantasia },
    { name: "fone",        label: "Fone",           pair: "start", placeholder: "(00) 0000-0000",     value: form.fone,        error: errors.fone },
    { name: "cep",         label: "CEP",            pair: "end",   placeholder: "00000-000",          value: form.cep,         loading: loadingCEP, error: errors.cep },
    { name: "endereco",    label: "Endereço",       placeholder: "Rua das Inovações",                value: form.endereco,    readOnly: true, loading: loadingCEP },
    { name: "numero",      label: "Número",         pair: "start", placeholder: "104",                value: form.numero,      error: errors.numero },
    { name: "complemento", label: "Complemento",    pair: "end",   placeholder: "Sala 104",           value: form.complemento },
    { name: "cidade",      label: "Cidade",         pair: "start", placeholder: "São Paulo",          value: form.cidade,      readOnly: true, loading: loadingCEP },
    { name: "uf",          label: "UF",             pair: "end",   type: "select", value: form.uf,    readOnly: true, options: UF_OPTIONS },
  ];

  const contactStepContent = (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Informações da Empresa</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Razão Social</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.razaoSocial || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Nome Fantasia</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.nomeFantasia || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">CNPJ</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.cnpj || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Inscrição Estadual</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.inscEst || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Telefone</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.fone || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">CEP</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.cep || "-"}</span>
          </div>
          <div className="grid gap-1 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Endereço</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.endereco || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Número</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.numero || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Complemento</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.complemento || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">Cidade</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.cidade || "-"}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] uppercase tracking-[1px] text-slate-500">UF</span>
            <span className="text-sm text-slate-900 dark:text-slate-100">{form.uf || "-"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Contato {index + 1}</p>
            <div className="catalog-form-row mt-4">
              <div className="catalog-form-field">
                <span>Nome do contato</span>
                <input
                  type="text"
                  placeholder="Nome do contato"
                  value={contact.nome}
                  onChange={(e) => handleContactChange(index, "nome", e.target.value)}
                />
                {contactErrors[index]?.nome && <span className="catalog-field-error">{contactErrors[index].nome}</span>}
              </div>
              <div className="catalog-form-field">
                <span>E-mail</span>
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, "email", e.target.value)}
                />
                {contactErrors[index]?.email && <span className="catalog-field-error">{contactErrors[index].email}</span>}
              </div>
            </div>
            <div className="catalog-form-field mt-4">
              <span>Telefone</span>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={contact.telefone}
                onChange={(e) => handleContactChange(index, "telefone", e.target.value)}
              />
              {contactErrors[index]?.telefone && <span className="catalog-field-error">{contactErrors[index].telefone}</span>}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="produto-new-btn" onClick={addContact}>
        Adicionar outro contato
      </button>
    </div>
  );

  return (
    <>
      <CatalogPage
        eyebrow="Clientes Cadastrados"
      title="Painel de Leads"
      searchPlaceholder="Pesquisar Clientes"
      searchValue={search}
      onSearchChange={handleSearchChange}
      tableTitle="Base de Clientes"
      tableColumns={[
        { label: "Identificação dos Cadastros", flex: "2" },
        { label: "Contatos",                    flex: "1" },
        { label: "UF",                          flex: "0.7" },
        { label: "Compras Realizadas",          flex: "1.4" },
      ]}
      rows={rows}
      loadingRows={loadingRows}
      moreLabel="Ver Mais Clientes"
      formTitle="Cadastrar Novo Cliente"
      formTitleEdit="Editar Cliente"
      isEditing={!!editingId}
      fields={isContactStep ? [] : fields}
      extraFormContent={isContactStep ? contactStepContent : null}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={loading ? "Aguarde..." : isContactStep ? "Salvar cadastro" : (editingId ? "Salvar" : "Cadastrar")}
      submitDisabled={loading}
    />

    <EntityDetailsModal
      open={showDetailsModal}
      entity={selectedClient}
      onClose={() => setShowDetailsModal(false)}
    />
  </>
  );
}