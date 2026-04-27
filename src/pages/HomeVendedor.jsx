import React, { useState, useRef, useEffect } from "react";
import Navbar from "../layout/NavbarVendedor";
import { useDarkMode } from "../hooks/useDarkMode";

/* ══════════════════════════════════════════
   DADOS MOCKADOS POR CATEGORIA
══════════════════════════════════════════ */
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DADOS_POR_MES = {
  "Março": {
    totalVendas: 10, comissoesLiberadas: 10, pagamentosPendentes: 4,
    projecao: "R$ 1.350,00", parcelas: 8, tendencia: "+4%",
    vendas: [
      { id: "V1", nome: "VENDA 1", cliente: "Maria Silva - Microsoft",        comissao: "1/3 – R$ 200,00", status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/5", valor: "R$ 450,00" }, { label: "Parcela 2/5", valor: "R$ 1.900,00" }] },
      { id: "V2", nome: "VENDA 2", cliente: "João Oliveira - Tech Solutions",  comissao: "R$ 200,00",        status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/5", valor: "R$ 450,00" }, { label: "Parcela 2/5", valor: "R$ 1.900,00" }] },
      { id: "V3", nome: "VENDA 3", cliente: "Ana Costa - Global Corp",         comissao: "R$ 200,00",        status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/5", valor: "R$ 200,00" }] },
      { id: "V4", nome: "VENDA 4", cliente: "Rafa Santos - Global Corp",       comissao: "R$ 200,00",        status: "AGUARDANDO",        tipo: "pendente", parcelas: [{ label: "Parcela 1/3", valor: "R$ 200,00" }] },
      { id: "V5", nome: "VENDA 5", cliente: "Bruno Lima - Acme Corp",          comissao: "R$ 450,00",        status: "AGUARDANDO",        tipo: "pendente", parcelas: [{ label: "Parcela 1/2", valor: "R$ 450,00" }] },
    ],
  },
  "Abril": {
    totalVendas: 7, comissoesLiberadas: 5, pagamentosPendentes: 2,
    projecao: "R$ 980,00", parcelas: 5, tendencia: "-2%",
    vendas: [
      { id: "V1", nome: "VENDA 1", cliente: "Lucas Mendes - StartX",   comissao: "R$ 300,00", status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/3", valor: "R$ 300,00" }] },
      { id: "V2", nome: "VENDA 2", cliente: "Camila Rocha - Nexus",    comissao: "R$ 180,00", status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/4", valor: "R$ 180,00" }] },
      { id: "V3", nome: "VENDA 3", cliente: "Pedro Alves - Beta Corp", comissao: "R$ 500,00", status: "AGUARDANDO",       tipo: "pendente", parcelas: [{ label: "Parcela 1/2", valor: "R$ 500,00" }] },
    ],
  },
  "Fevereiro": {
    totalVendas: 12, comissoesLiberadas: 12, pagamentosPendentes: 0,
    projecao: "R$ 2.100,00", parcelas: 10, tendencia: "+8%",
    vendas: [
      { id: "V1", nome: "VENDA 1", cliente: "Fernanda Lima - SoftHouse", comissao: "R$ 600,00",   status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/5", valor: "R$ 600,00" }] },
      { id: "V2", nome: "VENDA 2", cliente: "Thiago Nunes - DataPlus",   comissao: "R$ 1.500,00", status: "PAGO 1ª PARCELA", tipo: "liberada", parcelas: [{ label: "Parcela 1/3", valor: "R$ 1.500,00" }] },
    ],
  },
};

const MES_ATUAL = "Março";

/* ══════════════════════════════════════════
   ÍCONES
══════════════════════════════════════════ */
const IconCarrinho = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13H5.4M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const IconConfirmado = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const IconRelogio = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconFiltro = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
);

const IconOlho = ({ desligado }) => desligado ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconSetaDireita = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconSetaBaixo = ({ rotacionado }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${rotacionado ? "rotate-180" : ""}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconTendenciaAlta = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const IconTendenciaBaixa = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const IconRelatorio = ({ dark }) => (
  <svg className={`w-4 h-4 ${dark ? "text-blue-400" : "text-blue-700"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconLua = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconSol = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707.707M6.343 6.343l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

/* ══════════════════════════════════════════
   CARD DE MÉTRICA (compacto e clicável)
══════════════════════════════════════════ */
function CardMetrica({ icone, rotulo, valor, badge, sub, ativo, aoClicar, dark }) {
  const estiloAtivo = { background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" };

  return (
    <button
      onClick={aoClicar}
      className={`flex-1 rounded-xl px-4 py-3 flex flex-col gap-1.5 shadow-sm text-left transition-all duration-200 cursor-pointer focus:outline-none
        ${ativo
          ? "text-white ring-2 ring-blue-400 scale-[1.02]"
          : dark
            ? "bg-gray-800 border border-gray-700 hover:border-blue-500 hover:shadow-md"
            : "bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md"
        }`}
      style={ativo ? estiloAtivo : {}}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-bold tracking-widest uppercase ${ativo ? "text-blue-200" : dark ? "text-gray-400" : "text-gray-400"}`}>
          {rotulo}
        </span>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center
          ${ativo ? "bg-white/15 text-white" : dark ? "bg-blue-900/50 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
          {icone}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-3xl font-extrabold leading-none ${ativo ? "text-white" : dark ? "text-white" : "text-gray-900"}`}>
          {valor}
        </span>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-0.5
            ${ativo ? "bg-white/20 text-white" : dark ? "bg-blue-900/60 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
            {badge}
          </span>
        )}
      </div>

      {sub && (
        <p className={`text-[10px] ${ativo ? "text-blue-200" : dark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function HomeVendedor() {
  const { darkMode: modoEscuro } = useDarkMode();
  const [mesSelecionado, setMesSelecionado] = useState(MES_ATUAL);
  const [mostrarMeses, setMostrarMeses]     = useState(false);
  const [cardAtivo, setCardAtivo]           = useState(null);
  const [mostrarTodas, setMostrarTodas]     = useState(false);
  const [vendaExpandida, setVendaExpandida] = useState(null);
  const [ocultarProjecao, setOcultarProjecao] = useState(false);

  const refDropdown = useRef(null);

  /* fecha dropdown ao clicar fora */
  useEffect(() => {
    function fecharAoClicarFora(e) {
      if (refDropdown.current && !refDropdown.current.contains(e.target)) {
        setMostrarMeses(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const baseDados = DADOS_POR_MES[mesSelecionado] || DADOS_POR_MES[MES_ATUAL];

  const pedidosSalvos = (() => {
    try {
      return JSON.parse(localStorage.getItem("korp_pedidos") || "[]");
    } catch (e) {
      return [];
    }
  })();

  const dados = {
    ...baseDados,
    vendas: [...baseDados.vendas, ...pedidosSalvos],
    totalVendas: (baseDados.totalVendas || 0) + pedidosSalvos.length,
  };

  const vendasFiltradas = dados.vendas.filter((v) => {
    if (cardAtivo === "liberadas") return v.tipo === "liberada";
    if (cardAtivo === "pendentes") return v.tipo === "pendente";
    return true;
  });

  const tituloTabela =
    cardAtivo === "liberadas" ? "Comissões Liberadas"
    : cardAtivo === "pendentes" ? "Pagamentos Pendentes"
    : "Todas as Vendas";

  const vendasExibidas = mostrarTodas ? vendasFiltradas : vendasFiltradas.slice(0, 3);

  const todasParcelas = dados.vendas
    .filter((v) => v.tipo === "liberada")
    .flatMap((v) => v.parcelas);

  const tendenciaPositiva = dados.tendencia.startsWith("+");

  function gerarPDF() {
    const janela = window.open("", "_blank");
    janela.document.write(`
      <html>
        <head>
          <title>Relatório de Comissões – ${mesSelecionado} 2026</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
            h1 { font-size: 22px; color: #1a3a7a; margin-bottom: 4px; }
            p.sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
            .resumo { display: flex; gap: 16px; margin-bottom: 32px; }
            .caixa { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; flex: 1; }
            .caixa .rotulo { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
            .caixa .valor { font-size: 26px; font-weight: 900; color: #1e293b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; padding: 8px 12px; border-bottom: 2px solid #f1f5f9; }
            td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .liberada { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .pendente { background: #fff7ed; color: #d97706; border: 1px solid #fed7aa; }
            footer { margin-top: 40px; font-size: 10px; color: #cbd5e1; text-align: center; }
          </style>
        </head>
        <body>
          <p class="sub">Operações de Venda</p>
          <h1>Painel do Consultor – ${mesSelecionado} 2026</h1>
          <div class="resumo">
            <div class="caixa"><div class="rotulo">Total de Vendas</div><div class="valor">${dados.totalVendas}</div></div>
            <div class="caixa"><div class="rotulo">Comissões Liberadas</div><div class="valor">${dados.comissoesLiberadas}</div></div>
            <div class="caixa"><div class="rotulo">Pagamentos Pendentes</div><div class="valor">${dados.pagamentosPendentes}</div></div>
            <div class="caixa"><div class="rotulo">Projeção Bruta</div><div class="valor">${dados.projecao}</div></div>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Venda</th><th>Cliente</th><th>Comissão</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${dados.vendas.map((v) => `
                <tr>
                  <td><strong>${v.id}</strong></td>
                  <td>${v.nome}</td>
                  <td>${v.cliente}</td>
                  <td>${v.comissao}</td>
                  <td><span class="badge ${v.tipo}">${v.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <footer>Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} • TND Brasil</footer>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `);
    janela.document.close();
  }

  function alternarCard(chave) {
    setCardAtivo((anterior) => (anterior === chave ? null : chave));
    setMostrarTodas(false);
    setVendaExpandida(null);
  }

  function selecionarMes(mes) {
    setMesSelecionado(mes);
    setMostrarMeses(false);
    setCardAtivo(null);
    setMostrarTodas(false);
    setVendaExpandida(null);
  }

  /* classes de tema */
  const bg       = modoEscuro ? "bg-gray-900"  : "bg-gray-100";
  const cardBg   = modoEscuro ? "bg-gray-800"  : "bg-white";
  const borda    = modoEscuro ? "border-gray-700" : "border-gray-100";
  const textoP   = modoEscuro ? "text-white"   : "text-gray-900";
  const textoS   = modoEscuro ? "text-gray-400" : "text-gray-400";
  const textoM   = modoEscuro ? "text-gray-300" : "text-gray-800";
  const hover    = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const linhaBg  = modoEscuro ? "bg-gray-750"  : "";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-0.5">
              Operações de Venda
            </p>
            <h1 className={`text-2xl font-extrabold ${textoP}`}>Painel do Consultor</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtrar por mês */}
            <div className="relative" ref={refDropdown}>
              <button
                onClick={() => setMostrarMeses((p) => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors shadow-sm
                  ${modoEscuro
                    ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                    : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600"
                  }`}
              >
                <IconFiltro />
                {mesSelecionado}
                <IconSetaBaixo rotacionado={mostrarMeses} />
              </button>

              {mostrarMeses && (
                <div className={`absolute right-0 mt-2 w-44 border rounded-2xl shadow-xl z-30 py-2 overflow-hidden
                  ${modoEscuro ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  {MESES.map((m) => (
                    <button
                      key={m}
                      onClick={() => selecionarMes(m)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${m === mesSelecionado
                          ? modoEscuro ? "bg-blue-900/50 text-blue-400 font-bold" : "bg-blue-50 text-blue-700 font-bold"
                          : modoEscuro ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Layout principal ── */}
        <div className="flex gap-5 items-start">

          {/* ── Coluna esquerda ── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Cards de métricas — compactos */}
            <div className="flex gap-3">
              <CardMetrica
                icone={<IconCarrinho />}
                rotulo="Total de Vendas"
                valor={dados.totalVendas}
                badge="+5 vs mês ant."
                ativo={cardAtivo === "vendas"}
                aoClicar={() => alternarCard("vendas")}
                dark={modoEscuro}
              />
              <CardMetrica
                icone={<IconConfirmado />}
                rotulo="Comissões Liberadas"
                valor={dados.comissoesLiberadas}
                badge="+5 vs mês ant."
                ativo={cardAtivo === "liberadas"}
                aoClicar={() => alternarCard("liberadas")}
                dark={modoEscuro}
              />
              <CardMetrica
                icone={<IconRelogio />}
                rotulo="Pagamentos Pendentes"
                valor={dados.pagamentosPendentes}
                sub="Aguardando conciliação"
                ativo={cardAtivo === "pendentes"}
                aoClicar={() => alternarCard("pendentes")}
                dark={modoEscuro}
              />
            </div>

            {/* Tabela */}
            <div className={`${cardBg} rounded-2xl shadow-sm p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-blue-700" />
                <h2 className={`text-base font-bold ${textoM}`}>{tituloTabela}</h2>
                {cardAtivo && (
                  <button
                    onClick={() => { setCardAtivo(null); setMostrarTodas(false); setVendaExpandida(null); }}
                    className={`ml-auto text-xs font-semibold tracking-wider uppercase transition-colors ${textoS} hover:text-blue-500`}
                  >
                    Limpar filtro ×
                  </button>
                )}
              </div>

              {/* Cabeçalho */}
              <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-4 px-2 mb-2">
                <span className={`text-[9px] font-bold tracking-widest uppercase ${textoS}`}>Identificação da Venda</span>
                <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${textoS}`}>Comissão Total</span>
                <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${textoS}`}>Status Atual</span>
                <span />
              </div>

              {/* Linhas */}
              <div className="flex flex-col gap-0.5">
                {vendasExibidas.length === 0 && (
                  <p className={`text-sm text-center py-6 ${textoS}`}>Nenhuma venda encontrada para este filtro.</p>
                )}

                {vendasExibidas.map((v) => (
                  <div key={v.id}>
                    <button
                      onClick={() => setVendaExpandida(vendaExpandida === v.id ? null : v.id)}
                      className={`w-full grid grid-cols-[2fr_2fr_2fr_auto] gap-4 items-center px-2 py-3 rounded-xl transition-colors text-left group
                        ${vendaExpandida === v.id
                          ? modoEscuro ? "bg-blue-900/30" : "bg-blue-50"
                          : hover
                        }`}
                    >
                      {/* Identificação */}
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${vendaExpandida === v.id ? "bg-blue-600" : modoEscuro ? "bg-blue-900/50" : "bg-blue-50"}`}>
                          <span className={`text-[10px] font-bold ${vendaExpandida === v.id ? "text-white" : "text-blue-700"}`}>
                            {v.id}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${textoM}`}>{v.nome}</p>
                          <p className={`text-[10px] ${textoS}`}>{v.cliente}</p>
                        </div>
                      </div>

                      {/* Comissão */}
                      <div className="text-center">
                        <span className={`text-sm font-bold ${textoM}`}>{v.comissao}</span>
                      </div>

                      {/* Status */}
                      <div className="flex justify-center">
                        <span className={`text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border
                          ${v.tipo === "liberada"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-orange-50 text-orange-500 border-orange-200"
                          }`}>
                          {v.status}
                        </span>
                      </div>

                      {/* Seta */}
                      <div className={`transition-transform duration-200
                        ${vendaExpandida === v.id ? "rotate-90 text-blue-500" : `${textoS} group-hover:text-blue-400`}`}>
                        <IconSetaDireita />
                      </div>
                    </button>

                    {/* Detalhe expandido */}
                    {vendaExpandida === v.id && (
                      <div className={`mx-2 mb-1.5 px-4 py-2.5 rounded-xl border
                        ${modoEscuro ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}>
                        <p className="text-[9px] font-bold tracking-widest text-blue-400 uppercase mb-1.5">Parcelas desta venda</p>
                        <div className="flex flex-col gap-1">
                          {v.parcelas.map((p, i) => (
                            <div key={i} className="flex justify-between">
                              <span className={`text-xs ${textoS}`}>{p.label}</span>
                              <span className={`text-xs font-bold ${textoM}`}>{p.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ver mais */}
              {vendasFiltradas.length > 3 && (
                <div className={`flex justify-center mt-4 pt-3 border-t ${borda}`}>
                  <button
                    onClick={() => setMostrarTodas((p) => !p)}
                    className={`flex items-center gap-2 text-xs font-semibold tracking-widest transition-colors uppercase ${textoS} hover:text-blue-500`}
                  >
                    {mostrarTodas ? "VER MENOS" : "VER MAIS TRANSAÇÕES"}
                    <IconSetaBaixo rotacionado={mostrarTodas} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Coluna direita ── */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3">

            {/* Resumo de comissões */}
            <div className={`${cardBg} rounded-2xl shadow-sm p-4 flex flex-col gap-3`}>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <IconRelatorio dark={modoEscuro} />
                  <h3 className={`text-xs font-extrabold tracking-widest uppercase ${textoM}`}>Resumo de Comissões</h3>
                </div>
                <p className={`text-[9px] tracking-wider uppercase ${textoS}`}>Relatório Mensal de Projeção</p>
              </div>

              {/* Mês e tendência */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={tendenciaPositiva ? "text-green-500" : "text-red-400"}>
                    {tendenciaPositiva ? <IconTendenciaAlta /> : <IconTendenciaBaixa />}
                  </span>
                  <span className={`text-[9px] font-bold tracking-wider ${tendenciaPositiva ? "text-green-500" : "text-red-400"}`}>
                    {dados.tendencia}
                  </span>
                  <span className={`text-[9px] uppercase tracking-wider ml-auto ${textoS}`}>Previsão</span>
                </div>
                <p className={`text-sm font-extrabold ${textoP}`}>{mesSelecionado} de 2026</p>
              </div>

              {/* Parcelas em aberto */}
              <div className={`flex items-center justify-between py-1.5 border-b ${borda}`}>
                <span className={`text-xs ${textoS}`}>Parcelas em aberto</span>
                <span className={`text-sm font-bold ${textoM}`}>
                  {String(dados.parcelas).padStart(2, "0")}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className={`w-full h-1 rounded-full ${modoEscuro ? "bg-gray-700" : "bg-gray-100"}`}>
                <div
                  className="h-1 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min((dados.comissoesLiberadas / (dados.totalVendas || 1)) * 100, 100)}%` }}
                />
              </div>

              {/* Lista de parcelas */}
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {todasParcelas.length === 0 && (
                  <p className={`text-xs text-center py-2 ${textoS}`}>Sem parcelas liberadas.</p>
                )}
                {todasParcelas.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-xs ${textoS}`}>{p.label}</span>
                    <span className={`text-xs font-bold ${textoM}`}>{p.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projeção bruta */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-1.5"
              style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">Projeção Bruta</p>
                  <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">à Receber</p>
                  <p className="text-[9px] text-blue-300 uppercase mt-0.5">{mesSelecionado}</p>
                </div>
                <button
                  onClick={() => setOcultarProjecao((p) => !p)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all"
                  aria-label={ocultarProjecao ? "Mostrar valor" : "Ocultar valor"}
                >
                  <IconOlho desligado={ocultarProjecao} />
                </button>
              </div>
              <p className="text-2xl font-extrabold text-white transition-all duration-300">
                {ocultarProjecao ? "••••••••" : dados.projecao}
              </p>
            </div>

            {/* Emitir PDF */}
            <button
              onClick={gerarPDF}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}
            >
              Emitir PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}