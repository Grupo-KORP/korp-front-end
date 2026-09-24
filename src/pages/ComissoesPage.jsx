import React, { useMemo, useState } from "react";
import ModalDetalheVenda from "../components/modal/Modaldetalhevenda.jsx";
import NavbarFinanceiro from "../layout/NavbarFinanceiro.jsx";
import logoTnd from "../assets/logo-tnd.webp";
import DatePickerCalendar from "../components/ui/DatePickerCalendar.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import "./ComissoesPage.css";
import { parcelasDoPeriodo, filtrarStatusParcelas } from "../services/filtrosComissoes.js";

const STATUS = {
  pendente: "Pendente",
  liberada: "Liberada",
  paga: "Paga",
};

const STATUS_OPTIONS = Object.values(STATUS);

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
      metodoPagamento: "Cartão de Crédito",
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
      metodoPagamento: "PIX",
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
      metodoPagamento: "Cartão de Débito",
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
  return <span className={`comissoes-status status-${normalizar(status)}`}>{children || status}</span>;
}

function VendaModal({ venda, onClose, onStatusChange, onNotaChange, escuro }) {
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
  const produto = pedido.produto || {};
  const status = statusVenda(venda);
  const metodos = { "cartao de credito": "CARTAO_CREDITO", "cartao de debito": "CARTAO_DEBITO", boleto: "BOLETO", pix: "PIX", transferencia: "TRANSFERENCIA", dinheiro: "DINHEIRO" };
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
            <div className="comissoes-home-section-title comissoes-home-section-title-green">
              <span />
              <h3>Pagamentos</h3>
            </div>

            <div className="comissoes-home-parcelas">
              {pagamentos.map((parcela) => (
                <div className="comissoes-home-parcela" key={parcela.id}>
                  <div className="comissoes-home-parcela-info">
                    <strong>{pagamentoAVista ? "Pagamento à vista" : `Pagamento ${parcela.numero}`}</strong>
                    <span>{formatarMoeda(parcela.valor)} - prevista para {formatarData(parcela.previsao)}</span>
                  </div>

                  <label>
                    Status
                    <select value={parcela.status} onChange={(event) => atualizarPagamento(onStatusChange, parcela.id, event.target.value)}>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  {parcela.status === STATUS.paga && (
                    <label>
                      Nota Fiscal do Vendedor
                      <input
                        type="text"
                        value={parcela.notaFiscal}
                        onChange={(event) => atualizarPagamento(onNotaChange, parcela.id, event.target.value)}
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
  const [vendas, setVendas] = useState(vendasMockadas);
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  const [busca, setBusca] = useState("");
  const [selecao, setSelecao] = useState(() => ({ type: "month", y: hoje.getFullYear(), m: hoje.getMonth() }));
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState(null);

  const vendasBuscadas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return vendas.filter((venda) => !termo || [
      venda.vendedor,
      venda.detalhesPedido?.numeroPedido,
      venda.id,
    ].some((valor) => normalizar(String(valor ?? "")).includes(termo)));
  }, [busca, vendas]);

  const parcelasPeriodo = useMemo(() => parcelasDoPeriodo(vendasBuscadas, selecao), [vendasBuscadas, selecao]);
  const contadores = useMemo(() => filtrosKpi.reduce((acc, filtro) => {
    acc[filtro.chave] = filtrarStatusParcelas(parcelasPeriodo, filtro.chave).length;
    return acc;
  }, {}), [parcelasPeriodo]);
  const parcelasFiltradas = useMemo(() => filtrarStatusParcelas(parcelasPeriodo, filtroAtivo), [parcelasPeriodo, filtroAtivo]);

  const proximasLiberacoes = useMemo(() => {
    const datasPermitidas = new Set([toISODate(hoje), toISODate(amanha)]);

    return parcelasFiltradas
      .filter((parcela) => datasPermitidas.has(parcela.previsao))
      .sort((a, b) => a.previsao.localeCompare(b.previsao));
  }, [parcelasFiltradas]);

  const vendaSelecionada = vendas.find((venda) => venda.id === vendaSelecionadaId);
  const tituloTabela = filtrosKpi.find((filtro) => filtro.chave === filtroAtivo)?.rotulo || "Parcelas do período";

  function alterarStatus(vendaId, parcelaId, status) {
    setVendas((atuais) =>
      atuais.map((venda) =>
        venda.id !== vendaId
          ? venda
          : {
            ...venda,
            parcelas: venda.parcelas.map((parcela) =>
              parcela.id !== parcelaId
                ? parcela
                : { ...parcela, status, notaFiscal: status === STATUS.paga ? parcela.notaFiscal : "" }
            ),
          }
      )
    );
  }

  function alterarNotaFiscal(vendaId, parcelaId, notaFiscal) {
    setVendas((atuais) =>
      atuais.map((venda) =>
        venda.id !== vendaId
          ? venda
          : {
            ...venda,
            parcelas: venda.parcelas.map((parcela) =>
              parcela.id === parcelaId ? { ...parcela, notaFiscal } : parcela
            ),
          }
      )
    );
  }

  function emitirRelatorio() {
    window.print();
  }

  return (
    <div className={`comissoes-page ${modoEscuro ? "comissoes-page-dark" : ""}`}>
      <NavbarFinanceiro />

      <main className="comissoes-content">
        <div className="comissoes-print-brand">
          <img src={logoTnd} alt="TND Brasil" />
        </div>
        <header className="comissoes-header">
          <div>
            <p>Operações Financeiras</p>
            <h1>Gestão de Comissões</h1>
          </div>

          <div className="comissoes-actions">
            <label className="comissoes-search">
              <Icone tipo="busca" />
              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="VENDEDOR OU CÓDIGO DO PEDIDO"
                aria-label="Pesquisar vendedor ou código do pedido"
              />
            </label>
            <DatePickerCalendar selecao={selecao} aoSelecionar={setSelecao} dark={modoEscuro} />
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
                  onClick={() => setFiltroAtivo((atual) => (atual === filtro.chave ? null : filtro.chave))}
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
                      <th>Venda</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th>Comissão</th>
                      <th>Parcela / Vencimento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcelasFiltradas.map(({ venda, ...parcela }) => (
                      <tr key={`${venda.id}-${parcela.id}`} onClick={() => setVendaSelecionadaId(venda.id)}>
                        <td>
                          <strong>{venda.id}</strong>
                          <span>{venda.venda}</span>
                        </td>
                        <td>{venda.cliente}</td>
                        <td>{venda.vendedor}</td>
                        <td>{formatarMoeda(parcela.valor)}</td>
                        <td><strong>{parcela.numero}</strong><span>{formatarData(parcela.previsao)}</span></td>
                        <td>
                          <StatusBadge status={parcela.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {parcelasFiltradas.length === 0 && (
                  <p className="comissoes-empty">Nenhuma parcela encontrada para os filtros selecionados.</p>
                )}
              </div>
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

            <button className="comissoes-report-button" type="button" onClick={emitirRelatorio}>
              Emitir relatório
            </button>
          </aside>
        </div>
      </main>

      <VendaModal
        escuro={modoEscuro}
        venda={vendaSelecionada}
        onClose={() => setVendaSelecionadaId(null)}
        onStatusChange={alterarStatus}
        onNotaChange={alterarNotaFiscal}
      />
    </div>
  );
}
