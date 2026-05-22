import { useState, useCallback } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";

const emptyForm = {
  nome: "",
};

const mockRows = [
  { id: "P1", title: "PRODUTO 1", subtitle: "#000000",
    cells: [{ value: "Tech Solutis", className: "catalog-link" }, { value: "R$ 100,00" }] },
  { id: "P2", title: "PRODUTO 2", subtitle: "#000000",
    cells: [{ value: "Global Corp", className: "catalog-link" }, { value: "R$ 100,00" }] },
  { id: "P3", title: "PRODUTO 3", subtitle: "#000000",
    cells: [{ value: "Inovation", className: "catalog-link" }, { value: "R$ 100,00" }] },
  { id: "P4", title: "PRODUTO 4", subtitle: "#000000",
    cells: [{ value: "Cyber Ltda", className: "catalog-link" }, { value: "R$ 100,00" }] },
];

export default function ProdutoPage() {
  const [form, setForm]       = useState(emptyForm);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [rows, setRows]       = useState(mockRows);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

 function validate() {
  const errs = {};
  if (!form.nome.trim()) errs.nome = "Nome obrigatório.";
  setErrors(errs);
  return Object.keys(errs).length === 0;
}

  async function handleSubmit() {
    if (!validate()) return;

    const payload = { nome: form.nome };

    setLoading(true);
    try {
      await api.post("/produto/cadastrar", payload);
      toast.success("Produto cadastrado com sucesso!");
      setForm(emptyForm);
      setErrors({});

      // Recarrega a lista quando o GET existir:
      // const { data } = await api.get("/produto");
      // setRows(data.content.map(mapProdutoToRow));
    } catch (err) {
      if (err?.status === 409) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao cadastrar produto. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const fields = [
  {
    name: "nome", label: "Nome do Produto", placeholder: "Ex: Pacote Office 365",
    span: "full", value: form.nome, error: errors.nome,
  },
];

  return (
    <CatalogPage
      eyebrow="Produtos Cadastrados"
      title="Painel de Catálogo"
      searchPlaceholder="Pesquisar Produto"
      tableTitle="Base de Produtos"
      tableColumns={[
        { label: "Identificação dos Cadastros", width: "2fr" },
        { label: "Distribuidor",                width: "1.35fr" },
        { label: "Valor Unitário",              width: "1.3fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Produtos"
      formTitle="Cadastrar Produto"
      fields={fields}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel={loading ? "Aguarde..." : "Cadastrar"}
      submitDisabled={loading}
    />
  );
}