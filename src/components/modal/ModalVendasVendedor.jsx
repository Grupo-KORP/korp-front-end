import ActionIcon from "../ui/ActionIcon";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../services/api.js";
import "./ModalVendasVendedor.css";

const moeda = (valor) => valor == null ? "Não informada" : Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const lerValor = (objeto, chaves) => {
  for (const chave of chaves) {
    const valor = objeto?.[chave];
    if (valor != null && Number.isFinite(Number(valor))) return Number(valor);
  }
  return null;
};
const somarItens = (itens, chaves) => {
  if (!Array.isArray(itens) || itens.length === 0) return null;
  const valores = itens.map((item) => lerValor(item, chaves));
  return valores.every((valor) => valor != null)
    ? valores.reduce((total, valor) => total + valor, 0)
    : null;
};
const obterValoresPedido = (venda) => {
  const faturamento = lerValor(venda, ["valorFaturamento", "totalFaturado", "valorTotalCliente"])
    ?? somarItens(venda.itens, ["vlrTotalCliente", "totalFaturado", "valorTotalCliente"]);
  const compra = somarItens(venda.itens, ["vlrTotalDistr", "valorTotal", "totalCompra"]);
  const comissao = lerValor(venda, ["valorComissao", "totalComissao"])
    ?? (faturamento != null && compra != null ? faturamento - compra : null);
  return { faturamento, comissao };
};
const pagamentos = { AVISTA: "À vista", BOLETO: "Boleto" };
const statusVenda = { EM_ANDAMENTO: "Em andamento", APROVADO: "Aprovada", CANCELADO: "Cancelada", REPROVADO: "Reprovada", FINALIZADO: "Finalizada", PENDENTE: "Pendente" };

export default function ModalVendasVendedor({ vendedor, dark, onClose }) {
  const dialog = useRef(null);
  const [vendas, setVendas] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    const modal = dialog.current;
    modal.showModal();
    document.body.style.overflow = "hidden";
    return () => { modal.close(); document.body.style.overflow = overflow; anterior?.focus(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true); setErro(null); setVendas([]);
    api.get(`/pedidos/vendedor/${vendedor.idVendedor}`, {
      params: { page: 0, size: 10 },
      signal: controller.signal,
    })
      .then(({ data }) => {
        const pedidos = Array.isArray(data) ? data : data?.content;
        if (!Array.isArray(pedidos)) throw new Error("Resposta inválida");
        if (!controller.signal.aborted) {
          setVendas(pedidos);
          setTotalVendas(data.totalElements ?? pedidos.length);
        }
      })
      .catch(() => { if (!controller.signal.aborted) setErro("Não foi possível carregar os pedidos de venda deste vendedor."); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [vendedor.idVendedor, tentativa]);
  return createPortal(
    <dialog ref={dialog} className={`vendedor-vendas-modal${dark ? " vendedor-vendas-dark" : ""}`} aria-labelledby="vendedor-vendas-titulo"
      onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="vendedor-vendas-conteudo">
        <header className="vendedor-vendas-cabecalho">
          <div><p className="vendedor-vendas-rotulo">Histórico de pedidos de venda</p><h2 id="vendedor-vendas-titulo">{vendedor.nome}</h2><p>{vendedor.email}</p></div>
          <button type="button" className="vendedor-vendas-fechar" aria-label="Fechar histórico de pedidos de venda" onClick={onClose} autoFocus><ActionIcon name="close" /></button>
        </header>
        <div className="vendedor-vendas-corpo" aria-busy={carregando}>
          {carregando ? <p className="vendedor-vendas-mensagem" role="status">Carregando pedidos de venda...</p>
            : erro ? <div className="vendedor-vendas-mensagem" role="alert"><p>{erro}</p><button type="button" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button></div>
            : vendas.length === 0 ? <p className="vendedor-vendas-mensagem">Este vendedor ainda não possui pedidos de venda cadastrados.</p>
            : <>
              <p className="vendedor-vendas-total">Exibindo {vendas.length} de {totalVendas} {totalVendas === 1 ? "pedido de venda" : "pedidos de venda"}</p>
              <div className="vendedor-vendas-tabela" tabIndex={0} role="region" aria-label="Lista de pedidos de venda do vendedor">
                <table>
                  <colgroup>
                    <col style={{ width: "24%" }} /><col style={{ width: "14%" }} /><col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} />
                  </colgroup>
                  <thead><tr>{["Nome do pedido de venda", "Código do pedido de venda", "Cliente", "Faturamento", "Comissão", "Pagamento", "Status do pedido de venda"].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
                  <tbody>{vendas.map((venda) => {
                    const { faturamento, comissao } = obterValoresPedido(venda);
                    return <tr key={venda.idPedido}>
                    <td>{venda.nome || `Pedido #${venda.idPedido}`}</td><td>{venda.codigo || venda.idPedido}</td><td>{venda.cliente?.nomeFantasia || venda.cliente?.razaoSocial || venda.cliente || "Não informado"}</td>
                    <td className="vendedor-vendas-moeda">{moeda(faturamento)}</td><td className="vendedor-vendas-moeda">{moeda(comissao)}</td>
                    <td>{pagamentos[venda.metodoPagamento] || venda.metodoPagamento || "Não informado"}</td>
                    <td><span className="vendedor-vendas-status" data-status={venda.status}>{statusVenda[venda.status] || venda.status || "Não informado"}</span></td>
                  </tr>})}</tbody>
                </table>
              </div>
            </>}
        </div>
        <footer className="vendedor-vendas-rodape"><button type="button" className="modal-close-button" onClick={onClose}>Fechar</button></footer>
      </div>
    </dialog>, document.body,
  );
}
