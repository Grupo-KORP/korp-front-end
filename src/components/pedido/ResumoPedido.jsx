import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumoPedido.css";
import dinheiroIcon from "../../assets/dinheiro.png";
import perfilDistribuidor from "../../assets/distribuidor.png";
import { cadastrarPedido } from "../../services/api";
import { mapperFormDataToPedidoRequest } from "../../services/pedidoRequestMapper";

export default function ResumoPedido({ formData }) {
  const cliente = formData?.cliente || {};
  const distribuidor = formData?.distribuidor || {};
  const produtos = formData?.produtos || [];
  const entregaData = formData?.entrega || {};
  const entrega = {
    endereco: entregaData.endereco || cliente.endereco || "",
    cidade: entregaData.cidade || cliente.cidade || "",
    cep: entregaData.cep || cliente.cep || "",
  };

  // Estado local para campos de entrega editáveis
  const [localEntrega, setLocalEntrega] = useState(entrega.endereco);
  const [cidadeEntrega, setCidadeEntrega] = useState(entrega.cidade);
  const [cepEntrega, setCepEntrega] = useState(entrega.cep);
  const [showEnviarPdfModal, setShowEnviarPdfModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar com formData quando entrega mudar
  useEffect(() => {
    setLocalEntrega(entrega.endereco || "");
    setCidadeEntrega(entrega.cidade || "");
    setCepEntrega(entrega.cep || "");
  }, [entrega.endereco, entrega.cidade, entrega.cep]);

  const clienteFaturado = cliente.razaoSocial;
  const distribuidorName = distribuidor.razaoSocial;
  const distribuidorEmail = distribuidor.email || "";

  const valorCompra = produtos.reduce(
    (acc, p) => acc + (parseFloat(p.valorTotal) || 0),
    0
  );

  const valorFaturamento = produtos.reduce(
    (acc, p) => acc + (parseFloat(p.totalFaturado) || 0),
    0
  );
  const comissao = valorFaturamento - valorCompra;

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const pdfText = (value) => {
    const valueText = String(value ?? "").trim();
    return valueText || "-";
  };

  const gerarPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 7;
    const footerHeight = 11;
    const contentBottom = pageHeight - margin - footerHeight;
    const usableWidth = pageWidth - margin * 2;
    let y = 8;
    const pedidoId = formData?.pedidoId || "{{pedidoId}}";

    const entregaAtual = {
      ...entrega,
      endereco: localEntrega,
      cidade: cidadeEntrega,
      cep: cepEntrega,
    };

    const drawSectionBox = (title, x, topY, width, height) => {
      doc.setDrawColor(220, 226, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, topY, width, height, 1.5, 1.5, "FD");

      doc.setFillColor(245, 248, 252);
      doc.rect(x, topY, width, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.setTextColor(6, 29, 81);
      doc.text(title, x + 3, topY + 4.7);
      doc.setDrawColor(220, 226, 235);
      doc.line(x, topY + 7, x + width, topY + 7);
    };

    const drawLabelValue = (label, value, x, topY, width, options = {}) => {
      const labelSize = options.labelSize || 5.4;
      const valueSize = options.valueSize || 6.7;
      const maxLines = options.maxLines || 1;
      const lineHeight = options.lineHeight || 2.8;
      const text = pdfText(value);
      let fontSize = valueSize;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      let lines = doc.splitTextToSize(text, width);

      while (lines.length > maxLines && fontSize > 4.5) {
        fontSize -= 0.3;
        doc.setFontSize(fontSize);
        lines = doc.splitTextToSize(text, width);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(labelSize);
      doc.setTextColor(117, 130, 150);
      doc.text(label.toUpperCase(), x, topY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(30, 41, 59);
      doc.text(lines.slice(0, maxLines), x, topY + 3.3, { maxWidth: width, lineHeightFactor: lineHeight / fontSize });
    };

    const compactFieldPanel = (title, fields, x, topY, width, height) => {
      drawSectionBox(title, x, topY, width, height);
      const innerX = x + 3;
      const innerY = topY + 12;
      const gap = 3;
      const colWidth = (width - 9) / 2;
      const rowHeight = 6.4;

      fields.forEach((field, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        drawLabelValue(
          field.label,
          field.value,
          innerX + col * (colWidth + gap),
          innerY + row * rowHeight,
          colWidth,
          { maxLines: 1 }
        );
      });
    };

    const sectionTitle = (title, topY) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(6, 29, 81);
      doc.text(title, margin, topY);
      doc.setDrawColor(220, 226, 235);
      doc.line(margin, topY + 2, pageWidth - margin, topY + 2);
    };

    const fitTextLines = (value, width, maxLines) => {
      let fontSize = doc.getFontSize();
      const minFontSize = 3.8;
      let lines = doc.splitTextToSize(pdfText(value), width);

      while (lines.length > maxLines && fontSize > minFontSize) {
        fontSize -= 0.25;
        doc.setFontSize(fontSize);
        lines = doc.splitTextToSize(pdfText(value), width);
      }

      return lines.slice(0, maxLines);
    };

    const tableHeader = (columns, topY, rowHeight) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, topY, usableWidth, rowHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.8);
      doc.setTextColor(85, 99, 118);

      let x = margin;
      columns.forEach((column) => {
        doc.text(column.label, x + 1, topY + rowHeight - 2.2, { maxWidth: column.width - 2 });
        x += column.width;
      });
    };

    const productColumns = [
      { label: "#", width: 7, value: (_, index) => String(index + 1), align: "left" },
      { label: "Descricao", width: 67, value: (p) => pdfText(p.descricao), align: "left" },
      { label: "P/N", width: 24, value: (p) => pdfText(p.pn), align: "left" },
      { label: "Entrega", width: 26, value: (p) => pdfText(p.entrega), align: "left" },
      { label: "Qtd.", width: 14, value: (p) => pdfText(p.quantidade), align: "right" },
      { label: "Valor Unit.", width: 29, value: (p) => fmt(parseFloat(p.valorUnitario) || 0), align: "right" },
      { label: "Valor Total", width: 31, value: (p) => fmt(parseFloat(p.valorTotal) || 0), align: "right" },
      { label: "Unit. Fat.", width: 33, value: (p) => fmt(parseFloat(p.unitFaturado) || 0), align: "right" },
      { label: "Total Fat.", width: usableWidth - 231, value: (p) => fmt(parseFloat(p.totalFaturado) || 0), align: "right" },
    ];

    const startProductTable = (topY, title = "Produtos") => {
      sectionTitle(title, topY);
      const headerY = topY + 5;
      tableHeader(productColumns, headerY, 6);
      return headerY + 6;
    };

    const productTable = (topY) => {
      let tableY = startProductTable(topY);
      const columns = productColumns;

      if (produtos.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("Nenhum produto informado", margin + usableWidth / 2, tableY + 6, { align: "center" });
        doc.setDrawColor(220, 226, 235);
        doc.rect(margin, topY + 5, usableWidth, 14);
        return tableY + 8;
      }

      const rowHeight = 6.2;
      const bodyFontSize = 5.8;
      const descriptionLines = 1;

      produtos.forEach((produto, index) => {
        if (tableY + rowHeight > contentBottom) {
          doc.addPage();
          tableY = startProductTable(8, "Produtos (continuação)");
        }

        let x = margin;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(30, 41, 59);
        columns.forEach((cell) => {
          const maxLines = cell.label === "Descricao" ? descriptionLines : 1;
          doc.setFontSize(bodyFontSize);
          const lines = fitTextLines(cell.value(produto, index), cell.width - 2, maxLines);
          const textX = cell.align === "right" ? x + cell.width - 1 : x + 1;
          const cellFontSize = doc.getFontSize();
          const textY = tableY + 3.9;
          doc.text(lines, textX, textY, {
            align: cell.align,
            maxWidth: cell.width - 2,
            lineHeightFactor: 0.9,
          });
          doc.setFontSize(cellFontSize);
          x += cell.width;
        });
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, tableY + rowHeight, pageWidth - margin, tableY + rowHeight);
        tableY += rowHeight;
      });

      return tableY;
    };

    const summaryFieldsPanel = (title, fields, x, topY, width, height) => {
      drawSectionBox(title, x, topY, width, height);
      const innerX = x + 3;
      const innerY = topY + 12;
      const rowHeight = 7;
      let cursorY = innerY;

      fields.forEach((field) => {
        drawLabelValue(field.label, field.value, innerX, cursorY, width - 6, {
          maxLines: field.maxLines || 1,
          valueSize: 6.5,
        });
        cursorY += field.height || rowHeight;
      });
    };

    const getSummaryHeight = () => {
      const produtosResumo = produtos.map((p) => p.descricao).filter(Boolean).join(", ");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      const productLines = doc.splitTextToSize(pdfText(produtosResumo), halfWidth - 6);
      return Math.max(42, 12 + 5 * 7 + productLines.length * 3.2 + 5);
    };

    const financialPanel = (title, x, topY, width, height) => {
      drawSectionBox(title, x, topY, width, height);
      const gap = 3;
      const boxWidth = (width - 12 - gap * 2) / 3;
      const items = [
        { label: "Valor de Compra", value: fmt(valorCompra), highlight: false },
        { label: "Valor de Faturamento", value: fmt(valorFaturamento), highlight: false },
        { label: "Total de Comissao Bruta", value: fmt(comissao), highlight: true },
      ];

      items.forEach((item, index) => {
        const boxX = x + 3 + index * (boxWidth + gap);
        const boxY = topY + 13;
        doc.setDrawColor(item.highlight ? 30 : 226, item.highlight ? 58 : 232, item.highlight ? 138 : 240);
        doc.setFillColor(item.highlight ? 30 : 255, item.highlight ? 58 : 255, item.highlight ? 138 : 255);
        doc.roundedRect(boxX, boxY, boxWidth, height - 17, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.6);
        doc.setTextColor(item.highlight ? 255 : 148, item.highlight ? 255 : 163, item.highlight ? 255 : 184);
        doc.text(item.label.toUpperCase(), boxX + 3, boxY + 5, { maxWidth: boxWidth - 6 });
        doc.setFontSize(10.5);
        doc.setTextColor(item.highlight ? 255 : 30, item.highlight ? 255 : 41, item.highlight ? 255 : 59);
        doc.text(item.value, boxX + 3, boxY + 14, { maxWidth: boxWidth - 6 });
      });
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.6);
    doc.setTextColor(59, 130, 246);
    doc.text("OPERACOES DE VENDA", margin, y);
    y += 6;
    doc.setFontSize(16);
    doc.setTextColor(26, 58, 122);
    doc.text("Novo Pedido", margin, y);
    y += 6;

    const gap = 5;
    const halfWidth = (usableWidth - gap) / 2;
    const partyY = y;
    const partyHeight = 50;

    compactFieldPanel("Dados do Cliente", [
      { label: "Nome Fantasia", value: cliente.nomeFantasia },
      { label: "Razao Social", value: cliente.razaoSocial },
      { label: "CNPJ", value: cliente.cnpj },
      { label: "Insc. Est.", value: cliente.inscEst },
      { label: "Fone", value: cliente.fone },
      { label: "CEP", value: cliente.cep },
      { label: "Endereco", value: cliente.endereco },
      { label: "Cidade", value: cliente.cidade },
      { label: "UF", value: cliente.uf },
      { label: "Contato", value: cliente.contato },
      { label: "E-mail", value: cliente.email },
    ], margin, partyY, halfWidth, partyHeight);

    compactFieldPanel("Dados do Distribuidor", [
      { label: "Nome Fantasia", value: distribuidor.nomeFantasia },
      { label: "Razao Social", value: distribuidor.razaoSocial },
      { label: "CNPJ", value: distribuidor.cnpj },
      { label: "Insc. Est.", value: distribuidor.inscEst },
      { label: "Fone", value: distribuidor.fone },
      { label: "CEP", value: distribuidor.cep },
      { label: "Endereco", value: distribuidor.endereco },
      { label: "Cidade", value: distribuidor.cidade },
      { label: "UF", value: distribuidor.uf },
      { label: "Contato", value: distribuidor.contato },
      { label: "E-mail", value: distribuidor.email },
    ], margin + halfWidth + gap, partyY, halfWidth, partyHeight);

    const productsY = partyY + partyHeight + 7;
    y = productTable(productsY) + 5;

    const produtosResumo = produtos.map((p) => p.descricao).filter(Boolean).join(", ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const productSummaryLines = doc.splitTextToSize(pdfText(produtosResumo), halfWidth - 6);
    const summaryHeight = getSummaryHeight();
    if (y + summaryHeight > contentBottom) {
      doc.addPage();
      y = 8;
    }

    summaryFieldsPanel("Resumo do Pedido", [
      { label: "Distribuidor Responsavel", value: distribuidorName },
      { label: "Cliente Faturado", value: clienteFaturado },
      { label: "Local de Entrega", value: entregaAtual.endereco },
      { label: "Cidade", value: entregaAtual.cidade },
      { label: "CEP", value: entregaAtual.cep },
      {
        label: "Produtos",
        value: produtosResumo,
        maxLines: productSummaryLines.length,
        height: Math.max(7, summaryHeight - 47),
      },
    ], margin, y, halfWidth, summaryHeight);

    financialPanel("Resumo Financeiro", margin + halfWidth + gap, y, halfWidth, summaryHeight);

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(220, 226, 235);
      doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.4);
      doc.setTextColor(100, 116, 139);
      doc.text(`Código do Pedido: ${pedidoId}`, margin, pageHeight - 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")} - TND Brasil`,
        margin,
        pageHeight - 3.5
      );
      doc.text(`Pagina ${page} de ${totalPages}`, pageWidth - margin, pageHeight - 3.5, { align: "right" });
    }

    doc.save("pedido.pdf");
  };

  const navigate = useNavigate();

  const salvarPedido = async () => {
  setLoading(true);
  setError(null);

  try {
    const pedidoRequest = mapperFormDataToPedidoRequest(formData);
    const response = await cadastrarPedido(pedidoRequest);

    if (response && response.idPedido) {
      navigate("/vendedores/home");
    }
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    setError(err.message || "Erro ao salvar pedido. Tente novamente.");
    setLoading(false);
  }
};

  const adicionarPedido = () => {
    setShowEnviarPdfModal(true);
  };

  const finalizarPedido = async (enviarPdf) => {
    setShowEnviarPdfModal(false);

    if (enviarPdf) {
      await gerarPDF();
    }

    await salvarPedido();
  };

  return (
    <div className="resumo-wrapper">
      {/* ── Resumo do Pedido ── */}
      <div className="resumo-card">
        <div className="resumo-card-title">
          <span className="resumo-title-icon"><img src={perfilDistribuidor} alt="Dinehiro" /></span>
          Resumo do Pedido
        </div>

        <div className="resumo-scroll-content">

          <div className="resumo-field">
            <span className="resumo-label">DISTRIBUIDOR RESPONSÁVEL</span>
            <span className="resumo-plain-value">{distribuidorName || "-"}</span>
          </div>

          <div className="resumo-field">
            <span className="resumo-label">CLIENTE FATURADO</span>
            <span className="resumo-plain-value">{clienteFaturado || "-"}</span>
          </div>

          <div className="resumo-field">
            <span className="resumo-label">LOCAL DE ENTREGA</span>
            <span className="resumo-plain-value">{localEntrega || "-"}</span>
          </div>

          <div className="resumo-row-2col">
            <div className="resumo-field">
              <span className="resumo-label">CIDADE</span>
              <span className="resumo-plain-value">{cidadeEntrega || "-"}</span>
            </div>
            <div className="resumo-field">
              <span className="resumo-label">CEP</span>
              <span className="resumo-plain-value">{cepEntrega || "-"}</span>
            </div>
          </div>

          <div className="resumo-field">
            <span className="resumo-label">PRODUTO</span>
            <div className="resumo-produtos-scroll">
              {produtos.length === 0 ? (
                <span className="resumo-empty" >Nenhum produto adicionado</span>
              ) : (
                produtos.map((p, i) => (
                  <div key={i} className="resumo-produto-item">
                    <span>{p.descricao || "-"}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Resumo Financeiro ── */}
      <div className="resumo-card">
        <div className="resumo-card-title">
          <span className="resumo-title-icon"><img src={dinheiroIcon} alt="icone-dinheiro" /></span>
          Resumo Financeiro
        </div>

        <div className="financeiro-grid">
          <div className="financeiro-item">
            <span className="resumo-label">VALOR DE COMPRA</span>
            <span className="financeiro-valor">{fmt(valorCompra)}</span>
          </div>
          <div className="financeiro-item">
            <span className="resumo-label">VALOR DE FATURAMENTO</span>
            <span className="financeiro-valor green">{fmt(valorFaturamento)}</span>
          </div>
        </div>

        <div className="comissao-box">
          <span className="comissao-label">TOTAL DE COMISSÃO BRUTA</span>
          <span className="comissao-valor">{fmt(comissao)}</span>
        </div>

        <div className="botoes-resumo">
          <button className="btn-primary" onClick={adicionarPedido} disabled={loading}>
            {loading ? "Salvando..." : "Adicionar Pedido"}
          </button>
          <button className="btn-secondary" onClick={gerarPDF}>
            Pré visualizar PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="resumo-modal-overlay" role="dialog" aria-modal="true">
          <div className="resumo-modal">
            <h3>Erro ao salvar pedido</h3>
            <p>{error}</p>
            <div className="resumo-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setError(null);
                  setShowEnviarPdfModal(true);
                }}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setError(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEnviarPdfModal && (
        <div className="resumo-modal-overlay" role="dialog" aria-modal="true">
          <div className="resumo-modal">
            <h3>Enviar PDF ao distribuidor?</h3>
            <p>
              Deseja enviar o PDF deste pedido para o distribuidor no e-mail{" "}
              <strong>{distribuidorEmail || "não informado"}</strong>?
              <br />
              Por enquanto, ao confirmar, o PDF será baixado.
            </p>

            <div className="resumo-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => finalizarPedido(true)}
                disabled={!distribuidorEmail}
              >
                Sim
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => finalizarPedido(false)}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
