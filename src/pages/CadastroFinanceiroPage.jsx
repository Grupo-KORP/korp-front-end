import { maskPhone } from "../utils/inputMasks";
import FormValidationNotice from "../components/ui/FormValidationNotice";
import RequiredMark from "../components/ui/RequiredMark";
import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/base-reset.css";
import "./VendedoresPage.css";
import "../components/catalog/CatalogPage.css";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import NavbarFinanceiro from "../layout/NavbarFinanceiro.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 5;


const emptyForm = { nome: "", email: "", fone: "", status: "Ativo" };

// ─── Paginação ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, darkMode }) {
  if (totalPages <= 1) return null;

  const textoS = darkMode ? "text-gray-400" : "text-gray-400";
  const borda = darkMode ? "border-gray-700" : "border-gray-200";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const hover = darkMode ? "hover:bg-gray-700 hover:text-white" : "hover:bg-blue-50 hover:text-blue-600";
  const textoM = darkMode ? "text-gray-300" : "text-gray-700";

  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) { start = 2; end = Math.min(4, totalPages - 1); }
    if (currentPage >= totalPages - 1) { start = Math.max(2, totalPages - 3); end = totalPages - 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // antes de showStartEllipsis / showEndEllipsis
  const rawVisible = getVisiblePages();
  const visiblePages = rawVisible.filter((p) => p !== 1 && p !== totalPages);

  const showStartEllipsis = visiblePages.length > 0 && visiblePages[0] > 2;
  const showEndEllipsis = visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages - 1;

  const btnBase = `flex items-center justify-center rounded-xl text-sm font-semibold
    transition-all duration-150 select-none border ${borda} ${cardBg} ${textoM} ${hover} w-9 h-9`;

  const btnActive = `flex items-center justify-center rounded-xl text-sm font-bold
    transition-all duration-150 select-none w-9 h-9
    border border-blue-600 text-white shadow-md`;

  const btnDisabled = `flex items-center justify-center rounded-xl text-sm font-semibold
    w-9 h-9 border ${borda} ${textoS} opacity-40 cursor-not-allowed
    ${darkMode ? "bg-gray-800" : "bg-white"}`;

  const activeStyle = { background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" };

  const ellipsis = (
    <span className={`flex items-center justify-center w-9 h-9 text-sm ${textoS}`}>···</span>
  );

  return (
    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borda}`}>
      <span className={`text-xs tracking-wider uppercase font-semibold ${textoS}`}>
        Pág. {currentPage} de {totalPages}
      </span>

      <div className="flex items-center gap-1.5">
        {/* primeira */}
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnBase} title="Primeira página">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Anterior */}
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnBase} title="Página anterior">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Página 1 */}
        <button onClick={() => onPageChange(1)}
          className={currentPage === 1 ? btnActive : btnBase}
          style={currentPage === 1 ? activeStyle : {}}>1
        </button>

        {showStartEllipsis && ellipsis}

        {visiblePages.map((page) => (
          <button key={page} onClick={() => onPageChange(page)}
            className={currentPage === page ? btnActive : btnBase}
            style={currentPage === page ? activeStyle : {}}>{page}
          </button>
        ))}

        {showEndEllipsis && ellipsis}

        {/* Última página */}
        {totalPages > 1 && (
          <button onClick={() => onPageChange(totalPages)}
            className={currentPage === totalPages ? btnActive : btnBase}
            style={currentPage === totalPages ? activeStyle : {}}>{totalPages}
          </button>
        )}

        {/* ▶ Próxima */}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnBase} title="Próxima página">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Última */}
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnBase} title="Última página">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function CadastroFinanceiroPage({ modeSelector }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShown = useRef(false);
  const [loading, setLoading] = useState(false);
  const [financeiros, setFinanceiros] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState(searchParams.get("busca") || "");

  const pageFromUrl = parseInt(searchParams.get("pagina") || "1", 10);
  const [currentPage, setCurrentPage] = useState(isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl);

  const { darkMode: modoEscuro } = useDarkMode();
  const { initialized, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (toastShown.current) return;
    if (!initialized) return;
    if (!isAuthenticated) {
      toastShown.current = true;
      toast.error("Sessão expirada. Faça login novamente.", {
        duration: 500,
        onAutoClose: () => navigate("/login"),
      });
      return;
    }
    if (!hasRole("ROLE_FINAN") && !hasRole("ROLE_ADMIN")) {
      toastShown.current = true;
      toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
      navigate("/vendedores/home");
    }
  }, [initialized, isAuthenticated, hasRole, navigate]);

  const fetchFinanceiros = useCallback(async (page, busca) => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/usuario/financeiros", {
        params: {
          page: page - 1, // Spring é 0-based
          size: PAGE_SIZE,
          sort: "nome",
          ...(busca ? { busca } : {}),
        },
      });
      setFinanceiros(data.content);
      setTotalPages(Math.max(1, data.totalPages));
      if (page > Math.max(1, data.totalPages)) setCurrentPage(Math.max(1, data.totalPages));
    } catch {
      toast.error("Erro ao carregar financeiros.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized || !isAuthenticated || (!hasRole("ROLE_FINAN") && !hasRole("ROLE_ADMIN"))) return;
    fetchFinanceiros(currentPage, search);
  }, [initialized, isAuthenticated, hasRole, currentPage, search, fetchFinanceiros]);

  const syncUrl = useCallback(
    (page, busca) => {
      const params = {};
      if (page > 1) params.pagina = String(page);
      if (busca) params.busca = busca;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  function handlePageChange(page) {
    setCurrentPage(page);
    syncUrl(page, search);
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    syncUrl(1, val);
  }

  const safePage = Math.min(currentPage, totalPages);
  const displayed = financeiros;

  /* classes de tema */
  const bg = modoEscuro ? "bg-[var(--app-page-bg-dark)]" : "bg-[var(--app-page-bg-light)]";
  const cardBg = modoEscuro ? "bg-gray-800" : "bg-white";
  const borda = modoEscuro ? "border-gray-700" : "border-gray-200";
  const textoP = modoEscuro ? "text-white" : "text-gray-900";
  const textoM = modoEscuro ? "text-gray-300" : "text-gray-800";
  const textoS = modoEscuro ? "text-gray-400" : "text-gray-400";
  const inputBg = modoEscuro
    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-300";
  const hover = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";



  function handleFormChange(e) {
    const { name, value } = e.target;
    const newValue = name === "fone" ? maskPhone(value) : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim() || form.nome.trim().split(/\s+/).length < 2)
      errs.nome = "Informe o nome completo.";
    if (!form.email || !form.email.includes("@"))
      errs.email = "Informe um e-mail válido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10)
      errs.fone = "Telefone inválido.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/usuario", {
        nome: form.nome.trim(), email: form.email.trim(), senha: "",
        telefone: form.fone, role: 2, ativo: form.status === "Ativo",
      });
      toast.success("Usuário do financeiro cadastrado com sucesso! Verifique o e-mail para receber a senha de acesso da conta!", { duration: 7000 });

      await fetchFinanceiros(currentPage, search);
      setForm(emptyForm);

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Erro ao cadastrar usuário do financeiro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`h-screen overflow-hidden flex flex-col ${bg} transition-colors duration-300`}
    >
      <NavbarFinanceiro />

      <div className="app-page-content flex-1 overflow-y-auto lg:overflow-hidden w-full">
        <div className="flex h-full w-full flex-col">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-4 items-stretch">

            {/* ── Tabela de Financeiros ── */}
            <div className="min-w-0 flex-1 flex flex-col">
              {/* Header */}
              <div className="app-page-header flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div className="app-page-heading">
                  <p data-page-eyebrow className="text-[10px] font-semibold tracking-widest text-blue-500 uppercase leading-none mt-0.5">
                    Colaboradores Cadastrados
                  </p>
                  <h1 className={`text-xl font-extrabold leading-tight ${textoP}`}>Usuários do financeiro</h1>
                </div>

                <div className="app-search relative w-full sm:max-w-xs md:max-w-sm xl:max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="PESQUISAR USUÁRIO"
                    value={search}
                    onChange={handleSearchChange}
                    className={`pl-9 pr-4 py-2 rounded-xl border text-[13px] placeholder-gray-400 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-300 w-full shadow-sm ${inputBg}`}
                  />
                </div>
              </div>

              <div className="catalog-table-card">
                <div className="catalog-section-title">
                  <span />
                  <h2>Equipe financeira</h2>
                </div>

                <div className="catalog-data-table vendedores-data-table" style={{
                  "--catalog-columns": "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
                }}>
                {/* Table header */}
                <div className="catalog-table-head vendedores-table-head">
                  <span>
                    Identificação dos Cadastros
                  </span>
                  <span>
                    Telefone
                  </span>
                  <span>
                    Status do Colaborador
                  </span>
                </div>

                {/* Rows */}
                <div className="catalog-table-body">
                  {loadingList ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <div key={i} className={`h-14 rounded-xl animate-pulse ${modoEscuro ? "bg-gray-700" : "bg-gray-100"}`} />
                    ))
                  ) : displayed.length === 0 ? (
                    <p className={`text-sm text-center py-8 ${textoS}`}>Nenhum usuário do financeiro encontrado.</p>
                  ) : (displayed.map((v) => (
                    <div key={v.idUsuario ?? v.email}

                      className="catalog-row vendedores-table-row"
                    >
                      {/* Identificação */}
                      <div className="catalog-identity vendedores-identity">
                        <span className="catalog-badge">
                            {v.nome?.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div className="catalog-identity-copy">
                          <span className="vendedores-name">{v.nome}</span>
                          <small>{v.email}</small>
                        </div>
                      </div>

                      {/* Vendas */}
                      <span className="catalog-centered">{maskPhone(v.telefone || "")}</span>

                      {/* Status do Colaborador */}
                      <span className={`inline-flex items-center justify-center justify-self-center w-fit text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${(v.ativo ?? v.status) === true || (v.ativo ?? v.status) === "true"
                        ? modoEscuro ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-100 text-green-700 border-green-200"
                        : modoEscuro ? "bg-red-900/40 text-red-400 border-red-800" : "bg-red-50 text-red-600 border-red-200"
                        }`}>
                        {(v.ativo ?? v.status) === true || (v.ativo ?? v.status) === "true" ? "Ativo" : "Inativo"}
                      </span>


                    </div>
                  )))}
                </div>

                {/* ── Paginação ── */}
                </div>
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  darkMode={modoEscuro}
                />
              </div>
            </div>

            {/* ── Painel de Cadastro ── */}
            <aside className="collaborator-registration-column">
              {modeSelector}
              <div className={`registration-panel collaborator-registration-panel w-full ${cardBg} flex flex-col transition-colors duration-300`}>
              <div className="registration-heading">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className={`text-xs font-extrabold tracking-widest uppercase ${textoM}`}>
                    Cadastrar usuário financeiro
                  </h3>
                </div>
                <p className={`text-[10px] tracking-wider uppercase ${textoS}`}>Formulário de Cadastro</p>
              </div>


              <form onSubmit={handleSubmit} noValidate className="registration-form flex flex-col gap-4">
                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Nome Completo<RequiredMark />
                  </label>
                  <input aria-required="true" name="nome" type="text" placeholder="Ex: Maria Silva" maxLength={100}
                    aria-invalid={Boolean(errors.nome)}
                    title={errors.nome || undefined}
                    value={form.nome} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.nome ? "border-red-400" : ""}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    E-mail TND<RequiredMark />
                  </label>
                  <input aria-required="true" name="email" type="email" placeholder="rafael.santos@tndbrasil.com" maxLength={60}
                    aria-invalid={Boolean(errors.email)}
                    title={errors.email || undefined}
                    value={form.email} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.email ? "border-red-400" : ""}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Telefone<RequiredMark />
                  </label>
                  <input aria-required="true" name="fone" type="tel" placeholder="(00) 00000-0000"
                    aria-invalid={Boolean(errors.fone)}
                    title={errors.fone || undefined}
                    value={form.fone} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.fone ? "border-red-400" : ""}`}
                  />
                </div>

                {/* Status do Colaborador */}
                <div>
                  <label htmlFor="status-colaborador" className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Status do Colaborador
                  </label>
                    <select
                      id="status-colaborador"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      disabled={loading}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg}`}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>

                </div>

                <div className="registration-form-footer">
                  <FormValidationNotice visible={Object.keys(errors).length > 0} />
                <div className="flex gap-2 mt-1">
                  <button data-ui-action type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}>
                    {loading ? "Aguarde..." : "Cadastrar"}
                  </button>
                </div>
                </div>
              </form>
            </div>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
