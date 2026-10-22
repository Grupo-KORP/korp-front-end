export const LIMITE_RASCUNHOS = 10;

const dadosVazios = () => ({
  cliente: {},
  distribuidor: {},
  produtos: [],
  entrega: {},
  formaPagamento: "",
});

// Conteúdo enviado ao back; o PDF nunca entra no rascunho.
export function montarDadosRascunho(formData, resumoData = {}) {
  const { cliente, distribuidor, produtos, entrega, formaPagamento } = { ...formData, ...resumoData };
  return {
    cliente: cliente || {},
    distribuidor: distribuidor || {},
    produtos: produtos || [],
    entrega: entrega || {},
    formaPagamento: formaPagamento || "",
  };
}

// Converte a resposta do back no formData da tela, garantindo todas as chaves.
export function dadosParaFormData(dados) {
  return { ...dadosVazios(), ...(dados || {}) };
}

export function diasParaExpirar(dtExpiracao, agora = new Date()) {
  const restante = new Date(dtExpiracao).getTime() - agora.getTime();
  return Math.max(0, Math.ceil(restante / 86_400_000));
}
