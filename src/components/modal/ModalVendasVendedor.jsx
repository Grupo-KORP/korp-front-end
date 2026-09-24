import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../services/api.js";
import "./ModalVendasVendedor.css";

const moeda = (valor) => valor == null ? "Não informada" : Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pagamentos = { PIX: "Pix", BOLETO: "Boleto", CARTAO_CREDITO: "Cartão de crédito", CARTAO_DEBITO: "Cartão de débito", TRANSFERENCIA: "Transferência", DINHEIRO: "Dinheiro" };
const statusVenda = { EM_ANDAMENTO: "Em andamento", APROVADO: "Aprovada", CANCELADO: "Cancelada", REPROVADO: "Reprovada", FINALIZADO: "Finalizada", PENDENTE: "Pendente" };

export default function ModalVendasVendedor({ vendedor, dark, onClose }) {
  const dialog = useRef(null);
  const [vendas, setVendas] = useState([]);
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
    api.get(`/financeiro/vendedores/${vendedor.idVendedor}/vendas`, { signal: controller.signal })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Resposta inválida");
        if (!controller.signal.aborted) setVendas(data);
      })
      .catch(() => { if (!controller.signal.aborted) setErro("Não foi possível carregar as vendas deste vendedor."); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [vendedor.idVendedor, tentativa]);
  return createPortal(
    <dialog ref={dialog} className={`vendedor-vendas-modal${dark ? " vendedor-vendas-dark" : ""}`} aria-labelledby="vendedor-vendas-titulo"
      onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="vendedor-vendas-conteudo">
        <header className="vendedor-vendas-cabecalho">
          <div><p className="vendedor-vendas-rotulo">Histórico de vendas</p><h2 id="vendedor-vendas-titulo">{vendedor.nome}</h2><p>{vendedor.email}</p></div>
          <button type="button" className="vendedor-vendas-fechar" aria-label="Fechar histórico de vendas" onClick={onClose} autoFocus>×</button>
        </header>
        <div className="vendedor-vendas-corpo" aria-busy={carregando}>
          {carregando ? <p className="vendedor-vendas-mensagem" role="status">Carregando vendas...</p>
            : erro ? <div className="vendedor-vendas-mensagem" role="alert"><p>{erro}</p><button type="button" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button></div>
            : vendas.length === 0 ? <p className="vendedor-vendas-mensagem">Este vendedor ainda não possui vendas cadastradas.</p>
            : <>
              <p className="vendedor-vendas-total">{vendas.length} {vendas.length === 1 ? "venda cadastrada" : "vendas cadastradas"} · Todo o período</p>
              <div className="vendedor-vendas-tabela" tabIndex={0} role="region" aria-label="Lista de vendas do vendedor">
                <table><thead><tr>{["Nome da venda", "Código", "Cliente", "Faturamento", "Comissão", "Pagamento", "Status da venda"].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
                  <tbody>{vendas.map((venda) => <tr key={venda.idPedido}>
                    <td>{venda.nome}</td><td>{venda.codigo}</td><td>{venda.cliente || "Não informado"}</td>
                    <td className="vendedor-vendas-moeda">{moeda(venda.valorFaturamento)}</td><td className="vendedor-vendas-moeda">{moeda(venda.valorComissao)}</td>
                    <td>{pagamentos[venda.metodoPagamento] || venda.metodoPagamento || "Não informado"}</td>
                    <td><span className="vendedor-vendas-status" data-status={venda.status}>{statusVenda[venda.status] || venda.status || "Não informado"}</span></td>
                  </tr>)}</tbody>
                </table>
              </div>
            </>}
        </div>
        <footer className="vendedor-vendas-rodape"><button type="button" onClick={onClose}>Fechar</button></footer>
      </div>
    </dialog>, document.body,
  );
}
