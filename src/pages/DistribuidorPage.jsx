import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";
import EntityDetailsModal from "../components/modal/EntityDetailsModal";

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

const mockDistribuidores = [
  {
    id: "mock-distribuidor-1",
    razaoSocial: "Distribuidora Exemplo LTDA",
    nomeFantasia: "Dist. Exemplo",
    cnpj: "98.765.432/0001-98",
    inscricaoEstadual: "987.654.321.000",
    telefone: "(21) 97654-3210",
    cep: "22040-001",
    endereco: "Rua do Comércio, 123",
    numero: "123",
    complemento: "Loja 2",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    contatos: [
      { nome: "Carlos Oliveira", email: "carlos@dist.exemplo.com.br", telefone: "(21) 97654-3210" },
    ],
    __isMock: true,
  },
];

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
  if (data.erro) throw new Error("CEP nao encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}

function mapDistribuidorToRow(d, onEdit, onDelete, onView) {
  const isMock = d.__isMock === true;
  return {
    id:       d.idDistribuidor,
    badge:    d.nomeFantasia?.slice(0, 2).toUpperCase() ?? "DT",
    title:    d.razaoSocial,
    subtitle: d.nomeFantasia || "",
    cells: [
      { value: d.contatos?.length ?? 0, className: "catalog-centered" },
      { value: d.uf || "-", className: "catalog-centered" },
    ],
    onEdit:   () => isMock ? toast.error("Registro mock não pode ser editado.") : onEdit(d),
    onDelete: () => isMock ? toast.error("Registro mock não pode ser removido.") : onDelete(d.id),
    onView:   () => onView(d),
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DistribuidorPage() {
  const [form,          setForm]          = useState(emptyForm);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [loadingRows,   setLoadingRows]   = useState(false);
  const [rows,          setRows]          = useState([]);
  const [editingId,     setEditingId]     = useState(null);
  const [search,        setSearch]        = useState("");
  const [isContactStep, setIsContactStep] = useState(false);
  const [contacts,      setContacts]      = useState([{ ...emptyContact }]);
  const [contactErrors, setContactErrors] = useState([{}]);
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP,  setLoadingCEP]  = useState(false);

  const fetchDistribuidores = useCallback(async (busca = "") => {
    setLoadingRows(true);
    try {
      const { data } = await api.get("/distribuidor/listarFiltro", { params: busca ? { busca } : {} });
      setRows([
        ...mockDistribuidores,
        ...data,
      ].map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete, handleView)));
    } catch {
      toast.error("Erro ao carregar distribuidores.");
      setRows(mockDistribuidores.map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete, handleView)));
    } finally {
      setLoadingRows(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDistribuidores();
  }, [fetchDistribuidores]);

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
        } catch { toast.error("Nao foi possivel consultar o CNPJ."); }
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
        } catch { toast.error("CEP nao encontrado."); }
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

  function removeContact(index) {
    if (contacts.length === 1) {
      setContacts([{ ...emptyContact }]);
      setContactErrors([{}]);
      return;
    }
    setContacts((prev) => prev.filter((_, idx) => idx !== index));
    setContactErrors((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleView(d) {
    setSelectedDistribuidor(d);
  }

  function handleEdit(d) {
    setEditingId(d.idDistribuidor);
    console.log(d.cep);
    setForm({
      razaoSocial:  d.razaoSocial       ?? "",
      nomeFantasia: d.nomeFantasia      ?? "",
      cnpj:         maskCNPJ(d.cnpj     ?? ""),
      inscEst:      d.inscricaoEstadual ?? "",
      fone:         maskPhone(d.telefone ?? ""),
      cep:          maskCEP(d.cep ?? ""),
      endereco:     d.endereco    ?? "",
      numero:       d.numero      ?? "",
      complemento:  d.complemento ?? "",
      cidade:       d.cidade      ?? "",
      uf:           d.uf          ?? "SP",
    });
    setContacts(d.contatos && d.contatos.length > 0 ? d.contatos.map((item) => ({
      nome: item.nome || "",
      email: item.email || "",
      telefone: maskPhone(item.telefone || ""),
    })) : [{ nome: d.contato || "", email: d.email || "", telefone: "" }]);
    setContactErrors([{}]);
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
      await api.delete(`/distribuidor/${id}`);
      toast.success("Distribuidor removido com sucesso!");
      await fetchDistribuidores(currentPage, search);
    } catch (err) {
      if (err?.status === 404) toast.error("Distribuidor nao encontrado.");
      else toast.error("Erro ao remover distribuidor. Tente novamente.");
    } finally {
      setLoadingRows(false);
    }
  }

  function validateCompany() {
    const errs = {};
    if (!form.razaoSocial.trim())                               errs.razaoSocial  = "Razao social obrigatoria.";
    if (!form.nomeFantasia.trim())                              errs.nomeFantasia = "Nome fantasia obrigatorio.";
    if (form.cnpj.replace(/\D/g, "").length < 14)               errs.cnpj         = "CNPJ invalido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10) errs.fone         = "Telefone invalido.";
    if (form.cep.replace(/\D/g, "").length < 8)                 errs.cep          = "CEP invalido.";
    if (!form.numero.trim())                                    errs.numero       = "Numero obrigatorio.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateContacts() {
    const errorsByContact = contacts.map((contact) => {
      const err = {};
      if (!contact.nome.trim()) err.nome = "Nome do contato obrigatorio.";
      if (!contact.email || !contact.email.includes("@")) err.email = "E-mail invalido.";
      if (!contact.telefone || contact.telefone.replace(/\D/g, "").length < 10) err.telefone = "Telefone invalido.";
      return err;
    });
    const hasAny = errorsByContact.some((item) => Object.keys(item).length > 0);
    setContactErrors(errorsByContact);
    return !hasAny && contacts.length > 0;
  }

  async function handleSubmit() {
    if (!isContactStep) {
      if (!validateCompany()) return;
      setIsContactStep(true);
      return;
    }

    if (!validateContacts()) {
      if (contacts.length === 0) toast.error("E necessario cadastrar pelo menos um contato.");
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
      contato:           contacts[0]?.nome || "",
      email:             contacts[0]?.email || "",
    };

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/distribuidor/${editingId}`, payload);
        toast.success("Distribuidor atualizado com sucesso!");
        setEditingId(null);
      } else {
        await api.post("/distribuidor", payload);
        toast.success("Distribuidor cadastrado com sucesso!");
      }
      setForm(emptyForm);
      setContacts([{ ...emptyContact }]);
      setContactErrors([{}]);
      setIsContactStep(false);
      setErrors({});
      await fetchDistribuidores(currentPage, search);
    } catch (err) {
      if (err?.status === 409)      toast.error(err.message);
      else if (err?.status === 404) toast.error("Distribuidor nao encontrado.");
      else if (err?.status === 400) toast.error(err.message ?? "Dados invalidos.");
      else toast.error(editingId ? "Erro ao atualizar distribuidor." : "Erro ao cadastrar distribuidor.");
    } finally {
      setLoading(false);
    }
  }

  // ── Search ──
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    syncUrl(1, val);
  }

  // ── Fields ──
  const fields = [
    { name: "cnpj",        label: "CNPJ",         pair: "start", placeholder: "00.000.000/0000-00", value: form.cnpj,         loading: loadingCNPJ, error: errors.cnpj },
    { name: "inscEst",     label: "Insc. Est.",    pair: "end",   placeholder: "isento",             value: form.inscEst,      loading: loadingCNPJ },
    { name: "razaoSocial", label: "Razao Social",  placeholder: "Ex: Tech Solutions Ltda",           value: form.razaoSocial,  readOnly: true, loading: loadingCNPJ, error: errors.razaoSocial },
    { name: "nomeFantasia",label: "Nome Fantasia", placeholder: "Ex: Tech Solutions",                value: form.nomeFantasia, loading: loadingCNPJ, error: errors.nomeFantasia },
    { name: "fone",        label: "Fone",          pair: "start", placeholder: "(00) 0000-0000",      value: form.fone,         error: errors.fone },
    { name: "cep",         label: "CEP",           pair: "end",   placeholder: "00000-000",           value: form.cep,          loading: loadingCEP, error: errors.cep },
    { name: "endereco",    label: "Endereco",      placeholder: "Rua das Inovacoes",                 value: form.endereco,     readOnly: true, loading: loadingCEP },
    { name: "numero",      label: "Numero",        pair: "start", placeholder: "104",                 value: form.numero,       error: errors.numero },
    { name: "complemento", label: "Complemento",   pair: "end",   placeholder: "Sala 104",            value: form.complemento },
    { name: "cidade",      label: "Cidade",        pair: "start", placeholder: "Sao Paulo",           value: form.cidade,       readOnly: true, loading: loadingCEP },
    { name: "uf",          label: "UF",            pair: "end",   type: "select", value: form.uf,     readOnly: true, options: UF_OPTIONS },
  ];

  const contactStepContent = (
    <div className="space-y-6">
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="catalog-contact-card">
            <div className="catalog-contact-heading">
              <p>Contato {index + 1}</p>
              <button
                type="button"
                className="catalog-contact-delete"
                onClick={() => removeContact(index)}
                aria-label={`Remover contato ${index + 1}`}
                title="Remover contato"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 3h6l.8 2H20v1.8H4V5h4.2L9 3Zm-2.7 5h11.4l-.8 12H7.1L6.3 8Zm2 1.8.55 8.4h6.3l.55-8.4H8.3Zm2.2 1.5h1.6v5.4h-1.6v-5.4Zm3.4 0h1.6v5.4h-1.6v-5.4Z" />
                </svg>
              </button>
            </div>
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

      <button type="button" className="btn-add-produto" onClick={addContact}>
        + Adicionar Contato
      </button>
    </div>
  );

  return (
    <>
      <CatalogPage
        eyebrow="Distribuidores Cadastrados"
        title="Painel de Fornecedores"
        searchPlaceholder="Pesquisar Distribuidor"
        searchValue={search}
        onSearchChange={handleSearchChange}
        tableTitle="Base de Fornecedores"
        tableColumns={[
          { label: "Identificacao dos Cadastros", flex: "2" },
          { label: "Contatos",                    flex: "1" },
          { label: "UF",                          flex: "0.7" },
        ]}
        rows={rows}
        loadingRows={loadingRows}
        moreLabel="Ver Mais Fornecedores"
        formTitle="Cadastrar Novo Distribuidor"
        formTitleEdit="Editar Distribuidor"
        isEditing={!!editingId}
        fields={isContactStep ? [] : fields}
        extraFormContent={isContactStep ? contactStepContent : null}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel={loading ? "Aguarde..." : isContactStep ? "Salvar cadastro" : "Salvar e adicionar contato →"}
        submitDisabled={loading}
        deleteEntityLabel="distribuidor"
      />

      <EntityDetailsModal
        entity={selectedDistribuidor}
        title="Detalhes do Distribuidor"
        onClose={() => setSelectedDistribuidor(null)}
      />
    </>
  );
}
