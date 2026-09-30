import { formatarStatusPagamento } from "./statusPagamento.js";
import { carregarLogoPdf, adicionarLogoPdf } from "./pdfBranding.js";

const moeda = (valor) => Number(valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const quantidade = (valor) => valor == null ? "-" : Number(valor).toLocaleString("pt-BR");

export async function criarRelatorioFinanceiro({ dados, periodo, geradoEm = new Date() }) {
  const { jsPDF } = await import("jspdf");
  const logo = await carregarLogoPdf();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 14;
  const larguraUtil = largura - margem * 2;
  let y;

  function cabecalho() {
    doc.setFillColor(30, 64, 128);
    doc.rect(0, 0, largura, 27, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("Painel Financeiro", margem, 12);
    doc.setFontSize(9);
    doc.text(periodo, margem, 20);
    doc.setFontSize(8);
    adicionarLogoPdf(doc, logo, largura - margem - 30, 5, 30);
    y = 43;
  }

  function novaPagina() {
    doc.addPage();
    cabecalho();
  }

  function secao(titulo) {
    if (y + 26 > altura - 20) novaPagina();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 64, 128);
    doc.text(titulo, margem, y);
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margem, y, largura - margem, y);
    y += 5;
  }

  function tabela(colunas, linhas) {
    const desenharCabecalho = () => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margem, y, larguraUtil, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      let x = margem;
      colunas.forEach((coluna) => {
        doc.text(coluna.titulo, x + 2, y + 5.5);
        x += coluna.largura;
      });
      y += 9;
    };
    desenharCabecalho();
    const registros = linhas.length ? linhas : [colunas.map((_, i) => i === 0 ? "Sem dados disponíveis" : "-")];
    registros.forEach((linha, indice) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const celulas = colunas.map((coluna, i) => doc.splitTextToSize(String(linha[i] ?? "-"), coluna.largura - 4));
      const alturaLinha = Math.max(9, ...celulas.map((texto) => texto.length * 3.6 + 4));
      if (y + alturaLinha > altura - 20) {
        novaPagina();
        desenharCabecalho();
      }
      if (indice % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margem, y, larguraUtil, alturaLinha, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      let x = margem;
      celulas.forEach((texto, i) => {
        doc.text(texto, x + 2, y + 5, { lineHeightFactor: 1.25 });
        x += colunas[i].largura;
      });
      y += alturaLinha;
    });
    y += 9;
  }

  cabecalho();
  secao("Resumo do período");
  tabela([{ titulo: "Indicador", largura: 112 }, { titulo: "Valor", largura: 70 }], [
    ["Faturamento total estimado", moeda(dados.faturamentoTotalEstimado)],
    ["Total de vendas", quantidade(dados.totalVendas)],
    ["Pagamentos pendentes", `${moeda(dados.pagamentosPendentes)} (${quantidade(dados.qtdPagamentosPendentes)} pagamentos)`],
    ["Comissões pagas", `${moeda(dados.comissoesPagas)} (${quantidade(dados.qtdVendasComissoesPagas)} vendas)`],
    ["Comissão a pagar", `${moeda(dados.comissaoAPagar)} (${quantidade(dados.qtdVendasComissaoAPagar)} vendas)`],
  ]);
  secao("Evolução de vendas - últimos 6 meses");
  tabela([
    { titulo: "Mês", largura: 52 },
    { titulo: "Faturamento", largura: 70 },
    { titulo: "Quantidade de vendas", largura: 60 },
  ], dados.evolucaoVendas.map((item) => [item.mes, moeda(item.valor), quantidade(item.quantidadeVendas)]));

  novaPagina();
  secao("Comissão por vendedor - ranking");
  tabela([
    { titulo: "Posição", largura: 18 },
    { titulo: "Vendedor", largura: 80 },
    { titulo: "Comissão", largura: 44 },
    { titulo: "Vendas", largura: 40 },
  ], dados.rankingVendedores.map((item, i) => [String(i + 1), item.nome, moeda(item.valor), quantidade(item.quantidadeVendas)]));
  secao("Últimos pedidos processados");
  tabela([
    { titulo: "Pedido", largura: 19 },
    { titulo: "Vendedor / Cliente", largura: 55 },
    { titulo: "Faturado", largura: 29 },
    { titulo: "Comissão", largura: 27 },
    { titulo: "Pagamento", largura: 28 },
    { titulo: "Status", largura: 24 },
  ], dados.ultimosPedidos.map((item) => [
    item.codigo, `${item.vendedor}\n${item.cliente}`, moeda(item.valorFaturado), moeda(item.comissao), item.pagamento, formatarStatusPagamento(item.status),
  ]));

  const paginas = doc.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);
    doc.setDrawColor(226, 232, 240);
    doc.line(margem, altura - 13, largura - margem, altura - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em ${geradoEm.toLocaleString("pt-BR")}`, margem, altura - 8);
    adicionarLogoPdf(doc, logo, largura / 2 - 10, altura - 12);
    doc.text(`Página ${pagina} de ${paginas}`, largura - margem, altura - 8, { align: "right" });
  }
  return doc;
}
