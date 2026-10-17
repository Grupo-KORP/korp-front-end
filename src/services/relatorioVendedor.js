import { carregarLogoPdf, adicionarLogoPdf, COR_FUNDO_LOGO_PDF } from "./pdfBranding.js";

export async function criarRelatorioVendedor({ dados, linhas, periodo, filtro, geradoEm = new Date() }) {
  const { jsPDF } = await import("jspdf");
  const logo = await carregarLogoPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 14;
  const larguraUtil = largura - margem * 2;
  let y;
  const texto = (valor) => String(valor ?? "").trim() || "-";

  function cabecalho() {
    doc.setFillColor(COR_FUNDO_LOGO_PDF);
    doc.rect(0, 0, largura, 27, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
    doc.text("Painel do Consultor", margem, 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(periodo, margem, 20);
    adicionarLogoPdf(doc, logo, largura - margem - 30, 5, 30);
    doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text(`Filtro: ${filtro}`, margem, 35);
    y = 44;
  }

  function novaPagina() { doc.addPage(); cabecalho(); }

  function secao(titulo) {
    if (y + 25 > altura - 18) novaPagina();
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(15, 37, 87);
    doc.text(titulo, margem, y);
    y += 7;
  }

  function tabela(colunas, registros) {
    const cabecalhoTabela = () => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margem, y, larguraUtil, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(71, 85, 105);
      let x = margem;
      colunas.forEach((coluna) => { doc.text(coluna.titulo, x + 2, y + 5.5); x += coluna.largura; });
      y += 9;
    };
    cabecalhoTabela();
    const linhasTabela = registros.length ? registros : [colunas.map((_, i) => i === 0 ? "Sem dados disponíveis" : "-")];
    linhasTabela.forEach((linha, indice) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      const celulas = colunas.map((coluna, i) => doc.splitTextToSize(texto(linha[i]), coluna.largura - 4));
      const alturaLinha = Math.max(9, ...celulas.map((celula) => celula.length * 3.6 + 4));
      if (y + alturaLinha > altura - 18) { novaPagina(); cabecalhoTabela(); }
      if (indice % 2 === 0) {
        doc.setFillColor(248, 250, 252); doc.rect(margem, y, larguraUtil, alturaLinha, "F");
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(30, 41, 59);
      let x = margem;
      celulas.forEach((celula, i) => { doc.text(celula, x + 2, y + 5, { lineHeightFactor: 1.25 }); x += colunas[i].largura; });
      y += alturaLinha;
    });
    y += 9;
  }

  cabecalho();
  secao("Resumo do período");
  tabela([{ titulo: "Indicador", largura: 112 }, { titulo: "Valor", largura: 70 }], [
    ["Total de vendas", dados.totalVendas],
    ["Comissões liberadas", dados.comissoesLiberadas],
    ["Pagamentos pendentes", dados.pagamentosPendentes],
    ["Projeção bruta a receber", dados.projecao],
    ["Tendência vs mês anterior", dados.tendencia],
    ["Parcelas em aberto", dados.parcelas],
  ]);
  secao("Parcelas liberadas do período");
  tabela([
    { titulo: "Pedido", largura: 40 },
    { titulo: "Parcela", largura: 82 },
    { titulo: "Valor", largura: 60 },
  ], dados.parcelasLiberadas.map((parcela) => [parcela.pedidoId, parcela.label, parcela.valor]));
  secao("Transações do período");
  tabela([
    { titulo: "Tipo", largura: 34 },
    { titulo: "ID", largura: 20 },
    { titulo: "Identificação", largura: 54 },
    { titulo: "Comissão", largura: 32 },
    { titulo: "Status", largura: 42 },
  ], linhas);

  const paginas = doc.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina); doc.setDrawColor(226, 232, 240);
    doc.line(margem, altura - 12, largura - margem, altura - 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em ${geradoEm.toLocaleString("pt-BR")}`, margem, altura - 7);
    doc.text(`Página ${pagina} de ${paginas}`, largura - margem, altura - 7, { align: "right" });
  }
  return doc;
}
