import "./Pagination.css";

/**
 * Paginação compartilhada (CatalogPage e HomeVendedor).
 * Mesma lógica que existia dentro do CatalogPage: currentPage é 1-based.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) { start = 2; end = Math.min(4, totalPages - 1); }
    if (currentPage >= totalPages - 1) { start = Math.max(2, totalPages - 3); end = totalPages - 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const rawVisible = getVisiblePages();
  const visiblePages = rawVisible.filter((p) => p !== 1 && p !== totalPages);
  const showStartEllipsis = visiblePages.length > 0 && visiblePages[0] > 2;
  const showEndEllipsis = visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages - 1;

  const ellipsis = <span className="app-pagination-ellipsis">···</span>;

  return (
    <div className="app-pagination">
      <span className="app-pagination-info">
        Pág. {currentPage} de {totalPages}
      </span>

      <div className="app-pagination-controls">
        {/* Primeira */}
        <button
          type="button"
          className="app-pag-btn"
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
          type="button"
          className="app-pag-btn"
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
          type="button"
          className={`app-pag-btn ${currentPage === 1 ? "is-active" : ""}`}
          onClick={() => onPageChange(1)}
        >1</button>

        {showStartEllipsis && ellipsis}

        {visiblePages.map((page) => (
          <button
            type="button"
            key={page}
            className={`app-pag-btn ${currentPage === page ? "is-active" : ""}`}
            onClick={() => onPageChange(page)}
          >{page}</button>
        ))}

        {showEndEllipsis && ellipsis}

        {/* Última página */}
        <button
          type="button"
          className={`app-pag-btn ${currentPage === totalPages ? "is-active" : ""}`}
          onClick={() => onPageChange(totalPages)}
        >{totalPages}</button>

        {/* Próxima */}
        <button
          type="button"
          className="app-pag-btn"
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
          type="button"
          className="app-pag-btn"
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