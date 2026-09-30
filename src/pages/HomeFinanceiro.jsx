import { calendarStyles } from "../components/ui/calendarStyles.js";
import { formatarStatusPagamento } from "../services/statusPagamento.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import NavbarFinanceiro from "../layout/NavbarFinanceiro.jsx";
import Pagination from "../components/pagination/pagination";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import { useAuth } from "../hooks/useAuth";
import { useBlocoPainel } from "../hooks/useBlocoPainel.js";
import {
  buscarResumoFinanceiro,
  buscarEvolucaoVendasFinanceiro,
  buscarRankingVendedoresFinanceiro,
  buscarPedidosFinanceiro,
} from "../services/api";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const HOJE = new Date();
const ANO_MIN = 2026;
const ANO_MAX = 2100;
const ANO_ATUAL = HOJE.getFullYear();
const MES_ATUAL_NUM = HOJE.getMonth() + 1;

const TAMANHO_PAGINA = 5;
const TAMANHO_PAGINA_PDF = 100;

const inteiroOuNulo = (valor) => {
  const n = parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
};

const formatarMoedaBR = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ══════════════════════════════════════════
   VALORES PADRÃO (enquanto os blocos carregam)
══════════════════════════════════════════ */
const RESUMO_VAZIO = {
  faturamentoTotalEstimado: 0,
  tendenciaFaturamento: "0%",
  totalVendas: 0,
  tendenciaVendas: "0",
  pagamentosPendentes: 0,
  qtdPagamentosPendentes: 0,
  comissoesPagas: 0,
  qtdVendasComissoesPagas: 0,
  comissaoAPagar: 0,
  qtdVendasComissaoAPagar: 0,
};

/* ══════════════════════════════════════════
   ÍCONES
══════════════════════════════════════════ */
const IconGrafico = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3v18h18M7 15l3.5-4 3 2.5L18 8" />
  </svg>
);

const IconCarrinho = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13H5.4M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const IconRelogio = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconConfirmado = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const IconMoeda = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8c-2.2 0-4 .9-4 2s1.8 2 4 2 4 .9 4 2-1.8 2-4 2m0-8V6m0 12v-2m0-10c1.5 0 2.8.5 3.5 1.3M8.5 16.7C9.2 17.5 10.5 18 12 18M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconRelatorio = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconCalendario = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
);

/* ══════════════════════════════════════════
   CARD DE MÉTRICA
══════════════════════════════════════════ */
function CardMetrica({ icone, tint, rotulo, valor, badge, sub, dark }) {
  const tintClasses = {
    blue: dark ? "bg-blue-900/50 text-blue-400" : "bg-blue-50 text-blue-600",
    green: dark ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-600",
    purple: dark ? "bg-purple-900/40 text-purple-400" : "bg-purple-50 text-purple-600",
    orange: dark ? "bg-orange-900/40 text-orange-400" : "bg-orange-50 text-orange-500",
  };

  return (
    <div
      className={`rounded-xl px-4 py-3.5 flex flex-col gap-1.5 shadow-sm transition-all duration-200
        ${dark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-bold tracking-widest uppercase ${dark ? "text-gray-400" : "text-gray-400"}`}>
          {rotulo}
        </span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${tintClasses[tint]}`}>
          {icone}
        </div>
      </div>

      <span className={`text-xl sm:text-2xl font-extrabold leading-none ${dark ? "text-white" : "text-gray-900"}`}>
        {valor}
      </span>

      {badge && (
        <p className={`text-[10px] font-semibold ${badge.startsWith("-") ? "text-red-500" : "text-green-500"}`}>{badge}</p>
      )}
      {sub && (
        <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function HomeFinanceiro() {
  const { darkMode: modoEscuro } = useDarkMode();
  const navigate = useNavigate();
  const { initialized, isAuthenticated, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Estado vindo da URL: ?ano=&mes=&pagina= (sem mes: mês atual) ── */
  const mesParam = inteiroOuNulo(searchParams.get("mes"));
  const anoParam = inteiroOuNulo(searchParams.get("ano"));
  const paginaAtual = Math.max(inteiroOuNulo(searchParams.get("pagina")) ?? 1, 1);
  const mesNumero = mesParam !== null && mesParam >= 1 && mesParam <= 12 ? mesParam : MES_ATUAL_NUM;
  const anoSelecionado = anoParam !== null && anoParam >= ANO_MIN && anoParam <= ANO_MAX ? anoParam : ANO_ATUAL;
  const mesSelecionado = MESES[mesNumero - 1];

  /* patch: chave -> valor; null/undefined/"" remove o param da URL */
  const atualizarParams = useCallback((patch) => {
    setSearchParams((atuais) => {
      const proximos = new URLSearchParams(atuais);
      Object.entries(patch).forEach(([chave, valor]) => {
        if (valor === null || valor === undefined || valor === "") proximos.delete(chave);
        else proximos.set(chave, String(valor));
      });
      return proximos;
    }, { replace: true });
  }, [setSearchParams]);

  const [mostrarMeses, setMostrarMeses] = useState(false);
  const [mesRascunho, setMesRascunho] = useState(mesSelecionado);
  const [anoRascunho, setAnoRascunho] = useState(anoSelecionado);
  const [mostrarAnos, setMostrarAnos] = useState(false);
  const inicioAnos = ANO_MIN + Math.floor((anoRascunho - ANO_MIN) / 12) * 12;
  const [emitindoRelatorio, setEmitindoRelatorio] = useState(false);
  const relatorioEmAndamento = useRef(false);

  const refDropdown = useRef(null);
  const toastShown = useRef(false);

  useEffect(() => {
    function fecharAoClicarFora(e) {
      if (refDropdown.current && !refDropdown.current.contains(e.target)) {
        setMostrarMeses(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  useEffect(() => {
    if (toastShown.current) return;
    if (!initialized) return;
    if (!isAuthenticated) {
      toastShown.current = true;
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }
    if (!hasRole("ROLE_FINAN") && !hasRole("ROLE_ADMIN")) {
      toastShown.current = true;
      toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
      navigate("/vendedores/home");
    }
  }, [initialized, isAuthenticated, hasRole, navigate]);

  const autorizado = initialized && isAuthenticated && (hasRole("ROLE_FINAN") || hasRole("ROLE_ADMIN"));
  const filtro = { ano: anoSelecionado, mes: mesNumero };

  /* Um endpoint por bloco; todos recarregam quando o período muda, e só a tabela quando a página muda */
  const { dados: resumo } = useBlocoPainel(
    buscarResumoFinanceiro, filtro, autorizado, "Não foi possível carregar os indicadores.");
  const { dados: evolucao } = useBlocoPainel(
    buscarEvolucaoVendasFinanceiro, filtro, autorizado, "Não foi possível carregar a evolução de vendas.");
  const { dados: ranking } = useBlocoPainel(
    buscarRankingVendedoresFinanceiro, filtro, autorizado, "Não foi possível carregar o ranking de vendedores.");
  const { dados: pedidosPagina, carregando: carregandoPedidos } = useBlocoPainel(
    buscarPedidosFinanceiro,
    { ...filtro, pagina: paginaAtual, tamanho: TAMANHO_PAGINA },
    autorizado,
    "Não foi possível carregar os pedidos.",
  );

  const totalPaginasPedidos = pedidosPagina?.totalPages ?? 1;

  /* página da URL além do fim (URL editada, período com menos pedidos): volta para a última */
  useEffect(() => {
    if (pedidosPagina && paginaAtual > Math.max(totalPaginasPedidos, 1)) {
      atualizarParams({ pagina: totalPaginasPedidos > 1 ? totalPaginasPedidos : null });
    }
  }, [pedidosPagina, paginaAtual, totalPaginasPedidos, atualizarParams]);

  const dados = {
    ...RESUMO_VAZIO,
    ...(resumo || {}),
    evolucaoVendas: evolucao || [],
    rankingVendedores: ranking || [],
    ultimosPedidos: pedidosPagina?.content || [],
  };
  const periodoSelecionado = `${mesSelecionado} de ${anoSelecionado}`;

  const statusEstilo = {
    Pago: "bg-green-50 text-green-600 border-green-200",
    Pendente: "bg-orange-50 text-orange-500 border-orange-200",
    "Em Análise": "bg-blue-50 text-blue-600 border-blue-200",
  };

  function confirmarPeriodo() {
    atualizarParams({ ano: anoRascunho, mes: MESES.indexOf(mesRascunho) + 1, pagina: null });
    setMostrarMeses(false);
    refDropdown.current?.querySelector("button")?.focus();
  }

  function mudarPagina(pagina) {
    atualizarParams({ pagina: pagina > 1 ? pagina : null });
  }

  /* PDF: precisa de TODOS os pedidos do período, não só da página atual */
  async function buscarTodosPedidosDoPeriodo() {
    const pedidos = [];
    let pagina = 1;
    let totalPages = 1;

    do {
      const resposta = await buscarPedidosFinanceiro({ ...filtro, pagina, tamanho: TAMANHO_PAGINA_PDF });
      pedidos.push(...(resposta?.content || []));
      totalPages = resposta?.totalPages ?? 1;
      pagina += 1;
    } while (pagina <= totalPages);

    return pedidos;
  }

  async function emitirRelatorio() {
    if (relatorioEmAndamento.current) return;
    relatorioEmAndamento.current = true;
    setEmitindoRelatorio(true);
    try {
      const ultimosPedidos = await buscarTodosPedidosDoPeriodo();
      const { criarRelatorioFinanceiro } = await import("../services/relatorioFinanceiro.js");
      const doc = await criarRelatorioFinanceiro({ dados: { ...dados, ultimosPedidos }, periodo: periodoSelecionado });
      const mes = String(mesNumero).padStart(2, "0");
      await doc.save(`relatorio-financeiro-${anoSelecionado}-${mes}.pdf`, { returnPromise: true });
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório financeiro", error);
      toast.error("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      relatorioEmAndamento.current = false;
      setEmitindoRelatorio(false);
    }
  }

  /* classes de tema */
  const bg = modoEscuro ? "bg-gray-900" : "bg-gray-100";
  const cardBg = modoEscuro ? "bg-gray-800" : "bg-white";
  const borda = modoEscuro ? "border-gray-700" : "border-gray-100";
  const textoP = modoEscuro ? "text-white" : "text-gray-900";
  const textoS = modoEscuro ? "text-gray-400" : "text-gray-400";
  const textoM = modoEscuro ? "text-gray-300" : "text-gray-800";
  const hover = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const gridStroke = modoEscuro ? "#374151" : "#e5e7eb";
  const coresCalendario = calendarStyles(modoEscuro);
  const axisStroke = modoEscuro ? "#6b7280" : "#9ca3af";
  const tooltipStyle = {
    background: modoEscuro ? "#1f2937" : "#ffffff",
    border: `1px solid ${modoEscuro ? "#374151" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 12,
    color: modoEscuro ? "#f3f4f6" : "#1f2937",
  };

  const maxRanking = Math.max(1, ...dados.rankingVendedores.map((v) => Number(v.valor) || 0));

  return (
    <div className={`h-screen flex flex-col ${bg} transition-colors duration-300`}>
      <NavbarFinanceiro />

      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        <div className="flex flex-col px-3 py-4 sm:px-6 sm:py-6">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-0.5">
                Painel Financeiro
              </p>
              <h1 className={`text-xl sm:text-2xl font-extrabold ${textoP}`}>Visão consolidada de vendas e comissões</h1>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative" ref={refDropdown} onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setMostrarMeses(false);
                  refDropdown.current?.querySelector("button")?.focus();
                }
              }}>
                <button
                  type="button"
                  aria-label="Selecionar mês e ano"
                  aria-expanded={mostrarMeses}
                  aria-controls="filtro-periodo-financeiro"
                  onClick={() => {
                    if (!mostrarMeses) {
                      setMesRascunho(mesSelecionado);
                      setAnoRascunho(anoSelecionado);
                      setMostrarAnos(false);
                    }
                    setMostrarMeses((v) => !v);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors shadow-sm
                    ${coresCalendario.trigger} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                >
                  <IconCalendario />
                  {periodoSelecionado}
                  <svg className={`w-4 h-4 transition-transform ${mostrarMeses ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {mostrarMeses && (
                  <div id="filtro-periodo-financeiro" role="group" aria-label="Selecionar mês e ano" className={`absolute left-0 sm:left-auto sm:right-0 mt-2 z-20 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-lg border p-4
                    ${cardBg} ${borda}`}>
                    <div className={`rounded-lg py-1.5 mb-3 text-center text-xs font-medium ${coresCalendario.selected}`}>Por mês</div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        aria-label={mostrarAnos ? "Anos anteriores" : "Ano anterior"}
                        disabled={mostrarAnos ? inicioAnos <= ANO_MIN : anoRascunho <= ANO_MIN}
                        onClick={() => setAnoRascunho((ano) => Math.max(ANO_MIN, ano - (mostrarAnos ? 12 : 1)))}
                        className={`p-1.5 rounded-lg transition disabled:opacity-25 disabled:cursor-not-allowed ${coresCalendario.text} ${coresCalendario.hover}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => setMostrarAnos((valor) => !valor)} className={`text-sm font-medium px-3 py-1 rounded-lg ${coresCalendario.text} ${coresCalendario.hover}`} aria-live="polite">
                        {mostrarAnos ? `${inicioAnos} – ${inicioAnos + 11}` : anoRascunho}
                      </button>
                      <button
                        type="button"
                        aria-label={mostrarAnos ? "Próximos anos" : "Próximo ano"}
                        onClick={() => setAnoRascunho((ano) => ano + (mostrarAnos ? 12 : 1))}
                        className={`p-1.5 rounded-lg transition ${coresCalendario.text} ${coresCalendario.hover}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {mostrarAnos ? Array.from({ length: 12 }, (_, i) => inicioAnos + i).map((ano) => (
                      <button
                        type="button"
                        key={ano}
                        onClick={() => { setAnoRascunho(ano); setMostrarAnos(false); }}
                        aria-pressed={ano === anoRascunho}
                        className={`w-full py-2 rounded-lg text-xs transition-colors
                          ${ano === anoRascunho ? coresCalendario.selected : `${coresCalendario.text} ${coresCalendario.hover}`}`}
                      >
                        {ano}
                      </button>
                    )) : MESES.map((mes) => (
                      <button
                        type="button"
                        key={mes}
                        onClick={() => setMesRascunho(mes)}
                        aria-label={`${mes} de ${anoRascunho}`}
                        aria-pressed={mes === mesRascunho}
                        className={`w-full py-2 rounded-lg text-xs transition-colors
                          ${mes === mesRascunho ? coresCalendario.selected : `${coresCalendario.text} ${coresCalendario.hover}`}`}
                      >
                        {mes.slice(0, 3)}
                      </button>
                    ))}
                    </div>
                    <div className={`flex items-center justify-between border-t pt-3 ${borda}`}>
                      <button type="button" onClick={() => setMesRascunho(null)} className={`text-xs ${coresCalendario.text} ${coresCalendario.hover}`}>Limpar</button>
                      <button type="button" disabled={!mesRascunho} onClick={confirmarPeriodo} className={`rounded-lg px-4 py-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${coresCalendario.confirm}`}>Confirmar</button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={emitindoRelatorio}
                aria-busy={emitindoRelatorio}
                onClick={emitirRelatorio}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}
              >
                <IconRelatorio />
                {emitindoRelatorio ? "Gerando PDF..." : "Emitir relatório"}
              </button>
            </div>
          </div>

          {/* ── Cards de métricas ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            <CardMetrica
              icone={<IconGrafico />}
              tint="blue"
              rotulo="Faturamento Total Estimado"
              valor={formatarMoedaBR(dados.faturamentoTotalEstimado)}
              badge={`${dados.tendenciaFaturamento} vs mês ant.`}
              dark={modoEscuro}
            />
            <CardMetrica
              icone={<IconCarrinho />}
              tint="green"
              rotulo="Total de Vendas"
              valor={dados.totalVendas}
              badge={`${dados.tendenciaVendas} vs mês ant.`}
              dark={modoEscuro}
            />
            <CardMetrica
              icone={<IconRelogio />}
              tint="purple"
              rotulo="Pagamentos Pendentes"
              valor={formatarMoedaBR(dados.pagamentosPendentes)}
              sub={`${dados.qtdPagamentosPendentes} pagamentos aguardando`}
              dark={modoEscuro}
            />
            <CardMetrica
              icone={<IconConfirmado />}
              tint="green"
              rotulo="Comissões Pagas"
              valor={formatarMoedaBR(dados.comissoesPagas)}
              sub={`Referente a ${dados.qtdVendasComissoesPagas} vendas`}
              dark={modoEscuro}
            />
            <CardMetrica
              icone={<IconMoeda />}
              tint="orange"
              rotulo="Comissão a Pagar"
              valor={formatarMoedaBR(dados.comissaoAPagar)}
              sub={`Referente a ${dados.qtdVendasComissaoAPagar} vendas`}
              dark={modoEscuro}
            />
          </div>

          {/* ── Evolução de vendas + Comissão por vendedor ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-5">

            {/* Evolução de vendas */}
            <div className={`${cardBg} rounded-2xl shadow-sm p-5 flex flex-col`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-blue-700" />
                  <h2 className={`text-base font-bold ${textoM}`}>Evolução de Vendas</h2>
                </div>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">Ver detalhes</button>
              </div>
              <p className={`text-[10px] uppercase tracking-wider ${textoS} mb-3`}>
                Faturamento dos últimos 6 meses
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados.evolucaoVendas} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisStroke }} axisLine={{ stroke: gridStroke }} tickLine={false} />
                    <YAxis
                      yAxisId="faturamento"
                      tick={{ fontSize: 11, fill: axisStroke }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      width={56}
                    />
                    <YAxis
                      yAxisId="quantidade"
                      orientation="right"
                      allowDecimals={false}
                      domain={[0, "auto"]}
                      tick={{ fontSize: 11, fill: axisStroke }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name, item) => [
                        item.dataKey === "valor"
                          ? formatarMoedaBR(value)
                          : `${Number(value).toLocaleString("pt-BR")} ${Number(value) === 1 ? "venda" : "vendas"}`,
                        name,
                      ]}
                    />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      yAxisId="faturamento"
                      name="Faturamento (R$)"
                      stroke="#2d5fa6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2d5fa6" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="quantidadeVendas"
                      yAxisId="quantidade"
                      name="Quantidade de vendas"
                      stroke="#10b981"
                      strokeDasharray="5 3"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#10b981" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comissão por vendedor */}
            <div className={`${cardBg} rounded-2xl shadow-sm p-5 flex flex-col`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-blue-700" />
                  <h2 className={`text-base font-bold ${textoM}`}>Comissão por Vendedor</h2>
                </div>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">Ver todos vendedores</button>
              </div>
              <p className={`text-[10px] uppercase tracking-wider ${textoS} mb-3`}>
                Ranking dos vendedores · {periodoSelecionado}
              </p>

              <div className="flex flex-col gap-3 flex-1 justify-center">
                {dados.rankingVendedores.length === 0 && (
                  <p className={`text-xs text-center ${textoS}`}>Nenhuma comissão no período.</p>
                )}
                {dados.rankingVendedores.map((v, i) => (
                  <div key={v.idVendedor ?? v.nome} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold w-5 flex-shrink-0 ${textoS}`}>{i + 1}º</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate mb-1 ${textoM}`}>{v.nome}</p>
                      <div className={`h-2 rounded-full w-full ${modoEscuro ? "bg-gray-700" : "bg-gray-100"}`}>
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(v.valor / maxRanking) * 100}%`,
                            background: "linear-gradient(90deg, #1a3a7a 0%, #2d5fa6 100%)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <p className={`text-xs leading-tight font-bold ${textoM}`}>{formatarMoedaBR(v.valor)}</p>
                      <p className={`text-[10px] leading-tight ${modoEscuro ? "text-gray-400" : "text-gray-500"}`}>
                        {v.quantidadeVendas == null
                          ? "Quantidade indisponível"
                          : `${Number(v.quantidadeVendas).toLocaleString("pt-BR")} ${Number(v.quantidadeVendas) === 1 ? "venda" : "vendas"}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Últimos pedidos processados ── */}
          <div className={`${cardBg} rounded-2xl shadow-sm p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-1 h-5 rounded-full bg-blue-700" />
                  <h2 className={`text-base font-bold ${textoM}`}>Últimos Pedidos Processados</h2>
                </div>
                <p className={`text-[10px] uppercase tracking-wider ${textoS}`}>Pedidos de {periodoSelecionado}</p>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 whitespace-nowrap">Ver todos os pedidos</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr>
                    {["Código do Pedido", "Vendedor", "Cliente", "Valor Faturado", "Comissão", "Pagamento", "Status"].map((col) => (
                      <th
                        key={col}
                        className={`text-left text-[9px] font-bold tracking-widest uppercase px-3 py-2 ${textoS}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={carregandoPedidos ? "opacity-60" : ""}>
                  {dados.ultimosPedidos.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`px-3 py-6 text-center text-xs ${textoS}`}>
                        {carregandoPedidos ? "Carregando pedidos..." : "Nenhum pedido no período."}
                      </td>
                    </tr>
                  )}
                  {dados.ultimosPedidos.map((p) => (
                    <tr key={p.idPedido ?? p.codigo} className={`transition-colors ${hover}`}>
                      <td className={`px-3 py-3 text-xs font-bold ${textoM}`}>{p.codigo}</td>
                      <td className={`px-3 py-3 text-xs ${textoM}`}>{p.vendedor}</td>
                      <td className={`px-3 py-3 text-xs ${textoM}`}>{p.cliente}</td>
                      <td className={`px-3 py-3 text-xs font-semibold ${textoM}`}>{formatarMoedaBR(p.valorFaturado)}</td>
                      <td className={`px-3 py-3 text-xs font-semibold ${textoM}`}>{formatarMoedaBR(p.comissao)}</td>
                      <td className={`px-3 py-3 text-xs ${textoS}`}>{p.pagamento}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border ${statusEstilo[p.status] ?? statusEstilo.Pendente}`}>
                          {formatarStatusPagamento(p.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginaAtual}
              totalPages={totalPaginasPedidos}
              onPageChange={mudarPagina}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
