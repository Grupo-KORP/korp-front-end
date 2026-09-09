import React, { useEffect, useRef, useState } from "react";
import NavbarFinanceiro from "../layout/NavbarFinanceiro.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { verificarSeFinanceiroEAdmin, verificarToken } from "../services/api.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const HOJE = new Date();

const formatarMoedaBR = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ══════════════════════════════════════════
   DADOS MOCKADOS — painel financeiro
   (equivalente ao vendasMockadas de ComissoesPage,
   até existir um endpoint /financeiro/home no backend)
══════════════════════════════════════════ */
const PAINEL_MOCK = {
  faturamentoTotalEstimado: 45600,
  tendenciaFaturamento: "+13,5%",
  totalVendas: 40,
  tendenciaVendas: "+8",
  pagamentosPendentes: 7850,
  qtdPagamentosPendentes: 4,
  comissoesPagas: 10600,
  qtdVendasComissoesPagas: 14,
  comissaoAPagar: 18450,
  qtdVendasComissaoAPagar: 26,
  evolucaoVendas: [
    { mes: "Out/25", valor: 180000 },
    { mes: "Nov/25", valor: 210000 },
    { mes: "Dez/25", valor: 195000 },
    { mes: "Jan/26", valor: 215000 },
    { mes: "Fev/26", valor: 235000 },
    { mes: "Mar/26", valor: 260000 },
  ],
  rankingVendedores: [
    { nome: "Maria Silva", valor: 4250 },
    { nome: "João Oliveira", valor: 3890 },
    { nome: "Ana Costa", valor: 2950 },
    { nome: "Rafael Santos", valor: 2180 },
    { nome: "Fernanda Lima", valor: 1680 },
  ],
  ultimosPedidos: [
    { codigo: "V1287", vendedor: "Maria Silva", cliente: "Tech Solutions Ltda", valorFaturado: 6500, comissao: 450, pagamento: "À vista", status: "Pago" },
    { codigo: "V1286", vendedor: "João Oliveira", cliente: "Global Corp", valorFaturado: 4200, comissao: 320, pagamento: "Parcelado 3x", status: "Pendente" },
    { codigo: "V1285", vendedor: "Ana Costa", cliente: "Innovation Tecnologia", valorFaturado: 8900, comissao: 620, pagamento: "Parcelado 5x", status: "Pago" },
    { codigo: "V1284", vendedor: "Rafael Santos", cliente: "Cyber Ltda", valorFaturado: 3750, comissao: 280, pagamento: "À vista", status: "Em Análise" },
    { codigo: "V1283", vendedor: "Fernanda Lima", cliente: "Microsoft Brasil", valorFaturado: 5800, comissao: 410, pagamento: "Parcelado 2x", status: "Pago" },
  ],
};

async function buscarPainelFinanceiro() {
  // TODO: trocar por chamada real (ex.: GET /financeiro/home) quando o backend expuser o endpoint.
  return PAINEL_MOCK;
}

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
        <p className="text-[10px] font-semibold text-green-500">{badge}</p>
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
  const [mesSelecionado, setMesSelecionado] = useState(MESES[HOJE.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(HOJE.getFullYear());
  const [mostrarMeses, setMostrarMeses] = useState(false);
  const [painel, setPainel] = useState(null);

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
    if (!verificarToken()) {
      toastShown.current = true;
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }
    if (!verificarSeFinanceiroEAdmin()) {
      toastShown.current = true;
      toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
      navigate("/vendedores/home");
    }
  }, [navigate]);

  useEffect(() => {
    if (!verificarToken() || !verificarSeFinanceiroEAdmin()) return;

    let ativo = true;
    buscarPainelFinanceiro({ ano: anoSelecionado, mes: MESES.indexOf(mesSelecionado) + 1 })
      .then((dados) => { if (ativo) setPainel(dados); })
      .catch((error) => {
        if (!ativo) return;
        toast.error(error.message || "Não foi possível carregar o painel financeiro.");
      });

    return () => { ativo = false; };
  }, [mesSelecionado, anoSelecionado]);

  const dados = painel || PAINEL_MOCK;
  const periodoSelecionado = `${mesSelecionado} de ${anoSelecionado}`;

  const statusEstilo = {
    Pago: "bg-green-50 text-green-600 border-green-200",
    Pendente: "bg-orange-50 text-orange-500 border-orange-200",
    "Em Análise": "bg-blue-50 text-blue-600 border-blue-200",
  };

  function selecionarMes(mes) {
    setMesSelecionado(mes);
    setMostrarMeses(false);
  }

  function emitirRelatorio() {
    toast.info("Emissão de relatório em PDF ainda não implementada para o painel financeiro.");
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
  const axisStroke = modoEscuro ? "#6b7280" : "#9ca3af";
  const tooltipStyle = {
    background: modoEscuro ? "#1f2937" : "#ffffff",
    border: `1px solid ${modoEscuro ? "#374151" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 12,
    color: modoEscuro ? "#f3f4f6" : "#1f2937",
  };

  const maxRanking = Math.max(...dados.rankingVendedores.map((v) => v.valor));

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
              <div className="relative" ref={refDropdown}>
                <button
                  onClick={() => setMostrarMeses((v) => !v)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition
                    ${cardBg} ${borda} ${textoM} ${hover}`}
                >
                  <IconCalendario />
                  {periodoSelecionado}
                </button>

                {mostrarMeses && (
                  <div className={`absolute right-0 mt-2 z-20 w-40 max-h-64 overflow-y-auto rounded-xl shadow-lg border p-1.5
                    ${cardBg} ${borda}`}>
                    {MESES.map((mes) => (
                      <button
                        key={mes}
                        onClick={() => selecionarMes(mes)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition
                          ${mes === mesSelecionado ? "font-bold text-blue-600" : textoM} ${hover}`}
                      >
                        {mes}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={emitirRelatorio}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}
              >
                <IconRelatorio />
                Emitir relatório
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
                      tick={{ fontSize: 11, fill: axisStroke }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      width={56}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatarMoedaBR(value), "Faturamento"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#2d5fa6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2d5fa6" }}
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
                {dados.rankingVendedores.map((v, i) => (
                  <div key={v.nome} className="flex items-center gap-3">
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
                    <span className={`text-xs font-bold whitespace-nowrap flex-shrink-0 ${textoM}`}>
                      {formatarMoedaBR(v.valor)}
                    </span>
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
                <p className={`text-[10px] uppercase tracking-wider ${textoS}`}>Visão geral dos meses mais recentes</p>
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
                <tbody>
                  {dados.ultimosPedidos.map((p) => (
                    <tr key={p.codigo} className={`transition-colors ${hover}`}>
                      <td className={`px-3 py-3 text-xs font-bold ${textoM}`}>{p.codigo}</td>
                      <td className={`px-3 py-3 text-xs ${textoM}`}>{p.vendedor}</td>
                      <td className={`px-3 py-3 text-xs ${textoM}`}>{p.cliente}</td>
                      <td className={`px-3 py-3 text-xs font-semibold ${textoM}`}>{formatarMoedaBR(p.valorFaturado)}</td>
                      <td className={`px-3 py-3 text-xs font-semibold ${textoM}`}>{formatarMoedaBR(p.comissao)}</td>
                      <td className={`px-3 py-3 text-xs ${textoS}`}>{p.pagamento}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border ${statusEstilo[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
