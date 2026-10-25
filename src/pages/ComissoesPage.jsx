import { formatarStatusPagamento } from "../services/statusPagamento.js";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import StatusComissaoCell from "../components/ui/StatusComissaoCell.jsx";
import ModalDetalheVenda from "../components/modal/Modaldetalhevenda.jsx";
import NavbarFinanceiro from "../layout/NavbarFinanceiro.jsx";
import logoTnd from "../assets/logo-tnd.webp";
import DatePickerCalendar from "../components/ui/DatePickerCalendar.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import "./ComissoesPage.css";
import { atualizarStatusComissao, buscarComissoesFinanceiro } from "../services/api.js";
import Pagination from "../components/pagination/pagination.jsx";

const STATUS = {
  pendente: "Pendente",
  liberada: "Liberada",
  paga: "Paga",
  cancelada: "Cancelada",
};

const STATUS_OPTIONS = Object.values(STATUS);
const STATUS_COMISSAO_OPTIONS = [
  { value: "PENDENTE", label: STATUS.pendente },
  { value: "LIBERADA", label: STATUS.liberada },
  { value: "PAGA", label: STATUS.paga },
  { value: "CANCELADA", label: STATUS.cancelada },
];

const hoje = new Date();
const amanha = new Date(hoje);
amanha.setDate(hoje.getDate() + 1);

const toISODate = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const formatarData = (dateISO) =>
  new Date(`${dateISO}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const vendasMockadas = [
  {
    id: "VD-2048",
    venda: "Sistema Korp Pro",
    cliente: "Aurora Distribuidora",
    vendedor: "Marina Lopes",
    percentual: "8%",
    dataVenda: toISODate(hoje),
    valorVenda: 18750,
    detalhesPedido: {
      numeroPedido: "PED-1001",
      vendedor: "Marina Lopes",
      metodoPagamento: "À vista",
      notaFiscal: "NF-7741",
      observacoes: "Cliente com implantação prioritária",
      statusPedido: "Em andamento",
      cliente: {
        nomeFantasia: "Aurora Distribuidora",
        razaoSocial: "Aurora Distribuidora Ltda.",
        cnpj: "12.345.678/0001-90",
        inscricaoEstadual: "123.456.789",
        fone: "(11) 3333-4444",
        cep: "01310-100",
        endereco: "Rua das Flores",
        numero: "120",
        complemento: "Sala 3",
        cidade: "São Paulo",
        uf: "SP",
        contato: "Larissa Brito",
        email: "financeiro@aurora.com.br",
      },
      distribuidor: {
        nomeFantasia: "Korp Distribuição",
        razaoSocial: "Korp Distribuição e Representações S.A.",
        cnpj: "98.765.432/0001-10",
        inscricaoEstadual: "987.654.321",
        fone: "(11) 2222-3333",
        cep: "04567-890",
        endereco: "Avenida Paulista",
        numero: "500",
        complemento: "Andar 10",
        cidade: "São Paulo",
        uf: "SP",
        contato: "Renato Costa",
        email: "comercial@korpdist.com.br",
      },
      produto: {
        descricao: "Sistema Korp Pro",
        pn: "PN-1001",
        entrega: "Entregue",
        quantidade: 1,
        valorUnitario: 18750,
        valorTotal: 18750,
        valorUnitarioFaturado: 18750,
        totalFaturado: 18750,
      },
      resumoFinanceiro: {
        valorCompra: 18750,
        valorFaturamento: 18750,
        totalComissaoBruta: 18750,
      },
    },
    parcelas: [
      { id: "2048-1", numero: "1/3", valor: 500, status: STATUS.paga, previsao: toISODate(hoje), notaFiscal: "NF-7741" },
      { id: "2048-2", numero: "2/3", valor: 500, status: STATUS.liberada, previsao: toISODate(amanha), notaFiscal: "" },
      { id: "2048-3", numero: "3/3", valor: 500, status: STATUS.pendente, previsao: "2026-08-16", notaFiscal: "" },
    ],
  },
  {
    id: "VD-2051",
    venda: "Licencas Enterprise",
    cliente: "Nexus Farma",
    vendedor: "Rafael Nunes",
    percentual: "6%",
    dataVenda: toISODate(hoje),
    valorVenda: 26400,
    detalhesPedido: {
      numeroPedido: "PED-1002",
      vendedor: "Rafael Nunes",
      metodoPagamento: "Boleto",
      notaFiscal: "NF-7725",
      observacoes: "Acompanhamento de implantação",
      statusPedido: "Aguardando liberação",
      cliente: {
        nomeFantasia: "Nexus Farma",
        razaoSocial: "Nexus Farma Medicamentos Ltda.",
        cnpj: "22.333.444/0001-55",
        inscricaoEstadual: "223.344.555",
        fone: "(21) 5555-6666",
        cep: "20040-020",
        endereco: "Rua do Comércio",
        numero: "90",
        complemento: "Bloco B",
        cidade: "Rio de Janeiro",
        uf: "RJ",
        contato: "Beatriz Gomes",
        email: "compras@nexusfarma.com.br",
      },
      distribuidor: {
        nomeFantasia: "Korp Distribuição",
        razaoSocial: "Korp Distribuição e Representações S.A.",
        cnpj: "98.765.432/0001-10",
        inscricaoEstadual: "987.654.321",
        fone: "(11) 2222-3333",
        cep: "04567-890",
        endereco: "Avenida Paulista",
        numero: "500",
        complemento: "Andar 10",
        cidade: "São Paulo",
        uf: "SP",
        contato: "Renato Costa",
        email: "comercial@korpdist.com.br",
      },
      produto: {
        descricao: "Licenças Enterprise",
        pn: "PN-2002",
        entrega: "Pendente",
        quantidade: 5,
        valorUnitario: 5280,
        valorTotal: 26400,
        valorUnitarioFaturado: 5280,
        totalFaturado: 26400,
      },
      resumoFinanceiro: {
        valorCompra: 26400,
        valorFaturamento: 26400,
        totalComissaoBruta: 1584,
      },
    },
    parcelas: [
      { id: "2051-1", numero: "1/4", valor: 396, status: STATUS.liberada, previsao: toISODate(hoje), notaFiscal: "" },
      { id: "2051-2", numero: "2/4", valor: 396, status: STATUS.pendente, previsao: toISODate(amanha), notaFiscal: "" },
      { id: "2051-3", numero: "3/4", valor: 396, status: STATUS.pendente, previsao: "2026-08-20", notaFiscal: "" },
      { id: "2051-4", numero: "4/4", valor: 396, status: STATUS.pendente, previsao: "2026-09-20", notaFiscal: "" },
    ],
  },
  {
    id: "VD-2060",
    venda: "Implantacao Fiscal",
    cliente: "Blue Norte",
    vendedor: "Camila Andrade",
    percentual: "10%",
    dataVenda: "2026-07-12",
    valorVenda: 9200,
    detalhesPedido: {
      numeroPedido: "PED-1003",
      vendedor: "Camila Andrade",
      metodoPagamento: "À vista",
      notaFiscal: "NF-7730",
      observacoes: "Pedido concluído com faturamento fechado",
      statusPedido: "Finalizado",
      cliente: {
        nomeFantasia: "Blue Norte",
        razaoSocial: "Blue Norte Comércio Ltda.",
        cnpj: "33.444.555/0001-77",
        inscricaoEstadual: "334.455.667",
        fone: "(41) 7777-8888",
        cep: "80020-000",
        endereco: "Rua do Porto",
        numero: "45",
        complemento: "Galpão 2",
        cidade: "Curitiba",
        uf: "PR",
        contato: "Lúcia Nunes",
        email: "contato@bluenorte.com.br",
      },
      distribuidor: {
        nomeFantasia: "Blue Norte Distribuidor",
        razaoSocial: "Blue Norte Distribuidor Ltda.",
        cnpj: "44.555.666/0001-88",
        inscricaoEstadual: "445.566.777",
        fone: "(41) 6666-7777",
        cep: "80410-100",
        endereco: "Rua das Indústrias",
        numero: "77",
        complemento: null,
        cidade: "Curitiba",
        uf: "PR",
        contato: "Marcos Pinto",
        email: "vendas@bluenortedistribuidor.com.br",
      },
      produto: {
        descricao: "Implantação Fiscal",
        pn: "PN-3003",
        entrega: "Concluída",
        quantidade: 1,
        valorUnitario: 9200,
        valorTotal: 9200,
        valorUnitarioFaturado: 9200,
        totalFaturado: 9200,
      },
      resumoFinanceiro: {
        valorCompra: 9200,
        valorFaturamento: 9200,
        totalComissaoBruta: 920,
      },
    },
    parcelas: [
      { id: "2060-1", numero: "1/2", valor: 460, status: STATUS.paga, previsao: "2026-07-12", notaFiscal: "NF-7730" },
      { id: "2060-2", numero: "2/2", valor: 460, status: STATUS.pendente, previsao: toISODate(amanha), notaFiscal: "" },
    ],
  },
  {
    id: "VD-2072",
    venda: "Suporte Premium",
    cliente: "Grupo Sentinela",
    vendedor: "Marina Lopes",
    percentual: "7%",
    dataVenda: "2026-07-09",
    valorVenda: 12600,
    detalhesPedido: {
      numeroPedido: "PED-1004",
      vendedor: "Marina Lopes",
      metodoPagamento: "À vista",
      notaFiscal: "NF-7718",
      observacoes: "Contrato anual com renovação automática",
      statusPedido: "Em andamento",
      cliente: {
        nomeFantasia: "Grupo Sentinela",
        razaoSocial: "Grupo Sentinela Serviços S.A.",
        cnpj: "55.666.777/0001-99",
        inscricaoEstadual: "556.677.888",
        fone: "(31) 9999-0000",
        cep: "30140-070",
        endereco: "Rua da Liberdade",
        numero: "300",
        complemento: "Sala 8",
        cidade: "Belo Horizonte",
        uf: "MG",
        contato: "Clara Mendes",
        email: "financeiro@sentinela.com.br",
      },
      distribuidor: {
        nomeFantasia: "Korp Distribuição",
        razaoSocial: "Korp Distribuição e Representações S.A.",
        cnpj: "98.765.432/0001-10",
        inscricaoEstadual: "987.654.321",
        fone: "(11) 2222-3333",
        cep: "04567-890",
        endereco: "Avenida Paulista",
        numero: "500",
        complemento: "Andar 10",
        cidade: "São Paulo",
        uf: "SP",
        contato: "Renato Costa",
        email: "comercial@korpdist.com.br",
      },
      produto: {
        descricao: "Suporte Premium",
        pn: "PN-4004",
        entrega: "Agendada",
        quantidade: 1,
        valorUnitario: 12600,
        valorTotal: 12600,
        valorUnitarioFaturado: 12600,
        totalFaturado: 12600,
      },
      resumoFinanceiro: {
        valorCompra: 12600,
        valorFaturamento: 12600,
        totalComissaoBruta: 882,
      },
    },
    parcelas: [
      { id: "2072-1", numero: "1/3", valor: 294, status: STATUS.paga, previsao: "2026-07-09", notaFiscal: "NF-7718" },
      { id: "2072-2", numero: "2/3", valor: 294, status: STATUS.liberada, previsao: "2026-08-09", notaFiscal: "" },
      { id: "2072-3", numero: "3/3", valor: 294, status: STATUS.pendente, previsao: "2026-09-09", notaFiscal: "" },
    ],
  },
];

const filtrosKpi = [
  { chave: STATUS.paga, rotulo: "Parcelas Pagas" },
  { chave: STATUS.liberada, rotulo: "Parcelas Liberadas" },
  { chave: STATUS.pendente, rotulo: "Parcelas Pendentes" },
];

function Icone({ tipo }) {
  const paths = {
    paga: "M9 12l2 2 4-4m5 2a8 8 0 11-16 0 8 8 0 0116 0z",
    liberada: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
    pendente: "M12 9v3.75m0 3h.008v.008H12v-.008zM10.3 4.3L2.8 17.2A2 2 0 004.5 20h15a2 2 0 001.7-2.8L13.7 4.3a2 2 0 00-3.4 0z",
    busca: "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
    fechar: "M6 18L18 6M6 6l12 12",
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[tipo]} />
    </svg>
  );
}

function totalComissao(venda) {
  return venda.parcelas.reduce((total, parcela) => total + parcela.valor, 0);
}

function statusVenda(venda) {
  if (venda.parcelas.every((parcela) => parcela.status === STATUS.paga)) return STATUS.paga;
  if (venda.parcelas.some((parcela) => parcela.status === STATUS.liberada)) return STATUS.liberada;
  return STATUS.pendente;
}

function ComissaoKpi({ filtro, valor, ativo, onClick }) {
  const tipo = filtro.chave.toLowerCase();

  return (
    <button className={`comissoes-kpi ${ativo ? "is-active" : ""}`} onClick={onClick}>
      <span className="comissoes-kpi-top">
        <span>{filtro.rotulo}</span>
        <span className="comissoes-kpi-icon">
          <Icone tipo={tipo} />
        </span>
      </span>
      <strong>{valor}</strong>
      <small>{ativo ? "Filtro aplicado" : "Clique para filtrar"}</small>
    </button>
  );
}

function StatusBadge({ status, children }) {
  return <span className={`comissoes-status status-${normalizar(status)}`}>{children || formatarStatusPagamento(status)}</span>;
}

function ModalStatusComissao({ comissao, dark, salvando, onClose, onSave }) {
  const dialog = useRef(null);
  const [status, setStatus] = useState(comissao.statusCodigo);

  useEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    return () => modal.close();
  }, []);

  const confirmar = async () => {
    if (await onSave(comissao.idComissao, status)) onClose();
  };

  return (
    <dialog
      ref={dialog}
      className={`comissoes-status-modal${dark ? " comissoes-status-modal-dark" : ""}`}
      aria-labelledby="comissoes-status-modal-title"
      onCancel={(event) => { event.preventDefault(); if (!salvando) onClose(); }}
      onClick={(event) => { if (event.target === dialog.current && !salvando) onClose(); }}
    >
      <div className="comissoes-status-modal-content">
        <header className="comissoes-status-modal-header">
          <div>
            <p>Gestão de comissões</p>
            <h2 id="comissoes-status-modal-title">Alterar status</h2>
          </div>
          <button type="button" className="comissoes-modal-close" aria-label="Fechar" disabled={salvando} onClick={onClose}>
            <Icone tipo="fechar" />
          </button>
        </header>
        <div className="comissoes-status-modal-body">
          <p><strong>Pedido:</strong> {comissao.pedido}</p>
          <p><strong>Parcela:</strong> {comissao.numero}</p>
          <fieldset className="comissoes-status-options">
            <legend>Novo status</legend>
            {STATUS_COMISSAO_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`comissoes-status-choice comissoes-status status-${normalizar(option.label)}${status === option.value ? " is-selected" : ""}`}
                aria-pressed={status === option.value}
                disabled={salvando}
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </fieldset>
        </div>
        <footer className="comissoes-status-modal-actions">
          <button type="button" className="comissoes-status-cancel" disabled={salvando} onClick={onClose}>Cancelar</button>
          <button type="button" className="comissoes-status-confirm" disabled={salvando || status === comissao.statusCodigo} onClick={confirmar}>
            {salvando ? "Salvando..." : "Salvar status"}
          </button>
        </footer>
      </div>
    </dialog>
  );
}

function VendaModal({ venda, onClose, onStatusChange, onNotaChange, escuro }) {
  const [rascunho, setRascunho] = useState(null);
  const editando = rascunho !== null;
  if (!venda) return null;
  const pedido = venda.detalhesPedido || {};
  const pagamentoAVista = normalizar(pedido.metodoPagamento || "") !== "boleto";
  const pagamentos = pagamentoAVista && venda.parcelas.length > 0
    ? [{
      ...venda.parcelas[0],
      valor: totalComissao(venda),
      status: statusVenda(venda),
      notaFiscal: [...new Set(venda.parcelas.map((parcela) => parcela.notaFiscal).filter(Boolean))].join(", "),
    }]
    : venda.parcelas;
  const atualizarPagamento = (callback, pagamentoId, valor) => {
    const registros = pagamentoAVista ? venda.parcelas : venda.parcelas.filter((parcela) => parcela.id === pagamentoId);
    registros.forEach((parcela) => callback(venda.id, parcela.id, valor));
  };
  const editarPagamento = (id, campo, valor) => {
    setRascunho((atuais) => atuais.map((pagamento) => pagamento.id !== id
      ? pagamento
      : {
        ...pagamento,
        [campo]: valor,
        ...(campo === "status" && valor !== STATUS.paga ? { notaFiscal: "" } : {}),
      }));
  };
  const salvarPagamentos = () => {
    rascunho.forEach((pagamento) => {
      const original = pagamentos.find((item) => item.id === pagamento.id);
      if (pagamento.status !== original.status) {
        atualizarPagamento(onStatusChange, pagamento.id, pagamento.status);
      }
      if (pagamento.notaFiscal !== original.notaFiscal) {
        atualizarPagamento(onNotaChange, pagamento.id, pagamento.notaFiscal);
      }
    });
    setRascunho(null);
    toast.success("Pagamentos atualizados com sucesso!");
  };
  const produto = pedido.produto || {};
  const status = statusVenda(venda);
  const metodos = { "a vista": "AVISTA", boleto: "BOLETO" };
  const pessoa = (dados = {}) => ({ ...dados, telefone: dados.telefone ?? dados.fone });
  const detalhes = {
    cliente: pessoa(pedido.cliente),
    distribuidor: pessoa(pedido.distribuidor),
    pedido: {
      ...pedido,
      numeroNotaDistribuidor: pedido.numeroNotaDistribuidor ?? pedido.notaFiscal,
      metodoPagamento: metodos[normalizar(pedido.metodoPagamento || "")] || pedido.metodoPagamento || "",
      quantidadeParcelas: pagamentoAVista ? 0 : venda.parcelas.length,
    },
    produto: {
      ...produto,
      descricao: produto.descricao || venda.venda,
      valorUnitario: formatarMoeda(produto.valorUnitario),
      valorTotal: formatarMoeda(produto.valorTotal),
      valorUnitarioFaturado: formatarMoeda(produto.valorUnitarioFaturado),
      totalFaturado: formatarMoeda(produto.totalFaturado ?? venda.valorVenda),
    },
  };
  return (
    <ModalDetalheVenda
      key={venda.id}
      venda={{ ...venda, nome: venda.venda, status, tipo: normalizar(status), comissao: formatarMoeda(totalComissao(venda)) }}
      mes="financeiro"
      detalhesVenda={{ [`financeiro-${venda.id}`]: detalhes }}
      aoFechar={onClose}
      escuro={escuro}
      somenteLeitura
      parcelasConteudo={(
          <section className="comissoes-home-modal-section">
            <div className="comissoes-home-payment-header">
            <div className="comissoes-home-section-title comissoes-home-section-title-green">
              <span />
              <h3>Pagamentos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {editando ? (
                <>
                  <button data-ui-action type="button" onClick={() => setRascunho(null)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border ${escuro ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                    Cancelar
                  </button>
                  <button data-ui-action type="button" onClick={salvarPagamentos}
                    className="modal-save-button px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all bg-blue-600 text-white hover:bg-blue-700">
                    Salvar
                  </button>
                </>
              ) : (
                <button data-ui-action type="button" onClick={() => setRascunho(pagamentos.map((pagamento) => ({ ...pagamento })))}
                  className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border ${escuro ? "bg-blue-500/10 border-blue-400 text-blue-400 hover:bg-blue-500/20" : "bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-100"}`}>
                  Editar
                </button>
              )}
            </div>
            </div>

            <div className="comissoes-home-parcelas">
              {(rascunho || pagamentos).map((parcela) => (
                <div className="comissoes-home-parcela" key={parcela.id}>
                  <div className="comissoes-home-parcela-info">
                    <strong>{pagamentoAVista ? "Pagamento à vista" : `Pagamento ${parcela.numero}`}</strong>
                    <span>{formatarMoeda(parcela.valor)} - prevista para {formatarData(parcela.previsao)}</span>
                  </div>

                  <label>
                    Status
                    <select disabled={!editando} value={parcela.status} onChange={(event) => editarPagamento(parcela.id, "status", event.target.value)}>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {formatarStatusPagamento(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {parcela.status === STATUS.paga && (
                    <label>
                      Nota Fiscal do Vendedor
                      <input
                        type="text"
                        disabled={!editando}
                        value={parcela.notaFiscal}
                        onChange={(event) => editarPagamento(parcela.id, "notaFiscal", event.target.value)}
                        placeholder="Ex: NF-0000"
                      />
                    </label>
                  )}

                  <StatusBadge status={parcela.status} />
                </div>
              ))}
            </div>
          </section>
      )}
    />
  );
}

export default function ComissoesPage() {
  const { darkMode: modoEscuro } = useDarkMode();
  const [dadosComissoes, setDadosComissoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  const [busca, setBusca] = useState("");
  const [selecao, setSelecao] = useState(() => ({ type: "month", y: hoje.getFullYear(), m: hoje.getMonth() }));
  const [emitindoRelatorio, setEmitindoRelatorio] = useState(false);
  const [atualizacaoComissoes, setAtualizacaoComissoes] = useState(0);
  const [comissoesSalvando, setComissoesSalvando] = useState({});
  const [comissaoSelecionada, setComissaoSelecionada] = useState(null);
  const relatorioEmAndamento = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCarregando(true);
      setErroCarregamento("");
      try {
        const resposta = await buscarComissoesFinanceiro({
          ano: selecao?.y ?? hoje.getFullYear(),
          mes: (selecao?.m ?? hoje.getMonth()) + 1,
          busca: busca.trim() || undefined,
          status: filtroAtivo ? filtroAtivo.toUpperCase() : undefined,
          pagina,
          tamanho: 10,
          signal: controller.signal,
        });
        setDadosComissoes(resposta);
      } catch (erro) {
        if (!controller.signal.aborted) {
          setErroCarregamento(erro.message || "Não foi possível carregar as comissões.");
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }, busca.trim() ? 250 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [atualizacaoComissoes, busca, filtroAtivo, pagina, selecao]);

  const statusParaTela = (status) => ({
    PAGA: STATUS.paga,
    LIBERADA: STATUS.liberada,
    PENDENTE: STATUS.pendente,
    CANCELADA: STATUS.cancelada,
  }[String(status || "").toUpperCase()] || status);
  const converterParcela = (parcela) => ({
    id: `${parcela.idPedido}-${parcela.numeroParcela}`,
    idComissao: parcela.idComissao,
    numero: `${parcela.numeroParcela}/${parcela.totalParcelas}`,
    valor: parcela.valorComissao,
    previsao: parcela.dataVencimento,
    statusCodigo: String(parcela.status || "").toUpperCase(),
    status: statusParaTela(parcela.status),
    venda: {
      id: parcela.codigoPedido || parcela.idPedido,
      venda: parcela.produto,
      cliente: parcela.cliente,
      vendedor: parcela.vendedor,
      detalhesPedido: { numeroPedido: parcela.codigoPedido || parcela.idPedido },
    },
  });
  const parcelasFiltradas = (dadosComissoes?.pagamentosPeriodo || []).map(converterParcela);
  const proximasLiberacoes = (dadosComissoes?.proximasLiberacoes || []).map(converterParcela);
  const contadores = {
    [STATUS.paga]: dadosComissoes?.parcelasPagas ?? 0,
    [STATUS.liberada]: dadosComissoes?.parcelasLiberadas ?? 0,
    [STATUS.pendente]: dadosComissoes?.parcelasPendentes ?? 0,
  };
  const totalPaginas = dadosComissoes?.totalPaginas ?? 0;
  const tituloTabela = filtrosKpi.find((filtro) => filtro.chave === filtroAtivo)?.rotulo || "Pagamentos do período";

  async function salvarStatusComissao(idComissao, status) {
    if (idComissao == null) {
      toast.error("A API não retornou o identificador da comissão.");
      return;
    }

    const chave = String(idComissao);
    setComissoesSalvando((atuais) => ({ ...atuais, [chave]: true }));
    try {
      await atualizarStatusComissao(idComissao, status);
      toast.success("Status da comissão atualizado.");
      setAtualizacaoComissoes((atual) => atual + 1);
      return true;
    } catch (erro) {
      toast.error(erro.message || "Não foi possível atualizar o status da comissão.");
      return false;
    } finally {
      setComissoesSalvando((atuais) => ({ ...atuais, [chave]: false }));
    }
  }

  async function emitirRelatorio() {
    if (relatorioEmAndamento.current) return;
    relatorioEmAndamento.current = true;
    setEmitindoRelatorio(true);
    try {
      const filtro = selecao || { type: "month", y: hoje.getFullYear(), m: hoje.getMonth() };
      const data = new Date(filtro.y, filtro.m, filtro.type === "day" ? filtro.d : 1);
      const periodo = data.toLocaleDateString("pt-BR", { ...(filtro.type === "day" ? { day: "2-digit" } : {}), month: "long", year: "numeric" });
      const { criarRelatorioComissoes } = await import("../services/relatorioComissoes.js");
      const indicadores = filtrosKpi.map(({ chave, rotulo }) => ({ rotulo, valor: contadores[chave] || 0 }));
      const doc = await criarRelatorioComissoes({ parcelas: parcelasFiltradas, proximasLiberacoes, periodo, status: filtroAtivo, busca, indicadores });
      const sufixo = `${filtro.y}-${String(filtro.m + 1).padStart(2, "0")}${filtro.type === "day" ? `-${String(filtro.d).padStart(2, "0")}` : ""}`;
      await doc.save(`relatorio-comissoes-${sufixo}.pdf`, { returnPromise: true });
      toast.success("Relatório PDF gerado com sucesso!");
    } catch {
      toast.error("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      relatorioEmAndamento.current = false;
      setEmitindoRelatorio(false);
    }
  }

  return (
    <div className={`comissoes-page ${modoEscuro ? "comissoes-page-dark" : ""}`}>
      <NavbarFinanceiro />
      {comissaoSelecionada && (
        <ModalStatusComissao
          comissao={comissaoSelecionada}
          dark={modoEscuro}
          salvando={Boolean(comissoesSalvando[String(comissaoSelecionada.idComissao)])}
          onClose={() => setComissaoSelecionada(null)}
          onSave={salvarStatusComissao}
        />
      )}

      <main className="comissoes-content">
        <div className="comissoes-print-brand">
          <img src={logoTnd} alt="TND Brasil" />
        </div>
        <header className="comissoes-header">
          <div>
            <p data-page-eyebrow>Operações Financeiras</p>
            <h1>Gestão de Comissões</h1>
          </div>

          <div className="comissoes-actions">
            <label className="comissoes-search">
              <Icone tipo="busca" />
              <input
                type="text"
                value={busca}
                onChange={(event) => { setBusca(event.target.value); setPagina(0); }}
                placeholder="Vendedor, cliente, produto ou pedido"
                aria-label="Pesquisar vendedor, cliente, produto ou pedido"
              />
            </label>
            <DatePickerCalendar selecao={selecao} aoSelecionar={(valor) => { setSelecao(valor); setPagina(0); }} dark={modoEscuro} />
          </div>
        </header>

        <div className="comissoes-main">
          <div className="comissoes-left">
            <section className="comissoes-kpis" aria-label="Filtros de comissões">
              {filtrosKpi.map((filtro) => (
                <ComissaoKpi
                  key={filtro.chave}
                  filtro={filtro}
                  valor={contadores[filtro.chave] || 0}
                  ativo={filtroAtivo === filtro.chave}
                  onClick={() => {
                    setFiltroAtivo((atual) => (atual === filtro.chave ? null : filtro.chave));
                    setPagina(0);
                  }}
                />
              ))}
            </section>

            <section className="comissoes-table-card">
              <div className="comissoes-table-title">
                <div className="comissoes-card-title">
                  <span />
                  <h2>{tituloTabela}</h2>
                </div>
              </div>

              <div className="comissoes-table-wrap">
                <table className="comissoes-table">
                  <thead>
                    <tr>
                      <th>Pedido de venda</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th>Comissão</th>
                      <th>Parcela / Vencimento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcelasFiltradas.map(({ venda, ...parcela }) => (
                      <tr key={`${venda.id}-${parcela.id}`}>
                        <td>
                          <strong>{venda.id}</strong>
                          <span>{venda.venda}</span>
                        </td>
                        <td>{venda.cliente}</td>
                        <td>{venda.vendedor}</td>
                        <td>{formatarMoeda(parcela.valor)}</td>
                        <td>
                          <div className="comissoes-parcela-vencimento">
                            <strong>{parcela.numero}</strong>
                            <span>{formatarData(parcela.previsao)}</span>
                          </div>
                        </td>
                        <td>
                          <StatusComissaoCell
                            status={parcela.status}
                            identificador={parcela.idComissao ?? parcela.id}
                            disabled={parcela.idComissao == null || Boolean(comissoesSalvando[String(parcela.idComissao)])}
                            onEdit={() => setComissaoSelecionada({
                              idComissao: parcela.idComissao,
                              statusCodigo: parcela.statusCodigo,
                              status: parcela.status,
                              pedido: venda.id,
                              numero: parcela.numero,
                            })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                    {parcelasFiltradas.length === 0 && !carregando && !erroCarregamento && (
                      <p className="comissoes-empty">Nenhuma parcela encontrada para os filtros selecionados.</p>
                    )}
                    {carregando && <p className="comissoes-empty">Carregando comissões...</p>}
                    {erroCarregamento && <p className="comissoes-empty" role="alert">{erroCarregamento}</p>}
              </div>
              <Pagination currentPage={pagina + 1} totalPages={totalPaginas} onPageChange={(paginaVisual) => setPagina(paginaVisual - 1)} />
            </section>
          </div>

          <aside className="comissoes-side">
            <section className="comissoes-liberacoes">
              <div className="comissoes-card-title">
                <span />
                <h2>Próximas liberações</h2>
              </div>
              <div className="comissoes-liberacoes-list">
                {proximasLiberacoes.map((parcela) => (
                  <article className="comissoes-liberacao-item" key={`${parcela.venda.id}-${parcela.id}`}>
                    <div>
                      <strong>{parcela.venda.vendedor}</strong>
                      <span>{parcela.venda.cliente}</span>
                    </div>
                    <div>
                      <span>Pedido</span>
                      <strong>{parcela.venda.detalhesPedido?.numeroPedido || parcela.venda.id}</strong>
                    </div>
                    <div>
                      <span>Parcela {parcela.numero}</span>
                      <strong>{formatarMoeda(parcela.valor)}</strong>
                    </div>
                    <time dateTime={parcela.previsao}>{formatarData(parcela.previsao)}</time>
                  </article>
                ))}
                {proximasLiberacoes.length === 0 && (
                  <p className="comissoes-empty">Nenhuma próxima liberação encontrada.</p>
                )}
              </div>
            </section>

            <button data-ui-action className="comissoes-report-button" type="button" onClick={emitirRelatorio} disabled={emitindoRelatorio} aria-busy={emitindoRelatorio}>
              {emitindoRelatorio ? "Gerando PDF..." : "Emitir relatório"}
            </button>
          </aside>
        </div>
      </main>

    </div>
  );
}
