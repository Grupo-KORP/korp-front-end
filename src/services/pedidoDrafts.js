export const LIMITE_RASCUNHOS = 10;

// "entrega" é o endereço de entrega (rua, cidade, CEP); "prazoEntrega" é o prazo do pedido (ex.: "Imediata").
const dadosVazios = () => ({
  cliente: {},
  distribuidor: {},
  produtos: [],
  entrega: {},
  formaPagamento: "",
  prazoEntrega: "",
});

// Conteúdo enviado ao back; o PDF nunca entra no rascunho.
export function montarDadosRascunho(formData, resumoData = {}) {
  const { cliente, distribuidor, produtos, entrega, formaPagamento, prazoEntrega } = { ...formData, ...resumoData };
  return {
    cliente: cliente || {},
    distribuidor: distribuidor || {},
    produtos: produtos || [],
    entrega: entrega || {},
    formaPagamento: formaPagamento || "",
    prazoEntrega: prazoEntrega || "",
  };
}

// Converte a resposta do back no formData da tela, garantindo todas as chaves.
export function dadosParaFormData(dados) {
  const formData = { ...dadosVazios(), ...(dados || {}) };
  // Rascunhos antigos guardavam a entrega em cada produto: usa a do primeiro produto que tiver.
  if (!formData.prazoEntrega) {
    const doProduto = (formData.produtos || []).find((produto) => String(produto?.entrega ?? "").trim());
    if (doProduto) formData.prazoEntrega = String(doProduto.entrega).trim();
  }
  return formData;
}

export function diasParaExpirar(dtExpiracao, agora = new Date()) {
  const restante = new Date(dtExpiracao).getTime() - agora.getTime();
  return Math.max(0, Math.ceil(restante / 86_400_000));
}
