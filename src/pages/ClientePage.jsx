import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";

// ─── Máscaras ────────────────────────────────────────────────────────────────
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

// ─── Estado inicial do formulário ─────────────────────────────────────────────
const emptyForm = {
  razaoSocial: "",
  nomeFantasia: "",
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

// Campos que vêm preenchidos por API externa (readOnly)
const autoFields = new Set(["razaoSocial", "inscEst", "endereco", "cidade", "uf"]);

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// ─── Hook: busca CNPJ ─────────────────────────────────────────────────────────
// Troque a URL pela API real quando disponível (ex: ReceitaWS, BrasilAPI, etc.)
async function fetchEmpresa(cnpjRaw) {
  // const { data } = await axios.get(`https://api-empresa.exemplo.com/cnpj/${cnpjRaw}`);
  // return { razaoSocial: data.razao_social, inscEst: data.inscricao_estadual };

  // ── MOCK até a API estar disponível ──
  await new Promise((r) => setTimeout(r, 600));
  return { razaoSocial: "EMPRESA MOCKADA LTDA", inscEst: "110.042.490.114", nomeFantasia: "Tech Solutions" };
}

// ─── Hook: busca CEP via ViaCEP ───────────────────────────────────────────────
async function fetchCEP(cepRaw) {
  const res = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}

// ─── Mapeia ClienteResponseDTO para formato de linha da tabela ─────────────────
function mapClienteToRow(cliente) {
  const primeiroContato = cliente.contato?.[0] || { nome: "—", email: "—" };

  return {
    id: String(cliente.idCliente),
    title: cliente.nomeFantasia,
    subtitle: cliente.cnpj,
    cells: [
      { value: cliente.email, className: "catalog-link" },
      {
        type: "identity",
        title: primeiroContato.nome,
        subtitle: primeiroContato.email,
      },
      { value: String(cliente.comprasRealizadas || 0), className: "catalog-centered" },
    ],
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ClientePage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  // estados de loading por campo auto
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Carrega clientes da API ao montar o componente
  useEffect(() => {
    (async () => {
      setLoadingRows(true);
      try {
        const { data } = await api.get("/cliente");
        setRows(data.map(mapClienteToRow));
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        toast.error("Erro ao carregar clientes.");
      } finally {
        setLoadingRows(false);
      }
    })();
  }, []);

  // ── Atualiza campo individual ──
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── Handler genérico de mudança ──
  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;

    // helper local para não depender de setField externo
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
            nomeFantasia: empresa.nomeFantasia || "",
          }));
        } catch {
          toast.error("Não foi possível consultar o CNPJ.");
        } finally {
          setLoadingCNPJ(false);
        }
      } else {
        setForm((prev) => ({ ...prev, razaoSocial: "", inscEst: "", nomeFantasia: "" }));
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
          const endereco = await fetchCEP(rawOnly);
          setForm((prev) => ({ ...prev, ...endereco }));
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
  }, []); // <-- array vazio agora é seguro porque tudo usa a forma funcional dos setters

  // ── Validação ──
  function validate() {
    const errs = {};
    if (!form.razaoSocial.trim()) errs.razaoSocial = "Razão social obrigatória.";
    if (!form.nomeFantasia.trim()) errs.nomeFantasia = "Nome fantasia obrigatório.";
    if (form.cnpj.replace(/\D/g, "").length < 14) errs.cnpj = "CNPJ inválido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10) errs.fone = "Telefone inválido.";
    if (form.cep.replace(/\D/g, "").length < 8) errs.cep = "CEP inválido.";
    if (!form.numero.trim()) errs.numero = "Número obrigatório.";
    if (!form.email || !form.email.includes("@")) errs.email = "E-mail inválido.";
    if (!form.contato.trim()) errs.contato = "Contato obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validate()) return;

    const payload = {
      razaoSocial: form.razaoSocial,
      nomeFantasia: form.nomeFantasia,
      cnpj: form.cnpj.replace(/\D/g, ""),
      inscricaoEstadual: form.inscEst,
      telefone: form.fone.replace(/\D/g, ""),
      cep: form.cep.replace(/\D/g, ""),
      endereco: form.endereco,
      numero: form.numero,
      complemento: form.complemento,
      cidade: form.cidade,
      uf: form.uf,
      nomeContato: form.contato,
      email: form.email,
    };
    console.log("Payload:", payload);
    setLoading(true);
    try {
      await api.post("/cliente", payload);
      console.log("Payload enviado:", payload); // Log do payload para debug
      toast.success("Cliente cadastrado com sucesso!");
      setForm(emptyForm);
      setErrors({});

      // Recarrega a lista de clientes
      const { data } = await api.get("/cliente");
      setRows(data.map(mapClienteToRow));
    } catch (err) {
      if (err?.status === 409) {
        toast.error(err.message); 
      } else {
        toast.error("Erro ao cadastrar cliente. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Monta os fields para o CatalogPage ──
  // Passa metadados extras (readOnly, loading, error) via campo customizado
  const fields = [
    {
      name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00",
      span: "half", value: form.cnpj, loading: loadingCNPJ, error: errors.cnpj,
    },
    {
      name: "inscEst", label: "Insc. Est.", placeholder: "110.042.490.114",
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
      name: "email", label: "E-mail", placeholder: "contato@empresa.com", type: "email",
      span: "full", value: form.email, error: errors.email,
    },
    {
      name: "contato", label: "Contato", placeholder: "Nome do Contato",
      span: "full", value: form.contato, error: errors.contato,
    },
  ];

  return (
    <CatalogPage
      eyebrow="Clientes Cadastrados"
      title="Painel de Leads"
      searchPlaceholder="Pesquisar Clientes"
      tableTitle="Base de Clientes"
      tableColumns={[
        { label: "Identificação dos Cadastros", width: "2fr" },
        { label: "E-mail", width: "1.7fr" },
        { label: "Contato", width: "2fr" },
        { label: "Compras Realizadas", width: "1.4fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Clientes"
      formTitle="Cadastrar Novo Cliente"
      fields={fields}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={loading ? "Aguarde..." : "Cadastrar"}
      submitDisabled={loading}
    />
  );
}