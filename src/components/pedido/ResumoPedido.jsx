import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumoPedido.css";
import dinheiroIcon from "../../assets/dinheiro.png";
import perfilDistribuidor from "../../assets/distribuidor.png";

export default function ResumoPedido({ formData, onEntregaChange }) {
  const cliente = formData?.cliente || {};
  const distribuidor = formData?.distribuidor || {};
  const produtos = formData?.produtos || [];
  const entrega = formData?.entrega || { endereco: "", cidade: "", cep: "" };

  // Estado local para campos de entrega editáveis
  const [localEntrega, setLocalEntrega] = useState(entrega.endereco);
  const [cidadeEntrega, setCidadeEntrega] = useState(entrega.cidade);
  const [cepEntrega, setCepEntrega] = useState(entrega.cep);

  // Sincronizar com formData quando entrega mudar
  useEffect(() => {
    setLocalEntrega(entrega.endereco || "");
    setCidadeEntrega(entrega.cidade || "");
    setCepEntrega(entrega.cep || "");
  }, [entrega.endereco, entrega.cidade, entrega.cep]);

  const handleEntregaChange = (field, value) => {
    if (field === "endereco") setLocalEntrega(value);
    if (field === "cidade") setCidadeEntrega(value);
    if (field === "cep") setCepEntrega(value);
    onEntregaChange?.({ [field]: value });
  };

  const clienteFaturado = cliente.razaoSocial;
  const distribuidorName = distribuidor.razaoSocial;

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
    const margin = 12;
    const usableWidth = pageWidth - margin * 2;
    let y = 14;

    const entregaAtual = {
      ...entrega,
      endereco: localEntrega,
      cidade: cidadeEntrega,
      cep: cepEntrega,
    };

    const ensureSpace = (height) => {
      if (y + height > pageHeight - 18) {
        doc.addPage();
        y = 14;
      }
    };

    const sectionTitle = (title) => {
      ensureSpace(14);
      y += y > 18 ? 4 : 0;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(6, 29, 81);
      doc.text(title, margin, y);
      y += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;
    };

    const fieldGrid = (fields, columns = 2) => {
      const gap = 5;
      const colWidth = (usableWidth - gap * (columns - 1)) / columns;

      for (let i = 0; i < fields.length; i += columns) {
        const rowFields = fields.slice(i, i + columns);
        const rowData = rowFields.map((field) => {
          const lines = doc.splitTextToSize(pdfText(field.value), colWidth - 6);
          return { ...field, lines };
        });
        const rowHeight = Math.max(
          18,
          ...rowData.map((field) => 9 + field.lines.length * 4.2)
        );

        ensureSpace(rowHeight + 3);

        rowData.forEach((field, index) => {
          const x = margin + index * (colWidth + gap);
          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, y, colWidth, rowHeight, 2, 2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(field.label.toUpperCase(), x + 3, y + 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(field.lines, x + 3, y + 10);
        });

        y += rowHeight + 4;
      }
    };

    const tableHeader = (columns) => {
      ensureSpace(12);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, usableWidth, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);

      let x = margin;
      columns.forEach((column) => {
        doc.text(column.label, x + 1.5, y + 5.8, { maxWidth: column.width - 3 });
        x += column.width;
      });

      y += 9;
    };

    const productTable = () => {
      const columns = [
        { label: "#", width: 8, value: (_, index) => String(index + 1) },
        { label: "Descricao", width: 60, value: (p) => pdfText(p.descricao) },
        { label: "P/N", width: 24, value: (p) => pdfText(p.pn) },
        { label: "Entrega", width: 28, value: (p) => pdfText(p.entrega) },
        { label: "Qtd.", width: 16, value: (p) => pdfText(p.quantidade) },
        { label: "Valor Unit.", width: 32, value: (p) => fmt(parseFloat(p.valorUnitario) || 0) },
        { label: "Valor Total", width: 32, value: (p) => fmt(parseFloat(p.valorTotal) || 0) },
        { label: "Valor Unit. Fat.", width: 36, value: (p) => fmt(parseFloat(p.unitFaturado) || 0) },
        { label: "Total Fat.", width: 37, value: (p) => fmt(parseFloat(p.totalFaturado) || 0) },
      ];

      tableHeader(columns);

      if (produtos.length === 0) {
        ensureSpace(12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Nenhum produto informado", margin + usableWidth / 2, y + 7, { align: "center" });
        y += 12;
        return;
      }

      produtos.forEach((produto, index) => {
        const cells = columns.map((column) => {
          const value = column.value(produto, index);
          const lines = doc.splitTextToSize(value, column.width - 3);
          return { ...column, lines };
        });
        const rowHeight = Math.max(11, ...cells.map((cell) => 5 + cell.lines.length * 3.8));

        if (y + rowHeight > pageHeight - 18) {
          doc.addPage();
          y = 14;
          tableHeader(columns);
        }

        let x = margin;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.8);
        doc.setTextColor(30, 41, 59);
        cells.forEach((cell) => {
          doc.text(cell.lines, x + 1.5, y + 5, { maxWidth: cell.width - 3 });
          x += cell.width;
        });
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
        y += rowHeight;
      });

      y += 4;
    };

    const summaryBoxes = () => {
      const gap = 5;
      const boxWidth = (usableWidth - gap * 2) / 3;
      const items = [
        { label: "Valor de Compra", value: fmt(valorCompra), highlight: false },
        { label: "Valor de Faturamento", value: fmt(valorFaturamento), highlight: false },
        { label: "Total de Comissao Bruta", value: fmt(comissao), highlight: true },
      ];

      ensureSpace(25);

      items.forEach((item, index) => {
        const x = margin + index * (boxWidth + gap);
        doc.setDrawColor(item.highlight ? 30 : 226, item.highlight ? 58 : 232, item.highlight ? 138 : 240);
        doc.setFillColor(item.highlight ? 30 : 255, item.highlight ? 58 : 255, item.highlight ? 138 : 255);
        doc.roundedRect(x, y, boxWidth, 22, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(item.highlight ? 255 : 148, item.highlight ? 255 : 163, item.highlight ? 255 : 184);
        doc.text(item.label.toUpperCase(), x + 4, y + 6);
        doc.setFontSize(13);
        doc.setTextColor(item.highlight ? 255 : 30, item.highlight ? 255 : 41, item.highlight ? 255 : 59);
        doc.text(item.value, x + 4, y + 15);
      });

      y += 26;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text("OPERACOES DE VENDA", margin, y);
    y += 8;
    doc.setFontSize(19);
    doc.setTextColor(26, 58, 122);
    doc.text("Novo Pedido", margin, y);
    y += 10;

    sectionTitle("Dados do Cliente");
    fieldGrid([
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
    ]);

    sectionTitle("Dados do Distribuidor");
    fieldGrid([
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
    ]);

    sectionTitle("Dados do Produto");
    productTable();

    sectionTitle("Resumo do Pedido");
    fieldGrid([
      { label: "Distribuidor Responsavel", value: distribuidorName },
      { label: "Cliente Faturado", value: clienteFaturado },
      { label: "Local de Entrega", value: entregaAtual.endereco },
      { label: "Cidade", value: entregaAtual.cidade },
      { label: "CEP", value: entregaAtual.cep },
      { label: "Produtos", value: produtos.map((p) => p.descricao).filter(Boolean).join(", ") },
    ], 3);

    sectionTitle("Resumo Financeiro");
    summaryBoxes();

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")} - TND Brasil`,
        margin,
        pageHeight - 8
      );
      doc.text(`Pagina ${page} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    doc.save("pedido.pdf");
  };

  const navigate = useNavigate();

  const adicionarPedido = () => {
    const novoId = `V${Date.now().toString().slice(-6)}`;
    const clienteLabel = clienteFaturado || cliente.nome || "Cliente";
    const nomeVenda = `VENDA ${novoId}`;
    const pedido = {
      id: novoId,
      nome: nomeVenda,
      cliente: clienteLabel,
      comissao: fmt(comissao),
      status: "Aguardando",
      tipo: "pendente",
      parcelas: [{ label: "Parcela 1/1", valor: fmt(valorFaturamento) }],
    };

    try {
      const chave = "korp_pedidos";
      const armazenado = JSON.parse(localStorage.getItem(chave) || "[]");
      armazenado.push(pedido);
      localStorage.setItem(chave, JSON.stringify(armazenado));
    } catch (e) {
      console.error("Erro ao salvar pedido:", e);
    }

    navigate("/vendedores/home");
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
            <span className="resumo-plain-value">{distribuidorName}</span>
          </div>

          <div className="resumo-field">
            <span className="resumo-label">CLIENTE FATURADO</span>
            <span className="resumo-plain-value">{clienteFaturado}</span>
          </div>

          <div className="resumo-field">
            <span className="resumo-label">LOCAL DE ENTREGA</span>
            <input
              type="text"
              value={localEntrega}
              onChange={(e) => handleEntregaChange("endereco", e.target.value)}
              className="resumo-input"
              placeholder="Digite o local de entrega"
            />
          </div>

          <div className="resumo-row-2col">
            <div className="resumo-field">
              <span className="resumo-label">CIDADE</span>
              <input
                type="text"
                value={cidadeEntrega}
                onChange={(e) => handleEntregaChange("cidade", e.target.value)}
                className="resumo-input"
                placeholder="Digite a cidade"
              />
            </div>
            <div className="resumo-field">
              <span className="resumo-label">CEP</span>
              <input
                type="text"
                value={cepEntrega}
                onChange={(e) => handleEntregaChange("cep", e.target.value)}
                className="resumo-input"
                placeholder="00000-000"
              />
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
          <button className="btn-primary" onClick={adicionarPedido}>
            Adicionar Pedido
          </button>
          <button className="btn-secondary" onClick={gerarPDF}>
            ⬇ Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );

}
