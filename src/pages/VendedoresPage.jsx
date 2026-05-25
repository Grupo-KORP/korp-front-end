import React, { useEffect, useRef, useState, useCallback } from "react";
import Alert from "../components/ui/Alert";
import { api, verificarSeFinanceiroEAdmin, verificarToken } from "../services/api.js";
import NavbarVendedor from "../layout/NavbarFinanceiro.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 5;


const emptyForm = { nome: "", email: "", fone: "", comissao: "30%", status: "Ativo" };

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
export default function VendedoresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShown = useRef(false);
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState(searchParams.get("busca") || "");

  const pageFromUrl = parseInt(searchParams.get("pagina") || "1", 10);
  const [currentPage, setCurrentPage] = useState(isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl);

  const { darkMode: modoEscuro } = useDarkMode();

  useEffect(() => {
    if (toastShown.current) return;
    if (!verificarToken()) {
      toastShown.current = true;
      toast.error("Sessão expirada. Faça login novamente.", {
        duration: 500,
        onAutoClose: () => navigate("/login"),
      });
      return;
    }
    if (!verificarSeFinanceiroEAdmin()) {
      toastShown.current = true;
      toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
      navigate("/vendedores/home");
    }
  }, []);

  const fetchVendedores = useCallback(async (page, busca) => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/usuario/vendedores", {
        params: {
          page: page - 1, // Spring é 0-based
          size: PAGE_SIZE,
          sort: "nome",
          ...(busca ? { busca } : {}),
        },
      });
      setVendedores(data.content);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Erro ao carregar vendedores.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!verificarToken()) return;
    fetchVendedores(currentPage, search);
  }, [currentPage, search, fetchVendedores]);

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
  const displayed = vendedores;

  /* classes de tema */
  const bg = modoEscuro ? "bg-gray-900" : "";
  const cardBg = modoEscuro ? "bg-gray-800" : "bg-white";
  const borda = modoEscuro ? "border-gray-700" : "border-gray-200";
  const textoP = modoEscuro ? "text-white" : "text-gray-900";
  const textoM = modoEscuro ? "text-gray-300" : "text-gray-800";
  const textoS = modoEscuro ? "text-gray-400" : "text-gray-400";
  const inputBg = modoEscuro
    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-300";
  const hover = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";

  function maskPhone(raw) {
    raw = raw.replace(/\D/g, "").slice(0, 11);
    if (raw.length > 7) return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    if (raw.length > 2) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return raw;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    const newValue = name === "fone" ? maskPhone(value) : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim() || form.nome.trim().split(" ").length < 2)
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

    const payload = {
      nome: form.nome.toUpperCase(),
      email: form.email,
      senha: "",
      telefone: form.fone,
      role: 3, 
      percentualComissao: parseFloat(form.comissao),
    };

    setLoading(true);
    try {
      const response = await api.post(`/usuario`, payload);
      await fetchVendedores(currentPage, search);
      toast.success(
        "Vendedor cadastrado com sucesso! Verifique o e-mail para receber a senha de acesso da conta!.",
        { duration: 7000 }
      );
      setForm(emptyForm);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      if (error.status === 409) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao cadastrar vendedor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(v) {
    setEditingId(v.email);
    setForm({
      nome: v.nome,
      email: v.email,
      fone: v.telefone ?? "",
      comissao: v.percentualComissao != null ? `${v.percentualComissao}%` : "30%",
      status: "Ativo",
    });
    setErrors({});
  }

  function handleDelete(id) {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  return (
    <div
      className={`h-screen overflow-hidden flex flex-col ${bg} transition-colors duration-300`}
      style={!modoEscuro ? { background: "linear-gradient(120deg, #e0e7ff, #f8fafc)" } : undefined}
    >
      <NavbarVendedor />

      <div className="flex-1 overflow-y-auto lg:overflow-hidden w-full px-5 py-4 sm:py-5">
        <div className="flex h-full w-full flex-col">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-4 items-stretch">

            {/* ── Tabela de Vendedores ── */}
            <div className="min-w-0 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="pl-4 sm:pl-6">
                  <h1 className={`text-xl font-extrabold leading-tight ${textoP}`}>Painel de vendedores</h1>
                  <p className="text-[10px] font-semibold tracking-widest text-blue-500 uppercase leading-none mt-0.5">
                    Colaboradores Cadastrados
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs md:max-w-sm xl:max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="PESQUISAR VENDEDOR"
                    value={search}
                    onChange={handleSearchChange}
                    className={`pl-9 pr-4 py-2 rounded-xl border text-[13px] placeholder-gray-400 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-300 w-full shadow-sm ${inputBg}`}
                  />
                </div>
              </div>

              <div className={`${cardBg} rounded-2xl shadow-sm p-4 sm:p-6 transition-colors duration-300 flex min-h-0 flex-col flex-1`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 rounded-full bg-blue-700" />
                  <h2 className={`text-lg font-bold ${textoM}`}>Base de vendedores</h2>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-4 gap-4 px-2 mb-2">
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${textoS}`}>
                    Identificação dos Cadastros
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase text-center ${textoS}`}>
                    Vendas Realizadas
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase text-center whitespace-nowrap ${textoS}`}>
                    Status do Colaborador
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase text-center ${textoS}`}>
                    Ferramentas
                  </span>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-1 flex-1">
                  {loadingList ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <div key={i} className={`h-14 rounded-xl animate-pulse ${modoEscuro ? "bg-gray-700" : "bg-gray-100"}`} />
                    ))
                  ) : displayed.length === 0 ? (
                    <p className={`text-sm text-center py-8 ${textoS}`}>Nenhum vendedor encontrado.</p>
                  ) : (displayed.map((v) => (
                    <div key={v.email}
                      className={`grid grid-cols-4 gap-4 items-center px-2 py-3.5 rounded-xl ${hover} transition-colors group`}
                    >
                      {/* Identificação */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${modoEscuro ? "bg-blue-900/50" : "bg-blue-50"}`}>
                          <span className="text-xs font-bold text-blue-500">
                            {v.nome?.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${textoM}`}>{v.nome}</p>
                          <p className={`text-xs ${textoS}`}>{v.email}</p>
                        </div>
                      </div>

                      {/* Vendas */}
                      <span className={`text-sm font-bold text-center ${textoM}`}>{v.vendasEfetivadas ?? 0}</span>

                      {/* Status do Colaborador */}
                      <span className={`text-sm font-bold text-center ${textoM}`}>{v.status ?? "Ativo"}</span>

                      {/* Ferramentas */}
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(v)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${textoS} hover:text-blue-500 ${modoEscuro ? "hover:bg-blue-900/40" : "hover:bg-blue-50"}`}
                          aria-label="Editar">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 018.586 12.5L15.232 5.232z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(v.id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${textoS} hover:text-red-500 ${modoEscuro ? "hover:bg-red-900/30" : "hover:bg-red-50"}`}
                          aria-label="Excluir">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )))}
                </div>

                {/* ── Paginação ── */}
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  darkMode={modoEscuro}
                />
              </div>
            </div>

            {/* ── Painel de Cadastro ── */}
            <div className={`w-full lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 ${cardBg} rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-5 transition-colors duration-300`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className={`text-xs font-extrabold tracking-widest uppercase ${textoM}`}>
                    {editingId ? "Editar Vendedor" : "Cadastrar Vendedor"}
                  </h3>
                </div>
                <p className={`text-[10px] tracking-wider uppercase ${textoS}`}>Formulário de Cadastro</p>
              </div>

              {success && <Alert type="success" message={success} />}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Nome Completo
                  </label>
                  <input name="nome" type="text" placeholder="Ex: Maria Silva" maxLength={100}
                    value={form.nome} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.nome ? "border-red-400" : ""}`}
                  />
                  {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    E-mail TND
                  </label>
                  <input name="email" type="email" placeholder="rafael.santos@tndbrasil.com" maxLength={60}
                    value={form.email} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.email ? "border-red-400" : ""}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Telefone
                  </label>
                  <input name="fone" type="tel" placeholder="(00) 0000-0000"
                    value={form.fone} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.fone ? "border-red-400" : ""}`}
                  />
                  {errors.fone && <p className="text-xs text-red-500 mt-1">{errors.fone}</p>}
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Percentual de Comissão
                  </label>
                  <input name="comissao" type="text" placeholder="30%"
                    value={form.comissao} onChange={handleFormChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                    Status do Colaborador
                  </label>
                  {editingId ? (
                    <div className="relative">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none cursor-pointer ${inputBg}`}
                      >
                        <option>Ativo</option>
                        <option>Inativo</option>
                      </select>
                      <svg
                        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textoS}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value="Ativo"
                      readOnly
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none cursor-not-allowed ${inputBg}`}
                    />
                  )}
                </div>

                <div className="flex gap-2 mt-1">
                  {editingId && (
                    <button type="button" onClick={handleCancel}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${borda} ${textoS} ${hover}`}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}>
                    {loading ? "Aguarde..." : editingId ? "Salvar" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
