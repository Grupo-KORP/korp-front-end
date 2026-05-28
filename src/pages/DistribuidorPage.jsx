import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";

const PAGE_SIZE = 8;

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
  cidade: "", uf: "SP", contato: "", email: "",
};

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

// ─── Helper: mapeia distribuidor da API para row da tabela ────────────────────
function mapDistribuidorToRow(d, onEdit, onDelete) {
  return {
    id:       d.idDistribuidor,
    badge:    d.nomeFantasia?.slice(0, 2).toUpperCase() ?? "DT",
    title:    d.nomeFantasia,
    subtitle: `${d.cnpj} - ${d.razaoSocial}`,
    cells: [
      { value: d.email,              className: "catalog-centered catalog-link"},
      { value: d.especialidade ?? "-", className: "catalog-centered" },
    ],
    onEdit:   () => onEdit(d),
    onDelete: () => onDelete(d.idDistribuidor),
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DistribuidorPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Lê URL na montagem ──
  const pageFromUrl  = parseInt(searchParams.get("pagina") || "1", 10);
  const buscaFromUrl = searchParams.get("busca") || "";

  const [form,        setForm]        = useState(emptyForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rows,        setRows]        = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [editingId,   setEditingId]   = useState(null);
  const [search,      setSearch]      = useState(buscaFromUrl);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl
  );

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP,  setLoadingCEP]  = useState(false);

  // ── Sincroniza URL ──
  const syncUrl = useCallback((page, busca) => {
    const params = {};
    if (page > 1)  params.pagina = String(page);
    if (busca)     params.busca  = busca;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // ── Fetch lista (paginado + busca) ──
  const fetchDistribuidores = useCallback(async (page, busca) => {
    setLoadingRows(true);
    try {
      const { data } = await api.get("/distribuidor/listarFiltro", {
        params: {
          page: page - 1,   // Spring 0-based
          size: PAGE_SIZE,
          sort: "nomeFantasia",
          ...(busca ? { busca } : {}),
        },
      });
      // Suporta resposta paginada { content, totalPages } ou array simples
      if (data.content !== undefined) {
        setRows(data.content.map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete)));
        setTotalPages(data.totalPages ?? 1);
      } else {
        setRows(data.map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete)));
        setTotalPages(1);
      }
    } catch {
      toast.error("Erro ao carregar distribuidores.");
    } finally {
      setLoadingRows(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega ao montar e sempre que página/busca mudarem
  useEffect(() => {
    fetchDistribuidores(currentPage, search);
  }, [currentPage, search, fetchDistribuidores]);

  // ── Troca de página ──
  function handlePageChange(page) {
    setCurrentPage(page);
    syncUrl(page, search);
  }

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

  // ── Editar ──
  function handleEdit(d) {
    setEditingId(d.idDistribuidor);
    console.log(d.cep);
    setForm({
      razaoSocial:  d.razaoSocial       ?? "",
      nomeFantasia: d.nomeFantasia      ?? "",
      cnpj:         maskCNPJ(d.cnpj     ?? ""),
      inscEst:      d.inscricaoEstadual ?? "",
      fone:         maskPhone(d.contato ?? ""),
      cep:          maskCEP(d.cep       ?? ""),
      endereco:     d.logradouro      ?? "",
      numero:       d.numero            ?? "",
      complemento:  d.complemento       ?? "",
      cidade:       d.cidade            ?? "",
      uf:           d.uf                ?? "SP",
      contato:      d.contato           ?? "",
      email:        d.email             ?? "",
    });
    setErrors({});
  }

  // ── Cancelar edição ──
  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
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
      if (err?.status === 404) toast.error("Distribuidor não encontrado.");
      else toast.error("Erro ao remover distribuidor. Tente novamente.");
    } finally {
      setLoadingRows(false);
    }
  }

  // ── Validação ──
  function validate() {
    const errs = {};
    if (!form.razaoSocial.trim())                              errs.razaoSocial  = "Razão social obrigatória.";
    if (!form.nomeFantasia.trim())                             errs.nomeFantasia = "Nome fantasia obrigatório.";
    if (form.cnpj.replace(/\D/g, "").length < 14)             errs.cnpj         = "CNPJ inválido.";
    if (!form.fone || form.fone.replace(/\D/g,"").length < 10) errs.fone        = "Telefone inválido.";
    if (form.cep.replace(/\D/g, "").length < 8)               errs.cep          = "CEP inválido.";
    if (!form.numero.trim())                                   errs.numero       = "Número obrigatório.";
    if (!form.email || !form.email.includes("@"))              errs.email        = "E-mail inválido.";
    if (!form.contato.trim())                                  errs.contato      = "Contato obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validate()) return;

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
      contato:           form.contato,
      email:             form.email,
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
      setErrors({});
      await fetchDistribuidores(currentPage, search);
    } catch (err) {
      if (err?.status === 409)      toast.error(err.message);
      else if (err?.status === 404) toast.error("Distribuidor não encontrado.");
      else if (err?.status === 400) toast.error(err.message ?? "Dados inválidos.");
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
    { name: "razaoSocial", label: "Razão Social",  placeholder: "Ex: Tech Solutions Ltda",           value: form.razaoSocial,  readOnly: true, loading: loadingCNPJ, error: errors.razaoSocial },
    { name: "nomeFantasia",label: "Nome Fantasia", placeholder: "Ex: Tech Solutions",                value: form.nomeFantasia, loading: loadingCNPJ, error: errors.nomeFantasia },
    { name: "fone",        label: "Fone",          pair: "start", placeholder: "(00) 0000-0000",      value: form.fone,         error: errors.fone },
    { name: "cep",         label: "CEP",           pair: "end",   placeholder: "00000-000",           value: form.cep,          loading: loadingCEP, error: errors.cep },
    { name: "endereco",    label: "Endereço",      placeholder: "Rua das Inovações",                 value: form.endereco,     readOnly: true, loading: loadingCEP },
    { name: "numero",      label: "Número",        pair: "start", placeholder: "104",                 value: form.numero,       error: errors.numero },
    { name: "complemento", label: "Complemento",   pair: "end",   placeholder: "Sala 104",            value: form.complemento },
    { name: "cidade",      label: "Cidade",        pair: "start", placeholder: "São Paulo",           value: form.cidade,       readOnly: true, loading: loadingCEP },
    { name: "uf",          label: "UF",            pair: "end",   type: "select", value: form.uf,     readOnly: true, options: UF_OPTIONS },
    { name: "contato",     label: "Contato",       placeholder: "Nome do Responsável",               value: form.contato,      error: errors.contato },
    { name: "email",       label: "E-mail",        type: "email", placeholder: "contato@empresa.com", value: form.email,       error: errors.email },
  ];

  return (
    <CatalogPage
      eyebrow="Distribuidores Cadastrados"
      title="Painel de Fornecedores"
      searchPlaceholder="Pesquisar Distribuidor"
      searchValue={search}
      onSearchChange={handleSearchChange}
      tableTitle="Base de Fornecedores"
      tableColumns={[
        { label: "Identificação dos Cadastros", flex: "2"    },
        { label: "E-mail",                      flex: "1.55" },
        { label: "Especialidade",               flex: "1.25" },
      ]}
      rows={rows}
      loadingRows={loadingRows}
      pageSize={PAGE_SIZE}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      formTitle="Cadastrar Novo Distribuidor"
      formTitleEdit="Editar Distribuidor"
      isEditing={!!editingId}
      fields={fields}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={loading ? "Aguarde..." : editingId ? "Salvar" : "Cadastrar"}
      submitDisabled={loading}
    />
  );
}