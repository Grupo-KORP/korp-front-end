import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";
import { toast } from "sonner";
import NavbarVendedor from "../layout/NavbarVendedor";
import "../components/catalog/CatalogPage.css";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [dirty, setDirty] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.body.classList.add("catalog-body");
    return () => document.body.classList.remove("catalog-body");
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

    const trimmed = value.trim();
    if (!dirty) {
      setDirty(trimmed !== "" && trimmed !== originalName);
    } else if (name === "nome") {
      setDirty(trimmed !== "" && trimmed !== originalName);
    }
  }, [dirty, originalName]);

 function validate() {
  const errs = {};
  if (!form.nome.trim()) errs.nome = "Nome obrigatório.";
  setErrors(errs);
  return Object.keys(errs).length === 0;
}

  async function handleSubmit() {
    if (!validate() || !dirty) return;

    const payload = { nome: form.nome };

    setLoading(true);
    try {
      if (modalMode === "edit" && editingId) {
        setRows((prev) => prev.map((row) => row.id === editingId ? { ...row, title: form.nome } : row));
        toast.success("Nome do produto atualizado com sucesso!");
      } else {
        await api.post("/produto/cadastrar", payload);
        const nextId = `P${rows.length + 1}`;
        setRows((prev) => [...prev, { id: nextId, title: form.nome, subtitle: "#000000", badge: nextId }]);
        toast.success("Produto cadastrado com sucesso!");
      }

      setForm(emptyForm);
      setErrors({});
      setIsModalOpen(false);
      setDirty(false);
      setEditingId(null);
      setOriginalName("");

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

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setOriginalName("");
    setForm(emptyForm);
    setErrors({});
    setDirty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setModalMode("edit");
    setEditingId(row.id);
    setOriginalName(row.title);
    setForm({ nome: row.title });
    setErrors({});
    setDirty(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
    toast.success("Produto excluído com sucesso!");
    setDeleteTarget(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDirty(false);
    setEditingId(null);
    setOriginalName("");
    setErrors({});
  };

  return (
    <div className="catalog-shell">
      <NavbarVendedor />

      <div className="catalog-page">
        <div className="catalog-left">
          <div className="catalog-topbar produto-topbar-with-action">
            <div className="catalog-title-block">
              <p>Produtos Cadastrados</p>
              <h1>Painel de Catálogo</h1>
            </div>

            <div className="produto-topbar-actions">
              <label className="catalog-search" aria-label="Pesquisar Produto">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.15 7.25 4.18 4.18-1.27 1.27-4.18-4.18 1.27-1.27Z" />
                </svg>
                <input type="search" placeholder="Pesquisar Produto" />
              </label>
              <button className="produto-new-btn" type="button" onClick={openCreateModal}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3h9.2L20 7.8V21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.9V9h4.1L14 4.9ZM6 5v14h12v-8h-6V5H6Zm2 8h8v1.7H8V13Zm0 3h6v1.7H8V16Z" />
                </svg>
                Novo Produto
              </button>
            </div>
          </div>

          <div className="catalog-table-card">
            <div className="catalog-section-title">
              <span />
              <h2>Base de Produtos</h2>
            </div>

            <div className="catalog-table-head">
              <span style={{ flex: "1" }}>Produto</span>
              <span style={{ flex: "0 0 100px", textAlign: "center" }}>Ações</span>
            </div>

            <div className="catalog-table-body">
              {rows.map((row) => (
                <div className="catalog-row" key={row.id}>
                  <div className="catalog-identity" style={{ flex: "1" }}>
                    <span className="catalog-badge">{row.badge ?? row.id}</span>
                    <div>
                      <strong>{row.title}</strong>
                      {row.subtitle && <small>{row.subtitle}</small>}
                    </div>
                  </div>

                  <div className="catalog-tools" style={{ flex: "0 0 100px" }}>
                    <button type="button" aria-label={`Editar ${row.title}`} onClick={() => openEditModal(row)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 16.7 15.8 5.9l2.3 2.3L7.3 19H5v-2.3Zm14.4-9.8-2.3-2.3.7-.7a1.5 1.5 0 0 1 2.1 0l.2.2a1.5 1.5 0 0 1 0 2.1l-.7.7Z" />
                      </svg>
                    </button>
                    <button type="button" aria-label={`Excluir ${row.title}`} onClick={() => confirmDelete(row)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l.8 2H20v1.8H4V5h4.2L9 3Zm-2.7 5h11.4l-.8 12H7.1L6.3 8Zm2 1.8.55 8.4h6.3l.55-8.4H8.3Zm2.2 1.5h1.6v5.4h-1.6v-5.4Zm3.4 0h1.6v5.4h-1.6v-5.4Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="catalog-more" type="button">
              Ver Mais Produtos
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7.2 9.4 4.8 4.8 4.8-4.8 1.2 1.2-6 6-6-6 1.2-1.2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="produto-modal-backdrop" onClick={closeModal}>
          <div className="produto-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="produto-modal-header">
              <div>
                <p className="produto-eyebrow">{modalMode === "edit" ? "Editar produto" : "Novo produto"}</p>
                <h2>{modalMode === "edit" ? "Salvar alterações" : "Cadastrar Produto"}</h2>
              </div>
              <button type="button" className="produto-close-btn" onClick={closeModal} aria-label="Fechar modal">×</button>
            </div>

            <form
              className="catalog-form produto-modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="catalog-form-fields">
                {fields.map((field) => (
                  <div className="catalog-form-field" key={field.name}>
                    <span>{field.label}</span>
                    <input
                      name={field.name}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={handleChange}
                    />
                    {errors[field.name] && <span className="catalog-field-error">{errors[field.name]}</span>}
                  </div>
                ))}
              </div>

              <div className="catalog-form-actions produto-modal-actions">
                <button type="button" className="catalog-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="catalog-submit" disabled={loading || !dirty || !form.nome.trim()}>
                  {loading ? "Aguarde..." : modalMode === "edit" ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="produto-modal-backdrop" onClick={closeDeleteModal}>
          <div className="produto-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="produto-modal-header">
              <div>
                <p className="produto-eyebrow">Excluir produto</p>
                <h2>Tem certeza?</h2>
              </div>
              <button type="button" className="produto-close-btn" onClick={closeDeleteModal} aria-label="Fechar modal">×</button>
            </div>
            <p className="produto-confirm-text">Deseja realmente excluir o produto "{deleteTarget.title}"?</p>
            <div className="produto-confirm-actions">
              <button type="button" className="catalog-cancel" onClick={closeDeleteModal}>
                Não
              </button>
              <button type="button" className="catalog-submit" onClick={handleDeleteConfirmed}>
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}