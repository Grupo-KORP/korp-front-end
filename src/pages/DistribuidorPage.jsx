import { useState, useCallback } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";

// ─── Máscaras ─────────────────────────────────────────────────────────────────
function maskCNPJ(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 14);
  if (raw.length > 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
  if (raw.length > 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
  if (raw.length > 5) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
  if (raw.length > 2) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
  return raw;
}

function maskCEP(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 8);
  if (raw.length > 5) return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  return raw;
}

function maskPhone(raw) {
  raw = raw.replace(/\D/g, "").slice(0, 11);
  if (raw.length > 7) return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  if (raw.length > 2) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
  return raw;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────
const emptyForm = {
  razaoSocial: "",
  cnpj: "",
  inscEst: "",
  fone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  cidade: "",
  uf: "SP",
  contato: "",
  email: "",
};

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// ─── APIs externas ────────────────────────────────────────────────────────────
async function fetchEmpresa(cnpjRaw) {
  // Troque pela API real quando disponível (BrasilAPI, ReceitaWS, etc.)
  // const { data } = await axios.get(`https://api-empresa.exemplo.com/cnpj/${cnpjRaw}`);
  // return { razaoSocial: data.razao_social, inscEst: data.inscricao_estadual };
  await new Promise((r) => setTimeout(r, 600));
  return { razaoSocial: "EMPRESA MOCKADA LTDA", inscEst: "isento" };
}

async function fetchCEP(cepRaw) {
  const res = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}

// ─── Mock da tabela (remover ao integrar GET /distribuidor) ───────────────────
const mockRows = [
  {
    id: "F1", title: "FORNECEDOR 1", subtitle: "Maria Silva - Microsoft",
    cells: [{ value: "maria.silva@microsoft", className: "catalog-link" }, { value: "Software" }]
  },
  {
    id: "F2", title: "FORNECEDOR 2", subtitle: "Joao Oliveira - Tech Solutions",
    cells: [{ value: "joao.oliveira@techsolutions", className: "catalog-link" }, { value: "Software" }]
  },
  {
    id: "F3", title: "FORNECEDOR 3", subtitle: "Ana Costa - Global Corp",
    cells: [{ value: "ana.costa@global.corp", className: "catalog-link" }, { value: "Software" }]
  },
  {
    id: "F4", title: "FORNECEDOR 4", subtitle: "Rafael Santos - Globan",
    cells: [{ value: "rafa.santos@globan", className: "catalog-link" }, { value: "Software" }]
  },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DistribuidorPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(mockRows);

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // ── Handler de mudança ────────────────────────────────────────────────────
  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;

    const updateField = (n, v) => {
      setForm((prev) => ({ ...prev, [n]: v }));
      setErrors((prev) => {
        if (!prev[n]) return prev;
        const next = { ...prev };
        delete next[n];
        return next;
      });
    };

    if (name === "cnpj") {
      const masked = maskCNPJ(value);
      const rawOnly = masked.replace(/\D/g, "");
      updateField("cnpj", masked);

      if (rawOnly.length === 14) {
        setLoadingCNPJ(true);
        try {
          const empresa = await fetchEmpresa(rawOnly);
          setForm((prev) => ({
            ...prev,
            razaoSocial: empresa.razaoSocial,
            inscEst: empresa.inscEst,
          }));
        } catch {
          toast.error("Não foi possível consultar o CNPJ.");
        } finally {
          setLoadingCNPJ(false);
        }
      } else {
        setForm((prev) => ({ ...prev, razaoSocial: "", inscEst: "" }));
      }
      return;
    }

    if (name === "cep") {
      const masked = maskCEP(value);
      const rawOnly = masked.replace(/\D/g, "");
      updateField("cep", masked);

      if (rawOnly.length === 8) {
        setLoadingCEP(true);
        try {
          const end = await fetchCEP(rawOnly);
          setForm((prev) => ({ ...prev, ...end }));
        } catch {
          toast.error("CEP não encontrado.");
        } finally {
          setLoadingCEP(false);
        }
      } else {
        setForm((prev) => ({ ...prev, endereco: "", cidade: "", uf: "SP" }));
      }
      return;
    }

    if (name === "fone") { updateField("fone", maskPhone(value)); return; }

    updateField(name, value);
  }, []);

  // ── Validação ─────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.razaoSocial.trim()) errs.razaoSocial = "Razão social obrigatória.";
    if (!form.nomeFantasia.trim()) errs.nomeFantasia = "Nome fantasia obrigatório.";
    if (form.cnpj.replace(/\D/g, "").length < 14) errs.cnpj = "CNPJ inválido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10) errs.fone = "Telefone inválido.";
    if (form.cep.replace(/\D/g, "").length < 8) errs.cep = "CEP inválido.";
    if (!form.numero.trim()) errs.numero = "Número obrigatório.";
    if (!form.contato.trim()) errs.contato = "Contato obrigatório.";
    if (!form.email || !form.email.includes("@")) errs.email = "E-mail inválido.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;

    const payload = {
      razaoSocial: form.razaoSocial,
      cnpj: form.cnpj.replace(/\D/g, ""),
      inscricaoEstadual: form.inscEst,
      nomeFantasia: form.nomeFantasia,
      telefone: form.fone.replace(/\D/g, ""),
      cep: form.cep.replace(/\D/g, ""),
      endereco: form.endereco,
      cidade: form.cidade,
      uf: form.uf,
      numero: form.numero,
      complemento: form.complemento,
      contato: form.contato,
      email: form.email,
    };

    setLoading(true);
    try {
      await api.post("/distribuidor", payload);
      toast.success("Distribuidor cadastrado com sucesso!");
      setForm(emptyForm);
      setErrors({});

      // Recarrega a lista quando o GET existir:
      // const { data } = await api.get("/distribuidor");
      // setRows(data.content.map(mapDistribuidorToRow));
    } catch (err) {
      if (err?.status === 409) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao cadastrar distribuidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Fields para o CatalogPage ─────────────────────────────────────────────
  const fields = [
    {
      name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00",
      span: "half", value: form.cnpj, loading: loadingCNPJ, error: errors.cnpj,
    },
    {
      name: "inscEst", label: "Insc. Est.", placeholder: "isento",
      span: "half", value: form.inscEst, loading: loadingCNPJ,
    },
    {
      name: "razaoSocial", label: "Razão Social", placeholder: "Ex: Tech Solutions Ltda",
      span: "full", value: form.razaoSocial, readOnly: true, loading: loadingCNPJ, error: errors.razaoSocial,
    },
    {
      name: "nomeFantasia", label: "Nome Fantasia", placeholder: "Ex: Tech Solutions",
      span: "full", value: form.nomeFantasia, loading: loadingCNPJ, error: errors.nomeFantasia,
    },
    {
      name: "fone", label: "Fone", placeholder: "(00) 0000-0000",
      span: "half", value: form.fone, error: errors.fone,
    },
    {
      name: "cep", label: "CEP", placeholder: "00000-000",
      span: "half", value: form.cep, loading: loadingCEP, error: errors.cep,
    },
    {
      name: "endereco", label: "Endereço", placeholder: "Rua das Inovações",
      span: "full", value: form.endereco, readOnly: true, loading: loadingCEP,
    },
    {
      name: "numero", label: "Número", placeholder: "104",
      span: "half", value: form.numero, error: errors.numero,
    },
    {
      name: "complemento", label: "Complemento", placeholder: "Sala 104",
      span: "half", value: form.complemento,
    },
    {
      name: "cidade", label: "Cidade", placeholder: "São Paulo",
      span: "half", value: form.cidade, readOnly: true, loading: loadingCEP,
    },
    {
      name: "uf", label: "UF", type: "select",
      span: "half", value: form.uf, readOnly: true,
      options: UF_OPTIONS,
    },
    {
      name: "contato", label: "Contato", placeholder: "Nome do Responsável",
      span: "full", value: form.contato, error: errors.contato,
    },
    {
      name: "email", label: "E-mail", placeholder: "contato@empresa.com", type: "email",
      span: "full", value: form.email, error: errors.email,
    },
  ];

  return (
    <CatalogPage
      eyebrow="Distribuidores Cadastrados"
      title="Painel de Fornecedores"
      searchPlaceholder="Pesquisar Distribuidor"
      tableTitle="Base de Fornecedores"
      tableColumns={[
        { label: "Identificação dos Cadastros", width: "2fr" },
        { label: "E-mail", width: "1.55fr" },
        { label: "Especialidade", width: "1.25fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Fornecedores"
      formTitle="Cadastrar Novo Distribuidor"
      fields={fields}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={loading ? "Aguarde..." : "Cadastrar"}
      submitDisabled={loading}
    />
  );
}