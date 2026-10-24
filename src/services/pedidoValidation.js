export function validarCamposPedido(data) {
  if (!String(data.cliente?.nomeFantasia || "").trim()) return "Informe o nome fantasia do cliente.";
  if (!String(data.distribuidor?.nomeFantasia || "").trim()) return "Informe o nome fantasia do distribuidor.";
  if (!data.cliente?.id) return "Salve o cadastro do cliente antes de finalizar o pedido.";
  if (!data.distribuidor?.id) return "Salve o cadastro do distribuidor antes de finalizar o pedido.";
  if (!data.produtos?.length) return "Selecione pelo menos um produto.";

  for (const [index, produto] of data.produtos.entries()) {
    const prefix = `Produto ${index + 1}: `;
    if (!produto.fkProduto || !String(produto.descricao || "").trim()) {
      return `${prefix}selecione ou cadastre o produto.`;
    }
    const quantidade = Number(produto.quantidade);
    if (!Number.isInteger(quantidade) || quantidade <= 0) return `${prefix}informe uma quantidade inteira maior que zero.`;
    for (const [field, label] of [["valorUnitario", "valor unitário"], ["unitFaturado", "valor unitário faturado"]]) {
      const value = produto[field];
      if (value == null || String(value).trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0) {
        return `${prefix}informe o ${label} (zero ou maior).`;
      }
    }
    // Comissão nunca negativa: o faturado pode ser igual, jamais menor que o do distribuidor.
    if (Math.round(Number(produto.unitFaturado) * 100) < Math.round(Number(produto.valorUnitario) * 100)) {
      return `${prefix}o valor unitário faturado não pode ser menor que o valor unitário do distribuidor.`;
    }
  }
  return "";
}
