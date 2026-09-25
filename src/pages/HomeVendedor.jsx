import React, { useState, useEffect, useMemo, useRef } from "react";
import "../styles/base-reset.css";
import "./HomeVendedor.css";
import Navbar from "../layout/NavbarVendedor";
import { useDarkMode } from "../hooks/useDarkMode";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  alterarSenha,
  buscarPainelVendedor,
  buscarDetalheVenda,
  verificarPrimeiroAcesso,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import ModalDetalheVenda from "../components/modal/Modaldetalhevenda";
import DatePickerCalendar from "../components/ui/DatePickerCalendar";
import ModalAlterarSenha from "../components/modal/ModalAlterarSenha";
import Pagination from "../components/pagination/pagination";


const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];
 
const HOJE = new Date();
const ANO_ATUAL = HOJE.getFullYear();
const MES_ATUAL_NUM = HOJE.getMonth() + 1;
const DIA_ATUAL = HOJE.getDate();
 
const TAMANHO_PAGINA = 5;
const TAMANHO_PAGINA_PDF = 100;
 
/* Valor do card na URL (?status=liberadas) -> valor esperado pela API */
const STATUS_API = {
  vendas: "TODAS",
  liberadas: "LIBERADAS",
  pendentes: "PENDENTES",
};
 
const inteiroOuNulo = (valor) => {
  const n = parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
};
 
const formatarMoedaBR = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
 
const formatarValorMoeda = (valor) => {
  if (valor === null || valor === undefined || valor === "") return formatarMoedaBR(0);
  if (typeof valor === "string" && valor.trim().startsWith("R$")) return valor;
  return formatarMoedaBR(valor);
};

const obterValorNumerico = (valor) => {
  if (typeof valor === "number") return valor;

  if (typeof valor === "string") {
    return (
      Number(
        valor
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()
      ) || 0
    );
  }

  return 0;
};

const calcularComissaoTotal = (parcelas = []) => {
  return parcelas.reduce(
    (total, parcela) => total + obterValorNumerico(parcela?.valor),
    0
  );
};
 
const normalizarParcela = (parcela) => ({
  ...parcela,
  valor: formatarValorMoeda(parcela?.valor),
});
 
const normalizarProduto = (produto = {}) => ({
  ...produto,
  valorUnitario: formatarValorMoeda(produto.valorUnitario),
  valorTotal: formatarValorMoeda(produto.valorTotal),
  valorUnitarioFaturado: formatarValorMoeda(produto.valorUnitarioFaturado),
  totalFaturado: formatarValorMoeda(produto.totalFaturado),
});
 
const normalizarPainelVendedor = (painel) => {
  const resumo = painel?.resumo || {};
  const pagina = painel?.vendas || {};
 
  const vendas = (pagina.content || []).map((venda) => ({
    ...venda,
    comissao: formatarValorMoeda(
  calcularComissaoTotal(venda.parcelasDaVenda || venda.parcelas || [])
    ),
    parcelas: (venda.parcelas || []).map(normalizarParcela),
    parcelasDaVenda: (venda.parcelasDaVenda || []).map(normalizarParcela),
  }));
 
  return {
    totalVendas: resumo.totalVendas || 0,
    comissoesLiberadas: resumo.comissoesLiberadas || 0,
    pagamentosPendentes: resumo.pagamentosPendentes || 0,
    projecao: formatarValorMoeda(resumo.projecao),
    parcelas: resumo.parcelas || 0,
    tendencia: resumo.tendencia || "0%",
    parcelasLiberadas: (painel?.parcelasLiberadas || []).map(normalizarParcela),
    vendas,
    totalPages: pagina.totalPages ?? 1,
    totalElements: pagina.totalElements ?? 0,
  };
};
 
/* Cores/textos das linhas da tabela combinada (Venda + Pagamento). */
function corBadgeTipoLinha(tipoLinha) {
  return tipoLinha === "pagamento"
    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
    : "bg-blue-50 text-blue-600 border-blue-200";
}
 
function corBadgeStatusVenda(tipoPedido) {
  return tipoPedido === "aprovada"
    ? "bg-green-50 text-green-600 border-green-200"
    : "bg-orange-50 text-orange-500 border-orange-200";
}
 
function corBadgeStatusParcela(status) {
  if (status === "PAGA") return "bg-green-50 text-green-600 border-green-200";
  if (status === "LIBERADA") return "bg-blue-50 text-blue-600 border-blue-200";
  return "bg-orange-50 text-orange-500 border-orange-200"; // PENDENTE
}
 
function textoStatusParcela(status) {
  if (status === "PAGA") return "Pagamento realizado";
  if (status === "LIBERADA") return "Liberado";
  return "Pendente";
}
 
/* Achata cada venda + as parcelas dela (já filtradas por período/status) em uma lista só,
   na ordem em que devem aparecer: a venda, seguida de cada pagamento dela. */
function montarLinhasTabela(vendas, periodo) {
  return vendas.flatMap((venda) => {
    const dataVenda = venda.dataVenda;

    // Verifica se a venda pertence ao período selecionado
    let vendaDoPeriodo = false;

    if (dataVenda) {
      const [anoVenda, mesVenda, diaVenda] = dataVenda
        .split("-")
        .map(Number);

      vendaDoPeriodo =
        anoVenda === periodo.ano &&
        mesVenda === periodo.mes &&
        (periodo.dia === null || diaVenda === periodo.dia);
    }

    // A venda só aparece no mês/dia em que foi realizada
    const linhaVenda = vendaDoPeriodo
      ? [{ tipoLinha: "venda", chave: venda.id, venda }]
      : [];

    // As parcelas continuam aparecendo normalmente no período
    const linhasParcelas = (venda.parcelas || []).map((parcela) => ({
      tipoLinha: "pagamento",
      chave: `${venda.id}-${parcela.idParcela ?? parcela.label}`,
      venda,
      parcela,
    }));

    return [...linhaVenda, ...linhasParcelas];
  });
}
 
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
 
/* ══════════════════════════════════════════
   CARD DE MÉTRICA
══════════════════════════════════════════ */
function CardMetrica({ icone, rotulo, valor, badge, sub, ativo, aoClicar, dark }) {
  const estiloAtivo = { background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" };
 
  return (
    <button
      onClick={aoClicar}
      className={`rounded-xl px-4 py-3 flex flex-col gap-1.5 shadow-sm text-left transition-all duration-200 cursor-pointer focus:outline-none
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
        <span className={`text-2xl sm:text-3xl font-extrabold leading-none ${ativo ? "text-white" : dark ? "text-white" : "text-gray-900"}`}>
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
  const { usuario, initialized, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
 
  const [ocultarProjecao, setOcultarProjecao] = useState(false);
  const [vendaNoModal, setVendaNoModal] = useState(null);
  const [abrindoVendaId, setAbrindoVendaId] = useState(null);
  const [painelVendedor, setPainelVendedor] = useState(null);
  const [carregandoPainel, setCarregandoPainel] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [atualizacaoPainel, setAtualizacaoPainel] = useState(0);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(null);
 
  const toastShown = useRef(false);
 
  /* ── Estado vindo da URL: ?status=&pagina=&ano=&mes=&dia= ── */
  const statusParam = searchParams.get("status");
  const cardAtivo = Object.hasOwn(STATUS_API, statusParam) ? statusParam : null;
  const paginaAtual = Math.max(inteiroOuNulo(searchParams.get("pagina")) ?? 1, 1);
  const mesParam = inteiroOuNulo(searchParams.get("mes"));
  const anoParam = inteiroOuNulo(searchParams.get("ano"));
  const diaParam = inteiroOuNulo(searchParams.get("dia"));
 
  /* Sem mês na URL: dia de hoje (comportamento padrão do painel) */
const periodo = useMemo(() => {
  if (mesParam !== null && mesParam >= 1 && mesParam <= 12) {
    const ano = anoParam ?? ANO_ATUAL;
    const diasNoMes = new Date(ano, mesParam, 0).getDate();
    const dia = diaParam !== null && diaParam >= 1 && diaParam <= diasNoMes
      ? diaParam
      : null;

    return {
      ano,
      mes: mesParam,
      dia,
      personalizado: true,
    };
  }

  // Ao abrir a tela sem filtro, carrega o mês atual inteiro
  return {
    ano: ANO_ATUAL,
    mes: MES_ATUAL_NUM,
    dia: null,
    personalizado: false,
  };
}, [mesParam, anoParam, diaParam]);
 
  const mesSelecionado = MESES[periodo.mes - 1];
  const selecao = periodo.personalizado
    ? { type: periodo.dia ? "day" : "month", y: periodo.ano, m: periodo.mes - 1, d: periodo.dia }
    : null;
 
  /* patch: chave -> valor; null/undefined/"" remove o param da URL */
  function atualizarParams(patch) {
    const proximos = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([chave, valor]) => {
      if (valor === null || valor === undefined || valor === "") proximos.delete(chave);
      else proximos.set(chave, String(valor));
    });
    setSearchParams(proximos, { replace: true });
  }
 
  /* ── Autenticação / primeiro acesso ── */
  useEffect(() => {
    if (toastShown.current) return;
    if (!initialized) return;
    if (!isAuthenticated) {
      toastShown.current = true;
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }
    if (!hasRole("ROLE_VEND")) {
      toastShown.current = true;
      toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
      navigate("/financeiro/vendedores");
    }
 
    verificarPrimeiroAcesso(usuario)
      .then((isPrimeiro) => setPrimeiroAcesso(isPrimeiro))
      .catch(() => setPrimeiroAcesso(false));
  }, [initialized, isAuthenticated, hasRole, usuario, navigate]);
 
  async function handleAlterarSenha({ novaSenha }) {
    try {
      await alterarSenha({ novaSenha });
      toast.success("Senha alterada com sucesso!");
      setPrimeiroAcesso(false);
    } catch (err) {
      toast.error(err.message || "Erro ao alterar a senha.");
    }
  }
 
  /* ── Busca do painel: recarrega sempre que a URL (filtros/página) muda ── */
  useEffect(() => {
    if (!initialized || !isAuthenticated || !hasRole("ROLE_VEND")) return;
 
    let ativo = true;
    setCarregandoPainel(true);
 
    buscarPainelVendedor({
      ano: periodo.ano,
      mes: periodo.mes,
      dia: periodo.dia,
      status: STATUS_API[cardAtivo ?? "vendas"],
      pagina: paginaAtual,
      tamanho: TAMANHO_PAGINA,
    })
      .then((response) => {
        if (!ativo) return;
        const painel = normalizarPainelVendedor(response);
 
        /* página da URL além do fim (URL editada, item removido...): volta para a última */
        const ultimaPagina = Math.max(painel.totalPages, 1);
        if (paginaAtual > ultimaPagina) {
          atualizarParams({ pagina: ultimaPagina > 1 ? ultimaPagina : null });
          return;
        }
 
        setPainelVendedor(painel);
      })
      .catch((error) => {
        if (!ativo) return;
        setPainelVendedor(normalizarPainelVendedor(null));
        toast.error(error.message || "Não foi possível carregar o painel do vendedor.");
      })
      .finally(() => {
        if (ativo) setCarregandoPainel(false);
      });
 
    return () => {
      ativo = false;
    };
    // atualizarParams muda a cada render; só as chaves da URL disparam a busca
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, isAuthenticated, hasRole, periodo.ano, periodo.mes, periodo.dia, cardAtivo, paginaAtual, atualizacaoPainel]);
 
  const dados = painelVendedor || normalizarPainelVendedor(null);
  const linhas = useMemo(
  () => montarLinhasTabela(dados.vendas, periodo),
  [dados.vendas, periodo]
);
 
  const tituloTabela =
    cardAtivo === "liberadas" ? "Comissões Liberadas"
      : cardAtivo === "pendentes" ? "Pagamentos Pendentes"
        : "Todas as Vendas";
 
  const tendenciaPositiva = dados.tendencia.startsWith("+");
  const periodoSelecionado = periodo.dia
    ? `${periodo.dia} de ${mesSelecionado} de ${periodo.ano}`
    : `${mesSelecionado} de ${periodo.ano}`;
  const periodoArquivo = periodoSelecionado
    .toLowerCase()
    .replace(/\s+de\s+/g, "-")
    .replace(/\s+/g, "-");
 
  /* ── Ações que mexem na URL ── */
  function alternarCard(chave) {
    atualizarParams({ status: cardAtivo === chave ? null : chave, pagina: null });
  }
 
  function mudarPagina(pagina) {
    atualizarParams({ pagina: pagina > 1 ? pagina : null });
  }
 
  function selecionarPeriodo(s) {
    if (!s) {
      atualizarParams({ ano: ANO_ATUAL, mes: MES_ATUAL_NUM, dia: null, status: null, pagina: null });
      return;
    }
    atualizarParams({
      ano: s.y,
      mes: s.m + 1,
      dia: s.type === "day" ? s.d : null,
      status: null,
      pagina: null,
    });
  }
 
  /* ── Detalhe da venda: buscado só ao abrir o modal ── */
  async function abrirVenda(venda) {
    if (abrindoVendaId) return;
    setAbrindoVendaId(venda.id);
    try {
      const detalhes = await buscarDetalheVenda(venda.idPedido);
      setVendaNoModal({
        venda: { ...venda, parcelas: venda.parcelasDaVenda || venda.parcelas },
        detalhes: { ...detalhes, produto: normalizarProduto(detalhes?.produto) },
      });
    } catch (error) {
      toast.error(error.message || "Não foi possível carregar os detalhes da venda.");
    } finally {
      setAbrindoVendaId(null);
    }
  }
 
  /* ── PDF: precisa de TODAS as vendas do período, não só da página atual ── */
  async function buscarTodasVendasDoPeriodo() {
    const vendas = [];
    let pagina = 1;
    let totalPages = 1;
 
    do {
      const response = await buscarPainelVendedor({
        ano: periodo.ano,
        mes: periodo.mes,
        dia: periodo.dia,
        status: STATUS_API.vendas,
        pagina,
        tamanho: TAMANHO_PAGINA_PDF,
      });
      const painel = normalizarPainelVendedor(response);
      vendas.push(...painel.vendas);
      totalPages = painel.totalPages;
      pagina += 1;
    } while (pagina <= totalPages);
 
    return vendas;
  }
 
  async function emitirPDF() {
    if (gerandoPdf) return;
    setGerandoPdf(true);
    try {
      const vendasPdf = await buscarTodasVendasDoPeriodo();
      await gerarPDFRelatorio(vendasPdf);
    } catch (error) {
      toast.error(error.message || "Não foi possível gerar o PDF.");
    } finally {
      setGerandoPdf(false);
    }
  }
 
  async function gerarPDFRelatorio(vendasPdf) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;
    let y = 16;
 
    const safeText = (value) => String(value ?? "").trim() || "-";
    const ensureSpace = (h) => { if (y + h > pageHeight - 18) { doc.addPage(); y = 16; } };
 
    const sectionTitle = (title) => {
      ensureSpace(14);
      y += y > 18 ? 5 : 0;
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(6, 29, 81);
      doc.text(title, margin, y); y += 3;
      doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.45);
      doc.line(margin, y, pageWidth - margin, y); y += 7;
    };
 
    const metricCards = () => {
      const gap = 4; const cardWidth = (usableWidth - gap * 3) / 4;
      const metrics = [
        { label: "Total de Vendas", value: dados.totalVendas, color: [30, 41, 59] },
        { label: "Comissoes Liberadas", value: dados.comissoesLiberadas, color: [22, 163, 74] },
        { label: "Pagamentos Pendentes", value: dados.pagamentosPendentes, color: [217, 119, 6] },
        { label: "Projecao Bruta", value: dados.projecao, color: [30, 58, 138] },
      ];
      ensureSpace(30);
      metrics.forEach((metric, index) => {
        const x = margin + index * (cardWidth + gap);
        doc.setDrawColor(226, 232, 240); doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, 25, 2, 2, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.8); doc.setTextColor(148, 163, 184);
        doc.text(metric.label.toUpperCase(), x + 3, y + 6);
        doc.setFontSize(16); doc.setTextColor(...metric.color);
        doc.text(String(metric.value), x + 3, y + 17);
      });
      y += 32;
    };
 
    const tableHeader = (columns) => {
      ensureSpace(10);
      doc.setFillColor(241, 245, 249); doc.rect(margin, y, usableWidth, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
      let x = margin;
      columns.forEach((col) => { doc.text(col.label, x + 1.5, y + 5.8, { maxWidth: col.width - 3 }); x += col.width; });
      y += 9;
    };
 
    const salesTable = () => {
      const columns = [
        { label: "ID", width: 16, value: (v) => v.id },
        { label: "Venda", width: 34, value: (v) => v.nome },
        { label: "Cliente", width: 58, value: (v) => v.cliente },
        { label: "Comissao", width: 38, value: (v) => v.comissao },
        { label: "Status", width: 36, value: (v) => v.status },
      ];
      tableHeader(columns);
      vendasPdf.forEach((venda) => {
        const cells = columns.map((col) => ({ ...col, lines: doc.splitTextToSize(safeText(col.value(venda)), col.width - 3) }));
        const rowHeight = Math.max(12, ...cells.map((c) => 5 + c.lines.length * 4));
        if (y + rowHeight > pageHeight - 18) { doc.addPage(); y = 16; tableHeader(columns); }
        let x = margin;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
        cells.forEach((cell, index) => {
          if (index === 4) {
            const aprovada = venda.tipo === "aprovada";
            if (aprovada) doc.setFillColor(240, 253, 244);
            else doc.setFillColor(255, 247, 237);
            const bW = Math.min(cell.width - 4, 34);
            doc.roundedRect(x + 1, y + 2, bW, 6, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
            if (aprovada) doc.setTextColor(22, 163, 74);
            else doc.setTextColor(217, 119, 6);
            doc.text(safeText(cell.value(venda)), x + 3, y + 6.2, { maxWidth: bW - 4 });
            doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
          } else {
            cell.lines.forEach((line, li) => { doc.text(line, x + 1.5, y + 5 + li * 4); });
          }
          x += cell.width;
        });
        doc.setDrawColor(241, 245, 249); doc.setLineWidth(0.3);
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
        y += rowHeight;
      });
    };
 
    doc.setFillColor(15, 37, 87); doc.rect(0, 0, pageWidth, 22, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
    doc.text(`Painel do Consultor – ${periodoSelecionado}`, margin, 13);
    doc.setFontSize(7.5); doc.setTextColor(147, 174, 219);
    doc.text("OPERAÇÕES DE VENDA", pageWidth - margin, 13, { align: "right" });
    y = 32;
 
    sectionTitle("Resumo do Mês");
    metricCards();
    sectionTitle("Transações do Período");
    salesTable();
 
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} • TND Brasil`, margin, pageHeight - 7);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }
 
    doc.save(`relatorio-comissoes-${periodoArquivo}.pdf`);
  }
 
  /* classes de tema */
  const bg = modoEscuro ? "bg-gray-900" : "bg-gray-100";
  const cardBg = modoEscuro ? "bg-gray-800" : "bg-white";
  const borda = modoEscuro ? "border-gray-700" : "border-gray-100";
  const textoP = modoEscuro ? "text-white" : "text-gray-900";
  const textoS = modoEscuro ? "text-gray-400" : "text-gray-400";
  const textoM = modoEscuro ? "text-gray-300" : "text-gray-800";
  const hover = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";
 
  const scrollFino = { scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.35) transparent" };
 
  return (
    <div className={`h-screen flex flex-col ${bg} transition-colors duration-300`}>
      <Navbar />
 
      {/* ── Modal de detalhe da venda ── */}
      {vendaNoModal && (
        <ModalDetalheVenda
          key={vendaNoModal.venda.id}
          venda={vendaNoModal.venda}
          detalhes={vendaNoModal.detalhes}
          aoFechar={() => setVendaNoModal(null)}
          aoAtualizar={() => setAtualizacaoPainel((valor) => valor + 1)}
          escuro={modoEscuro}
        />
      )}
 
      {primeiroAcesso === true && (
        <ModalAlterarSenha
          obrigatorio
          aoConfirmar={handleAlterarSenha}
          aoFechar={() => { }}
        />
      )}
 
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        <div className="flex flex-col lg:h-full px-3 py-4 sm:px-6 sm:py-6">
 
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-0.5">
                Operações de Venda
              </p>
              <h1 className={`text-xl sm:text-2xl font-extrabold ${textoP}`}>Painel do Vendedor</h1>
            </div>
 
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <DatePickerCalendar
                selecao={selecao}
                aoSelecionar={selecionarPeriodo}
                dark={modoEscuro}
              />
            </div>
          </div>
 
          {/* ── Layout principal ── */}
          <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch lg:flex-1 lg:min-h-0">
 
            {/* ── Coluna esquerda ── */}
            <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0">
 
              {/* Cards de métricas */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                <CardMetrica
                  icone={<IconCarrinho />}
                  rotulo="Total de Vendas"
                  valor={dados.totalVendas}
                  badge={`${dados.tendencia} vs mês ant.`}
                  ativo={cardAtivo === "vendas"}
                  aoClicar={() => alternarCard("vendas")}
                  dark={modoEscuro}
                />
                <CardMetrica
                  icone={<IconConfirmado />}
                  rotulo="Comissões Liberadas"
                  valor={dados.comissoesLiberadas}
                  badge={`${dados.tendencia} vs mês ant.`}
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
              <div className={`${cardBg} rounded-2xl shadow-sm p-5 flex flex-col lg:flex-1 lg:min-h-0`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full bg-blue-700" />
                  <h2 className={`text-base font-bold ${textoM}`}>{tituloTabela}</h2>
                  {cardAtivo && (
                    <button
                      onClick={() => atualizarParams({ status: null, pagina: null })}
                      className={`ml-auto text-xs font-semibold tracking-wider uppercase transition-colors ${textoS} hover:text-blue-500`}
                    >
                      Limpar filtro ×
                    </button>
                  )}
                </div>
 
                {/* Cabeçalho */}
                <div className="hidden sm:grid grid-cols-[80px_2fr_1.3fr_1.3fr_auto] gap-4 px-2 mb-2">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${textoS}`}>Tipo</span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${textoS}`}>Identificação</span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${textoS}`}>Comissão Total</span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${textoS}`}>Status Atual</span>
                  <span />
                </div>
                {/* Cabeçalho mobile */}
                <div className="grid sm:hidden grid-cols-[1fr_auto] gap-2 px-2 mb-2">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${textoS}`}>Venda / Pagamento</span>
                  <span />
                </div>
 
                {/* Linhas: cada venda aparece seguida das parcelas (pagamentos) dela no período/filtro atual */}
                <div
                  className={`flex flex-col gap-0.5 lg:flex-1 overflow-y-auto max-h-72 lg:max-h-none pr-2 lg:min-h-0 transition-opacity ${carregandoPainel ? "opacity-60" : "opacity-100"}`}
                  style={scrollFino}
                >
                  {linhas.length === 0 && (
                    <p className={`text-sm text-center py-6 ${textoS}`}>
                      {carregandoPainel ? "Carregando..." : "Nenhuma venda encontrada para este filtro."}
                    </p>
                  )}
 
                  {linhas.map((linha) => {
                    const ehPagamento = linha.tipoLinha === "pagamento";
                    const identificacao = ehPagamento
                      ? `${linha.venda.nome} - ${linha.parcela.label}`
                      : `${linha.venda.nome} - ${linha.venda.cliente}`;
                    const valor = ehPagamento ? linha.parcela.valor : linha.venda.comissao;
                    const statusTexto = ehPagamento ? textoStatusParcela(linha.parcela.status) : linha.venda.status;
                    const statusCor = ehPagamento
                      ? corBadgeStatusParcela(linha.parcela.status)
                      : corBadgeStatusVenda(linha.venda.tipo);
                    const idExibido = ehPagamento ? (linha.parcela.numeroParcela ?? "•") : linha.venda.id;
                    const carregandoEssaVenda = abrindoVendaId === linha.venda.id;
 
                    return (
                      <button
                        key={linha.chave}
                        onClick={() => abrirVenda(linha.venda)}
                        disabled={carregandoEssaVenda}
                        className={`w-full grid grid-cols-[auto_1fr] sm:grid-cols-[80px_2fr_1.3fr_1.3fr_auto] gap-2 sm:gap-4 items-center px-2 py-3 rounded-xl transition-colors text-left group disabled:opacity-60 disabled:cursor-wait ${hover}`}
                      >
                        {/* Tipo — badge Venda/Pagamento, só desktop (no mobile vira etiqueta acima da identificação) */}
                        <div className="hidden sm:flex">
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border ${corBadgeTipoLinha(linha.tipoLinha)}`}>
                            {ehPagamento ? "Comissão" : "Venda"}
                          </span>
                        </div>
 
                        {/* Identificação + info mobile */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${ehPagamento
                              ? (modoEscuro ? "bg-emerald-900/40" : "bg-emerald-50")
                              : (modoEscuro ? "bg-blue-900/50" : "bg-blue-50")}`}>
                            <span className={`text-[10px] font-bold ${ehPagamento ? "text-emerald-600" : "text-blue-400"}`}>
                              {idExibido}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className={`sm:hidden inline-block mb-0.5 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase border ${corBadgeTipoLinha(linha.tipoLinha)}`}>
                              {ehPagamento ? "Comissão" : "Venda"}
                            </span>
                            <p className={`text-xs font-bold truncate ${textoM}`}>{identificacao}</p>
                            {/* Comissão + status visíveis só no mobile */}
                            <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                              <span className={`text-xs font-bold ${textoM}`}>{valor}</span>
                              <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border ${statusCor}`}>
                                {statusTexto}
                              </span>
                            </div>
                          </div>
                        </div>
 
                        {/* Comissão — só desktop */}
                        <div className="hidden sm:flex text-center justify-center">
                          <span className={`text-sm font-bold ${textoM}`}>{valor}</span>
                        </div>
 
                        {/* Status — só desktop */}
                        <div className="hidden sm:flex justify-center">
                          <span className={`text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border ${statusCor}`}>
                            {statusTexto}
                          </span>
                        </div>
 
                        {/* Seta */}
                        <div className={`transition-transform duration-200 ${textoS} group-hover:text-blue-400`}>
                          <IconSetaDireita />
                        </div>
                      </button>
                    );
                  })}
                </div>
 
                {/* Paginação (mesmo componente do CatalogPage) */}
                <Pagination
                  currentPage={paginaAtual}
                  totalPages={dados.totalPages}
                  onPageChange={mudarPagina}
                />
              </div>
            </div>
 
            {/* ── Coluna direita ── */}
            <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-3 lg:min-h-0">
 
              {/* ── Resumo de comissões ── */}
              <div className={`${cardBg} rounded-2xl shadow-sm p-4 flex flex-col gap-2 lg:flex-1 lg:min-h-0`}>
                {/* Cabeçalho do card */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IconRelatorio dark={modoEscuro} />
                    <h3 className={`text-xs font-extrabold tracking-widest uppercase ${textoM}`}>
                      Resumo de Comissões
                    </h3>
                  </div>
                  <p className={`text-[9px] tracking-wider uppercase ${textoS}`}>
                    Relatório Mensal de Projeção
                  </p>
                </div>
 
                {/* Tendência */}
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
                  <p className={`text-sm font-extrabold ${textoP}`}>{periodoSelecionado}</p>
                </div>
 
                {/* Divisor */}
                <div className={`border-t ${borda}`} />
 
                {/* Parcelas em aberto */}
                <div className="flex items-center justify-between">
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
 
                {/* Parcelas liberadas do período (vêm do back, independem da página) */}
                <div
                  className="flex flex-col gap-1.5 overflow-y-auto max-h-48 lg:max-h-none lg:flex-1 lg:min-h-0 pr-1"
                  style={scrollFino}
                >
                  {dados.parcelasLiberadas.length === 0 && (
                    <p className={`text-xs text-center py-2 ${textoS}`}>Sem parcelas liberadas.</p>
                  )}
                  {dados.parcelasLiberadas.map((p, i) => (
                    <div
                      key={p.idParcela ?? i}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg
                      ${modoEscuro ? "bg-gray-700/50" : "bg-gray-50"}`}
                    >
                      {/* Pedido ID + label da parcela */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className={`text-[10px] font-bold whitespace-nowrap ${textoM}`}>
                          Pedido: {p.pedidoId}
                        </span>
                        <span className={`text-[10px] ${textoS}`}>{p.label}</span>
                      </div>
 
                      {/* Valor */}
                      <span className={`text-xs font-bold whitespace-nowrap ${textoM}`}>
                        {p.valor}
                      </span>
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
                    <p className="text-[9px] text-blue-300 uppercase mt-0.5">{periodoSelecionado}</p>
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
                onClick={emitirPDF}
                disabled={gerandoPdf}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-wait"
                style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}
              >
                {gerandoPdf ? "Gerando PDF..." : "Emitir PDF"}
              </button>
            </div>
 
          </div>
        </div>{/* fim flex flex-col h-full */}
      </div>
    </div>
  );
}