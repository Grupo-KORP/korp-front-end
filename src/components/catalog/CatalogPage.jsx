import { useEffect, useState, useState } from "react";
import NavbarVendedor from "../../layout/NavbarVendedor";
import "./CatalogPage.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.15 7.25 4.18 4.18-1.27 1.27-4.18-4.18 1.27-1.27Z" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9.2L20 7.8V21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.9V9h4.1L14 4.9ZM6 5v14h12v-8h-6V5H6Zm2 8h8v1.7H8V13Zm0 3h6v1.7H8V16Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16.7 15.8 5.9l2.3 2.3L7.3 19H5v-2.3Zm14.4-9.8-2.3-2.3.7-.7a1.5 1.5 0 0 1 2.1 0l.2.2a1.5 1.5 0 0 1 0 2.1l-.7.7Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6l.8 2H20v1.8H4V5h4.2L9 3Zm-2.7 5h11.4l-.8 12H7.1L6.3 8Zm2 1.8.55 8.4h6.3l.55-8.4H8.3Zm2.2 1.5h1.6v5.4h-1.6v-5.4Zm3.4 0h1.6v5.4h-1.6v-5.4Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.2 9.4 4.8 4.8 4.8-4.8 1.2 1.2-6 6-6-6 1.2-1.2Z" />
    </svg>
  );
}

// ─── Paginação ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(2, currentPage - 1);
    let end   = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2)             { start = 2; end = Math.min(4, totalPages - 1); }
    if (currentPage >= totalPages - 1){ start = Math.max(2, totalPages - 3); end = totalPages - 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const rawVisible   = getVisiblePages();
  const visiblePages = rawVisible.filter((p) => p !== 1 && p !== totalPages);
  const showStartEllipsis = visiblePages.length > 0 && visiblePages[0] > 2;
  const showEndEllipsis   = visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages - 1;

  const ellipsis = <span className="catalog-pagination-ellipsis">···</span>;

  return (
    <div className="catalog-pagination">
      <span className="catalog-pagination-info">
        Pág. {currentPage} de {totalPages}
      </span>

      <div className="catalog-pagination-controls">
        {/* Primeira */}
        <button
          className="catalog-pag-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Primeira página"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Anterior */}
        <button
          className="catalog-pag-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Página anterior"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Página 1 */}
        <button
          className={`catalog-pag-btn ${currentPage === 1 ? "is-active" : ""}`}
          onClick={() => onPageChange(1)}
        >1</button>

        {showStartEllipsis && ellipsis}

        {visiblePages.map((page) => (
          <button
            key={page}
            className={`catalog-pag-btn ${currentPage === page ? "is-active" : ""}`}
            onClick={() => onPageChange(page)}
          >{page}</button>
        ))}

        {showEndEllipsis && ellipsis}

        {/* Última página (se > 1) */}
        {totalPages > 1 && (
          <button
            className={`catalog-pag-btn ${currentPage === totalPages ? "is-active" : ""}`}
            onClick={() => onPageChange(totalPages)}
          >{totalPages}</button>
        )}

        {/* Próxima */}
        <button
          className="catalog-pag-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Próxima página"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Última */}
        <button
          className="catalog-pag-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Última página"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 5l7 7-7 7M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FormField({ field, onChange }) {
  const isAuto   = field.readOnly;
  const hasError = !!field.error;
  const cls = [
    "catalog-form-field",
    isAuto   ? "is-auto"   : "",
    hasError ? "has-error" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <span>
        {field.label}
        {field.loading && <span className="catalog-field-spinner" />}
      </span>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={field.value || ""}
          disabled={field.readOnly}
          onChange={onChange}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type || "text"}
          placeholder={field.placeholder}
          value={field.value || ""}
          readOnly={field.readOnly}
          onChange={onChange}
        />
      )}

      {hasError && <span className="catalog-field-error">{field.error}</span>}
    </div>
  );
}

function renderFields(fields, onChange) {
  const result = [];
  let i = 0;
  while (i < fields.length) {
    const field = fields[i];
    if (field.pair === "start" && fields[i + 1]?.pair === "end") {
      result.push(
        <div className="catalog-form-row" key={field.name}>
          <FormField field={field}         onChange={onChange} />
          <FormField field={fields[i + 1]} onChange={onChange} />
        </div>
      );
      i += 2;
    } else {
      result.push(<FormField key={field.name} field={field} onChange={onChange} />);
      i++;
    }
  }
  return result;
}

export default function CatalogPage({
  eyebrow,
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  tableTitle,
  tableColumns,
  rows,
  loadingRows = false,
  pageSize = 5,
  // paginação
  currentPage,
  totalPages,
  onPageChange,
  moreLabel,
  onRowClick,
  // form
  formTitle,
  formTitleEdit,
  formSubtitle = "Formulário de Cadastro",
  fields,
  extraFormContent,
  submitLabel = "Cadastrar",
  onFieldChange,
  onSubmit,
  onCancel,
  isEditing = false,
  submitDisabled = false,
  deleteEntityLabel = "registro",
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    document.body.classList.add("catalog-body");
    return () => document.body.classList.remove("catalog-body");
  }, []);

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTarget.onDelete?.();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const activeFormTitle = isEditing && formTitleEdit ? formTitleEdit : formTitle;
  const hasPagination   = totalPages != null && onPageChange != null;

  return (
    <div className="catalog-shell">
      <NavbarVendedor />

      <div className="catalog-page">

        {/* ── Coluna esquerda ── */}
        <div className="catalog-left">

          {/* Título + Search */}
          <div className="catalog-topbar">
            <div className="catalog-title-block">
              <p>{eyebrow}</p>
              <h1>{title}</h1>
            </div>

            <label className="catalog-search" aria-label={searchPlaceholder}>
              <SearchIcon />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={onSearchChange}
              />
            </label>
          </div>

          {/* Tabela */}
          <div className="catalog-table-card">
            <div className="catalog-section-title">
              <span />
              <h2>{tableTitle}</h2>
            </div>

            {/* Cabeçalho */}
            <div className="catalog-table-head">
              {tableColumns.map((col) => (
                <span key={col.label} style={{ flex: col.flex || "1" }}>
                  {col.label}
                </span>
              ))}
              <span style={{ flex: "0 0 100px", textAlign: "center" }}>
                Ferramentas
              </span>
            </div>

            {/* Linhas */}
            <div className="catalog-table-body">
              {loadingRows ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className="catalog-row-skeleton" />
                ))
              ) : rows.length === 0 ? (
                <p className="catalog-empty">Nenhum registro encontrado.</p>
              ) : rows.map((row) => (
                <div
                  className={`catalog-row ${row.onView ? "catalog-row-clickable" : ""}`}
                  key={row.id}
                  onClick={() => row.onView?.(row)}
                >
                  {/* Identidade */}
                  <div
                    className="catalog-identity"
                    style={{ flex: tableColumns[0]?.flex || "1" }}
                  >
                    <span className="catalog-badge">{row.badge ?? row.id}</span>
                    <div>
                      <strong>{row.title}</strong>
                      {row.subtitle && <small>{row.subtitle}</small>}
                    </div>
                  </div>

                  {row.cells.map((cell, idx) => (
                    <span
                      key={idx}
                      className={cell.className || "catalog-centered"}
                      style={{ flex: tableColumns[idx + 1]?.flex || "1" }}
                    >
                      {cell.value}
                    </span>
                  ))}

                  <div className="catalog-tools">
                    <button
                      type="button"
                      aria-label={`Editar ${row.title}`}
                      onClick={(e) => { e.stopPropagation(); row.onEdit?.(row); }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${row.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ row, label: deleteEntityLabel });
                      }}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {hasPagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            )}
          </div>
        </div>

        {/* ── Coluna direita: form ── */}
        <div className="catalog-right">
          <div className="catalog-form-card">
            <div className="catalog-form-heading">
              <div>
                <RegisterIcon />
                <h2>{activeFormTitle}</h2>
              </div>
              <p>{formSubtitle}</p>
            </div>

            <form
              className="catalog-form"
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
            >
              <div className="catalog-form-fields">
                {renderFields(fields, onFieldChange)}
              </div>

              {extraFormContent && (
                <div className="catalog-extra-form-content">
                  {extraFormContent}
                </div>
              )}

              <div className="catalog-form-actions">
                {isEditing && onCancel && (
                  <button
                    type="button"
                    className="catalog-cancel"
                    onClick={onCancel}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="catalog-submit"
                  disabled={submitDisabled}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* ── Modal de confirmação de exclusão ── */}
      {deleteTarget && (
        <div
          className="produto-modal-backdrop"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="produto-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="produto-modal-header">
              <div>
                <p className="produto-eyebrow">Excluir registro</p>
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
              Deseja realmente excluir <strong>{deleteTarget.title}</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="produto-confirm-actions">
              <button
                type="button"
                className="catalog-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="catalog-submit catalog-submit--danger"
                onClick={handleDeleteConfirmed}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}