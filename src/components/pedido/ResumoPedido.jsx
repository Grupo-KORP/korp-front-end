import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumoPedido.css";
import dinheiroIcon from "../../assets/dinheiro.png";
import perfilDistribuidor from "../../assets/distribuidor.png";
import html2pdf from "html2pdf.js";

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

  const gerarPDF = () => {
    const element = document.querySelector(".pdf-area");

    const opt = {
      margin: 10,
      filename: "pedido.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // melhora qualidade
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.body.classList.remove("pdf-mode");
    });
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
                <span className="resumo-empty">Nenhum produto</span>
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