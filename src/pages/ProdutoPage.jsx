import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { toast } from "sonner";
import NavbarVendedor from "../layout/NavbarVendedor";
import "../components/catalog/CatalogPage.css";

const PAGE_SIZE = 5;

const emptyForm = { nome: "" };

// ─── Paginação ─────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(2, currentPage - 1);
    let end   = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2)              { start = 2; end = Math.min(4, totalPages - 1); }
    if (currentPage >= totalPages - 1) { start = Math.max(2, totalPages - 3); end = totalPages - 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const rawVisible    = getVisiblePages();
  const visiblePages  = rawVisible.filter((p) => p !== 1 && p !== totalPages);
  const showStartEllipsis = visiblePages.length > 0 && visiblePages[0] > 2;
  const showEndEllipsis   = visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages - 1;
  const ellipsis = <span className="catalog-pagination-ellipsis">···</span>;

  return (
    <div className="catalog-pagination">
      <span className="catalog-pagination-info">Pág. {currentPage} de {totalPages}</span>
      <div className="catalog-pagination-controls">
        <button className="catalog-pag-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1} title="Primeira página">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg>
        </button>
        <button className="catalog-pag-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Página anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button className={`catalog-pag-btn ${currentPage === 1 ? "is-active" : ""}`} onClick={() => onPageChange(1)}>1</button>
        {showStartEllipsis && ellipsis}
        {visiblePages.map((page) => (
          <button key={page} className={`catalog-pag-btn ${currentPage === page ? "is-active" : ""}`} onClick={() => onPageChange(page)}>{page}</button>
        ))}
        {showEndEllipsis && ellipsis}
        {totalPages > 1 && (
          <button className={`catalog-pag-btn ${currentPage === totalPages ? "is-active" : ""}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        )}

        <button className="catalog-pag-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Próxima página">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <button className="catalog-pag-btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Última página">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────────
export default function ProdutoPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl  = parseInt(searchParams.get("pagina") || "1", 10);
  const buscaFromUrl = searchParams.get("busca") || "";

  const [form,        setForm]        = useState(emptyForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rows,        setRows]        = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [search,      setSearch]      = useState(buscaFromUrl);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl
  );

  // ── Estados dos modais ──
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [modalMode,    setModalMode]    = useState("create"); // "create" | "edit"
  const [editingId,    setEditingId]    = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [dirty,        setDirty]        = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => {
    document.body.classList.add("catalog-body");
    return () => document.body.classList.remove("catalog-body");
  }, []);

  // ── Sincroniza URL ──
  const syncUrl = useCallback((page, busca) => {
    const params = {};
    if (page > 1) params.pagina = String(page);
    if (busca)    params.busca  = busca;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // ── Fetch lista ──
  const fetchProdutos = useCallback(async (page, busca) => {
    setLoadingRows(true);
    try {
      const { data } = await api.get("/produto/listarFiltro", {
        params: {
          page: page - 1,
          size: PAGE_SIZE,
          sort: "nome",
          ...(busca ? { busca } : {}),
        },
      });
      if (data.content !== undefined) {
        setRows(data.content);
        setTotalPages(data.totalPages ?? 1);
      } else {
        setRows(data);
        setTotalPages(1);
      }
    } catch {
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos(currentPage, search);
  }, [currentPage, search, fetchProdutos]);

  // ── Paginação ──
  function handlePageChange(page) {
    setCurrentPage(page);
    syncUrl(page, search);
  }

  // ── Busca ──
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    syncUrl(1, val);
  }

  // ── Form ──
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
    setDirty(trimmed !== "" && trimmed !== originalName);
  }, [originalName]);

  function validate() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = "Nome obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit (criar / editar) ──
  async function handleSubmit() {
    if (!validate() || !dirty) return;

    const payload = { nome: form.nome };
    setLoading(true);
    try {
      if (modalMode === "edit" && editingId) {
        await api.patch(`/produto/atualizar/${editingId}`, payload);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await api.post("/produto/cadastrar", payload);
        toast.success("Produto cadastrado com sucesso!");
      }
      closeModal();
      await fetchProdutos(currentPage, search);
    } catch (err) {
      if (err?.status === 409)      toast.error(err.message);
      else if (err?.status === 400) toast.error(err.message ?? "Dados inválidos.");
      else toast.error(modalMode === "edit" ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
  }

  // ── Delete ──
  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/produto/${deleteTarget.idProduto}`);
      toast.success("Produto excluído com sucesso!");
      setDeleteTarget(null);
      await fetchProdutos(currentPage, search);
    } catch (err) {
      if (err?.status === 404) toast.error("Produto não encontrado.");
      else toast.error("Erro ao excluir produto. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Abrir modais ──
  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setOriginalName("");
    setForm(emptyForm);
    setErrors({});
    setDirty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (produto) => {
    setModalMode("edit");
    setEditingId(produto.idProduto);
    setOriginalName(produto.nome);
    setForm({ nome: produto.nome });
    setErrors({});
    setDirty(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDirty(false);
    setEditingId(null);
    setOriginalName("");
    setErrors({});
  };

  const fields = [
    { name: "nome", label: "Nome do Produto", placeholder: "Ex: Pacote Office 365", value: form.nome, error: errors.nome },
  ];

  return (
    <div className="catalog-shell">
      <NavbarVendedor />

      <div className="catalog-page">
        <div className="catalog-left">

          {/* ── Topbar ── */}
          <div className="catalog-topbar produto-topbar-with-action">
            <div className="catalog-title-block">
              <p>Produtos Cadastrados</p>
              <h1>Painel de Produtos</h1>
            </div>

            <div className="produto-topbar-actions">
              <label className="catalog-search" aria-label="Pesquisar Produto">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.15 7.25 4.18 4.18-1.27 1.27-4.18-4.18 1.27-1.27Z" />
                </svg>
                <input
                  type="search"
                  placeholder="Pesquisar Produto"
                  value={search}
                  onChange={handleSearchChange}
                />
              </label>
              <button className="produto-new-btn" type="button" onClick={openCreateModal}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3h9.2L20 7.8V21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.9V9h4.1L14 4.9ZM6 5v14h12v-8h-6V5H6Zm2 8h8v1.7H8V13Zm0 3h6v1.7H8V16Z" />
                </svg>
                Novo Produto
              </button>
            </div>
          </div>

          {/* ── Tabela ── */}
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
              {loadingRows ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="catalog-row-skeleton" />
                ))
              ) : rows.length === 0 ? (
                <p className="catalog-empty">Nenhum produto encontrado.</p>
              ) : rows.map((produto) => (
                <div className="catalog-row" key={produto.idProduto}>
                  <div className="catalog-identity" style={{ flex: "1" }}>
                    <span className="catalog-badge">
                      {produto.nome?.slice(0, 2).toUpperCase() ?? "PR"}
                    </span>
                    <div>
                      <strong>{produto.nome}</strong>
                      {produto.codigoProduto && <small>{produto.codigoProduto}</small>}
                    </div>
                  </div>

                  <div className="catalog-tools" style={{ flex: "0 0 100px" }}>
                    <button type="button" aria-label={`Editar ${produto.nome}`} onClick={() => openEditModal(produto)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 16.7 15.8 5.9l2.3 2.3L7.3 19H5v-2.3Zm14.4-9.8-2.3-2.3.7-.7a1.5 1.5 0 0 1 2.1 0l.2.2a1.5 1.5 0 0 1 0 2.1l-.7.7Z" />
                      </svg>
                    </button>
                    <button type="button" aria-label={`Excluir ${produto.nome}`} onClick={() => setDeleteTarget(produto)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l.8 2H20v1.8H4V5h4.2L9 3Zm-2.7 5h11.4l-.8 12H7.1L6.3 8Zm2 1.8.55 8.4h6.3l.55-8.4H8.3Zm2.2 1.5h1.6v5.4h-1.6v-5.4Zm3.4 0h1.6v5.4h-1.6v-5.4Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* ── Modal: criar / editar ── */}
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

            <form className="catalog-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                    {field.error && <span className="catalog-field-error">{field.error}</span>}
                  </div>
                ))}
              </div>

              <div className="catalog-form-actions" style={{ marginTop: "8px" }}>
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

      {/* ── Modal: confirmar exclusão ── */}
      {deleteTarget && (
        <div className="produto-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="produto-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="produto-modal-header">
              <div>
                <p className="produto-eyebrow">Excluir produto</p>
                <h2>Tem certeza?</h2>
              </div>
              <button
                type="button"
                className="produto-close-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                aria-label="Fechar modal"
              >×</button>
            </div>

            <p className="produto-confirm-text">
              Deseja realmente excluir <strong>{deleteTarget.nome}</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="produto-confirm-actions">
              <button type="button" className="catalog-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancelar
              </button>
              <button type="button" className="catalog-submit catalog-submit--danger" onClick={handleDeleteConfirmed} disabled={deleting}>
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}