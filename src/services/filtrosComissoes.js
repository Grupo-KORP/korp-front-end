export function parcelasDoPeriodo(vendas, selecao, hoje = new Date()) {
  const ano = selecao?.y ?? hoje.getFullYear();
  const mes = String((selecao?.m ?? hoje.getMonth()) + 1).padStart(2, "0");
  const periodo = `${ano}-${mes}`;
  const dia = selecao?.type === "day" ? `${periodo}-${String(selecao.d).padStart(2, "0")}` : null;
  return vendas.flatMap((venda) => venda.parcelas
    .filter((parcela) => dia ? parcela.previsao === dia : parcela.previsao?.slice(0, 7) === periodo)
    .map((parcela) => ({ ...parcela, venda })));
}

export function filtrarStatusParcelas(parcelas, status) {
  return status ? parcelas.filter((parcela) => parcela.status === status) : parcelas;
}
