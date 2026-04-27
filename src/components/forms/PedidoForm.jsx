import { useState } from "react";
import "./PedidoForm.css";
import distribuidorIcon from "../../assets/distribuidor.png";
import perfilCliente from "../../assets/perfil_cliente.png";
import carrinho from "../../assets/produto_carrinho.png";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function ClienteSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    razaoSocial: "", cnpj: "", inscEst: "", fone: "", cep: "",
    endereco: "", cidade: "", uf: "", contato: "", email: "",
  });
  const [search, setSearch] = useState("");
  const clientesMock = [
    {
      id: 1,
      razaoSocial: "Tech Solutions Ltda",
      cnpj: "00.000.000/0000-00",
      cidade: "São Paulo",
      uf: "SP",
      email: "contato@tech.com",
      fone: "(11) 99999-9999",
      endereco: "Rua das Inovações, 123",
      contato: "Maria Silva",
    }
  ];

  const clientesFiltrados = clientesMock.filter((c) =>
    c.razaoSocial.toLowerCase().includes(search.toLowerCase())
  );

  const handle = (e) => {
    const updated = { ...data, [e.target.name]: e.target.value };
    setData(updated);
    onChange?.(updated);
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={perfilCliente} alt="Perfil do Cliente" /></span>
          Dados do Cliente
        </div>
        <div className="section-header-right">
          <button
            className="btn-link"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            + Adicionar Cliente Cadastrado
          </button>
          <span className={`chevron ${open ? "open" : ""}`}>▾</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>RAZÃO SOCIAL</label>
              <input name="razaoSocial" value={data.razaoSocial} onChange={handle} placeholder="Ex: Tech Solutions Ltda" />
            </div>
            <div className="form-group grow-1">
              <label>CNPJ</label>
              <input name="cnpj" value={data.cnpj} onChange={handle} placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-160">
              <label>INSC. EST.</label>
              <input name="inscEst" value={data.inscEst} onChange={handle} placeholder="Isento" />
            </div>
            <div className="form-group grow-1">
              <label>FONE</label>
              <input name="fone" value={data.fone} onChange={handle} placeholder="(00) 0000-0000" />
            </div>
            <div className="form-group w-140">
              <label>CEP</label>
              <input name="cep" value={data.cep} onChange={handle} placeholder="00000-000" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDEREÇO</label>
              <input name="endereco" value={data.endereco} onChange={handle} placeholder="Rua das Inovações, 123" />
            </div>
            <div className="form-group grow-1">
              <label>CIDADE</label>
              <input name="cidade" value={data.cidade} onChange={handle} placeholder="Centro" />
            </div>
            <div className="form-group w-70">
              <label>UF</label>
              <select name="uf" value={data.uf} onChange={handle}>
                <option value="">--</option>
                {UF_LIST.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO</label>
              <input name="contato" value={data.contato} onChange={handle} placeholder="Nome do Responsável" />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL</label>
              <input name="email" type="email" value={data.email} onChange={handle} placeholder="contato@empresa.com" />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Buscar Cliente</h3>

            {/*  INPUT DE BUSCA */}
            <input
              type="text"
              placeholder="Digite o nome do cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-busca"
            />

            {/*  LISTA */}
            <div className="lista-clientes">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((c) => (
                  <div
                    key={c.id}
                    className="cliente-item"
                    onClick={() => {
                      setData(c);
                      onChange?.(c);
                      setShowModal(false);
                      setSearch("");
                    }}
                  >
                    <strong>{c.razaoSocial}</strong>
                    <span>{c.cnpj}</span>
                  </div>
                ))
              ) : (
                <p>Nenhum cliente encontrado</p>
              )}
            </div>

            <button onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DistribuidorSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    razaoSocial: "", cnpj: "", inscEst: "", fone: "", cep: "",
    endereco: "", cidade: "", uf: "", contato: "", email: "",
  });

  const handle = (e) => {
    const updated = { ...data, [e.target.name]: e.target.value };
    setData(updated);
    onChange?.(updated);
  };
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const distribuidoresMock = [
    {
      id: 1,
      razaoSocial: "Distribuidora XYZ",
      cnpj: "22.222.222/0001-22",
      cidade: "São Paulo",
      uf: "SP",
      email: "contato@distribuidora.com",
      fone: "(11) 88888-8888",
      endereco: "Avenida Paulista, 456",
      contato: "João Oliveira",
    }
  ];

  const distribuidoresFiltrados = distribuidoresMock.filter((d) =>
    d.razaoSocial.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={distribuidorIcon} alt="Distribuidor" /></span>
          Dados do Distribuidor
        </div>
        <div className="section-header-right">
          <button
            className="btn-link"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            + Adicionar Distribuidor Cadastrado
          </button>
          <span className={`chevron ${open ? "open" : ""}`}>▾</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>RAZÃO SOCIAL</label>
              <input name="razaoSocial" value={data.razaoSocial} onChange={handle} placeholder="Ex: Tech Solutions Ltda" />
            </div>
            <div className="form-group grow-1">
              <label>CNPJ</label>
              <input name="cnpj" value={data.cnpj} onChange={handle} placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-160">
              <label>INSC. EST.</label>
              <input name="inscEst" value={data.inscEst} onChange={handle} placeholder="Isento" />
            </div>
            <div className="form-group grow-1">
              <label>FONE</label>
              <input name="fone" value={data.fone} onChange={handle} placeholder="(00) 0000-0000" />
            </div>
            <div className="form-group w-140">
              <label>CEP</label>
              <input name="cep" value={data.cep} onChange={handle} placeholder="00000-000" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDEREÇO</label>
              <input name="endereco" value={data.endereco} onChange={handle} placeholder="Rua das Inovações, 123" />
            </div>
            <div className="form-group grow-1">
              <label>CIDADE</label>
              <input name="cidade" value={data.cidade} onChange={handle} placeholder="Centro" />
            </div>
            <div className="form-group w-70">
              <label>UF</label>
              <select name="uf" value={data.uf} onChange={handle}>
                <option value="">--</option>
                {UF_LIST.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO</label>
              <input name="contato" value={data.contato} onChange={handle} placeholder="Nome do Responsável" />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL</label>
              <input name="email" type="email" value={data.email} onChange={handle} placeholder="contato@empresa.com" />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Buscar Distribuidor</h3>

            <input
              type="text"
              placeholder="Digite o nome do distribuidor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-busca"
            />

            <div className="lista-clientes">
              {distribuidoresFiltrados.map((d) => (
                <div
                  key={d.id}
                  className="cliente-item"
                  onClick={() => {
                    setData(d);
                    onChange?.(d);
                    setShowModal(false);
                    setSearch("");
                  }}
                >
                  <strong>{d.razaoSocial}</strong>
                  <span>{d.cnpj}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}

    </div>
  );
}

function ProdutoSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    descricao: "", pn: "", entrega: "", quantidade: "",
    valorUnitario: "", valorTotal: "", unitFaturado: "", totalFaturado: "",
  });

  const handle = (e) => {
    const field = e.target.name;
    let updated = { ...data, [field]: e.target.value };

    const qty = parseFloat(updated.quantidade) || 0;
    const unit = parseFloat(updated.valorUnitario) || 0;
    const unitFat = parseFloat(updated.unitFaturado) || 0;

    if (field === "quantidade" || field === "valorUnitario") {
      updated.valorTotal = qty && unit ? (qty * unit).toFixed(2) : "";
    }
    if (field === "quantidade" || field === "unitFaturado") {
      updated.totalFaturado = qty && unitFat ? (qty * unitFat).toFixed(2) : "";
    }

    setData(updated);
    onChange?.(updated);
  };

  const fmt = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? "R$ 0,00" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const produtosMock = [
    {
      id: 1,
      descricao: "Produto A",
      pn: "00.000.000",
      valorUnitario: 100.00,
    }
  ];

  const produtosFiltrados = produtosMock.filter((p) =>
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    p.pn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={carrinho} alt="Carrinho" /></span>
          Dados do Produto
        </div>
        <div className="section-header-right">
          <button
            className="btn-link"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            + Adicionar Produto Cadastrado
          </button>
          <span className={`chevron ${open ? "open" : ""}`}>▾</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          {/* Linha 1: Descrição + P/N + Entrega + Quantidade */}
          <div className="form-row">
            <div className="form-group grow-2">
              <label>DESCRIÇÃO DO PRODUTO</label>
              <input name="descricao" value={data.descricao} onChange={handle} placeholder="Ex: Pacote Office 365" />
            </div>
            <div className="form-group grow-1">
              <label>P/N</label>
              <input name="pn" value={data.pn} onChange={handle} placeholder="00.000.000" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>ENTREGA</label>
              <input name="entrega" value={data.entrega} onChange={handle} placeholder="Ex: IMEDIATA" />
            </div>
            <div className="form-group grow-1">
              <label>QUANTIDADE</label>
              <input name="quantidade" type="number" value={data.quantidade} onChange={handle} placeholder="0000" />
            </div>
            <div className="form-group grow-1">
              <label>VALOR UNITÁRIO</label>
              <input name="valorUnitario" type="number" step="0.01" value={data.valorUnitario} onChange={handle} placeholder="R$ 0,00" />
            </div>
            <div className="form-group grow-1">
              <label>VALOR TOTAL</label>
              <input value={fmt(data.valorTotal)} readOnly className="readonly" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>UNIT. FATURADO</label>
              <input name="unitFaturado" type="number" step="0.01" value={data.unitFaturado} onChange={handle} placeholder="R$ 0,00" />
            </div>
            <div className="form-group grow-1">
              <label>TOTAL FATURADO</label>
              <input value={fmt(data.totalFaturado)} readOnly className="readonly" />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Buscar Produto</h3>

            <input
              type="text"
              placeholder="Digite o nome ou P/N..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-busca"
            />

            <div className="lista-clientes">
              {produtosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="cliente-item"
                  onClick={() => {
                    const novo = {
                      ...data,
                      descricao: p.descricao,
                      pn: p.pn,
                      valorUnitario: p.valorUnitario,
                    };

                    setData(novo);
                    onChange?.(novo);

                    setShowModal(false);
                    setSearch("");
                  }}
                >
                  <strong>{p.descricao}</strong>
                  <span>{p.pn}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PedidoForm({ onFormChange }) {
  const [cliente, setCliente] = useState({});
  const [distribuidor, setDistribuidor] = useState({});
  const [produtos, setProdutos] = useState([{}]);

  const notify = (patch) => {
    onFormChange?.({ ...{ cliente, distribuidor, produto }, ...patch });
  };

  const updateProduto = (index, data) => {
    const novos = [...produtos];
    novos[index] = data;
    setProdutos(novos);
    notify({ produtos: novos });
  };

  const addProduto = () => {
    setProdutos([...produtos, {}]);
  };

  const removeProduto = (index) => {
    const novos = produtos.filter((_, i) => i !== index);
    setProdutos(novos);
    notify({ produtos: novos });
  };

  return (
    <div className="pedido-form">
      <ClienteSection onChange={(d) => { setCliente(d); notify({ cliente: d }); }} />
      <DistribuidorSection onChange={(d) => { setDistribuidor(d); notify({ distribuidor: d }); }} />
      {produtos.map((prod, index) => (
        <div key={index}>

          <ProdutoSection
            onChange={(d) => updateProduto(index, d)}
          />

          {index > 0 && (
            <button
              className="btn-remover-produto"
              onClick={() => removeProduto(index)}
            >
              Remover produto
            </button>
          )}

        </div>
      ))}

      <button className="btn-add-produto" onClick={addProduto}>
        + Adicionar outro produto
      </button>

    </div>
  );
}