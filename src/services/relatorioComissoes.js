import { formatarStatusPagamento } from "./statusPagamento.js";
import { carregarLogoPdf, adicionarLogoPdf } from "./pdfBranding.js";

export async function criarRelatorioComissoes({ parcelas, periodo, status, busca, geradoEm = new Date() }) {
  const { jsPDF } = await import("jspdf");
  const logo = await carregarLogoPdf();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 14;
  const moeda = (valor) => Number(valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  let y;
  const colunas = [
    { titulo: "Venda / Pedido", largura: 37 },
    { titulo: "Cliente", largura: 44 },
    { titulo: "Vendedor", largura: 42 },
    { titulo: "Comissão", largura: 30 },
    { titulo: "Parcela", largura: 19 },
    { titulo: "Vencimento", largura: 29 },
    { titulo: "Status", largura: 27 },
    { titulo: "Nota fiscal", largura: largura - margem * 2 - 228 },
  ];

  function cabecalho() {
    doc.setFillColor(30, 64, 128);
    doc.rect(0, 0, largura, 27, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
    doc.text("Relatório de Comissões", margem, 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(periodo, margem, 20);
    adicionarLogoPdf(doc, logo, largura - margem - 30, 5, 30);
    doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text("Dados demonstrativos - painel ainda sem integração com o backend.", margem, 34);
    const filtros = doc.splitTextToSize(`Status: ${formatarStatusPagamento(status) || "Todos"} | Busca: ${busca?.trim() || "Todos os vendedores e pedidos"}`, largura - margem * 2);
    doc.text(filtros, margem, 40);
    y = 44 + filtros.length * 3.5;
  }

  function cabecalhoTabela() {
    doc.setFillColor(241, 245, 249);
    doc.rect(margem, y, largura - margem * 2, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
    let x = margem;
    for (const coluna of colunas) {
      doc.text(coluna.titulo, x + 2, y + 5.5);
      x += coluna.largura;
    }
    y += 9;
  }

  cabecalho();
  const total = parcelas.reduce((soma, parcela) => soma + Number(parcela.valor || 0), 0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 64, 128);
  doc.text(`${parcelas.length} parcelas no filtro | Total de comissões: ${moeda(total)}`, margem, y);
  y += 9;
  cabecalhoTabela();
  if (!parcelas.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Nenhuma parcela encontrada para os filtros selecionados.", margem + 2, y + 7);
  }
  parcelas.forEach((parcela, indice) => {
    const venda = parcela.venda;
    const data = parcela.previsao?.split("-").reverse().join("/") || "-";
    const valores = [
      `${venda.id}\n${venda.detalhesPedido?.numeroPedido || venda.id}\n${venda.venda || ""}`,
      venda.cliente, venda.vendedor, moeda(parcela.valor), parcela.numero, data, formatarStatusPagamento(parcela.status), parcela.notaFiscal || "-",
    ];
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const celulas = valores.map((valor, i) => doc.splitTextToSize(String(valor ?? "-"), colunas[i].largura - 4));
    const alturaLinha = Math.max(11, ...celulas.map((linhas) => linhas.length * 3.6 + 4));
    if (y + alturaLinha > altura - 18) {
      doc.addPage(); cabecalho(); cabecalhoTabela();
    }
    if (indice % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margem, y, largura - margem * 2, alturaLinha, "F");
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(30, 41, 59);
    let x = margem;
    celulas.forEach((linhas, i) => {
      doc.text(linhas, x + 2, y + 5, { lineHeightFactor: 1.25 });
      x += colunas[i].largura;
    });
    y += alturaLinha;
  });

  const paginas = doc.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina); doc.setDrawColor(226, 232, 240);
    doc.line(margem, altura - 13, largura - margem, altura - 13);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em ${geradoEm.toLocaleString("pt-BR")}`, margem, altura - 8);
    adicionarLogoPdf(doc, logo, largura / 2 - 10, altura - 12);
    doc.text(`Página ${pagina} de ${paginas}`, largura - margem, altura - 8, { align: "right" });
  }
  return doc;
}
