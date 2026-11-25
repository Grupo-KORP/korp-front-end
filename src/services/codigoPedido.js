// O código do pedido vem pronto do back no formato DDMMAA-P01 (ex.: 251126-P03).
// Aqui só ficam recortes para espaços pequenos, como o quadradinho ao lado de cada venda.

/** "251126-P03" -> "P03". Sem código, devolve string vazia. */
export function sequenciaDoCodigo(codigo) {
  const texto = String(codigo ?? "");
  const separador = texto.lastIndexOf("-");
  return separador >= 0 ? texto.slice(separador + 1) : texto;
}
