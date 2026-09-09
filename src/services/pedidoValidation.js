export function validarCamposPedido(data) {
  if (!String(data.cliente?.nomeFantasia || "").trim()) return "Informe o nome fantasia do cliente.";
  if (!String(data.distribuidor?.nomeFantasia || "").trim()) return "Informe o nome fantasia do distribuidor.";
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
  }
  return "";
}
