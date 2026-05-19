import { useState } from "react";
import "./PedidoForm.css";
import distribuidorIcon from "../../assets/distribuidor.png";
import perfilCliente from "../../assets/perfil_cliente.png";
import carrinho from "../../assets/produto_carrinho.png";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const onlyDigits = (value) => value.replace(/\D/g, "");

const formatCnpj = (value) => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const isValidCnpj = (value) => {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const calculateDigit = (base) => {
    const weights = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? "0" : String(11 - remainder);
  };

  const digit1 = calculateDigit(cnpj.slice(0, 12));
  const digit2 = calculateDigit(`${cnpj.slice(0, 12)}${digit1}`);

  return cnpj.endsWith(`${digit1}${digit2}`);
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.15 7.25 4.18 4.18-1.27 1.27-4.18-4.18 1.27-1.27Z" />
    </svg>
  );
}

function CnpjSearchButton({ children, onClick }) {
  return (
    <button type="button" className="cnpj-search-trigger" onClick={onClick}>
      <SearchIcon />
      <span>{children}</span>
    </button>
  );
}

function ClienteSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    razaoSocial: "", cnpj: "", inscEst: "", fone: "", cep: "",
    endereco: "", cidade: "", uf: "", contato: "", email: "",
  });
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const clientesMock = [
    {
      id: 1,
      razaoSocial: "Tech Solutions Ltda",
      cnpj: "11.222.333/0001-81",
      cidade: "Sao Paulo",
      uf: "SP",
      cep: "01000-000",
      email: "contato@tech.com",
      fone: "(11) 99999-9999",
      endereco: "Rua das Inovacoes, 123",
      contato: "Maria Silva",
    },
  ];

  const clientesEncontrados = searched && !searchError
    ? clientesMock.filter((cliente) => onlyDigits(cliente.cnpj) === onlyDigits(search))
    : [];

  const handle = (e) => {
    const value = e.target.name === "cnpj" ? formatCnpj(e.target.value) : e.target.value;
    const updated = { ...data, [e.target.name]: value };
    setData(updated);
    onChange?.(updated);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
  };

  const handleSearch = () => {
    if (!isValidCnpj(search)) {
      setSearchError("Informe um CNPJ valido para pesquisar clientes.");
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const startNewCliente = () => {
    const updated = { ...data, cnpj: formatCnpj(search) };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    closeModal();
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={perfilCliente} alt="Perfil do Cliente" /></span>
          Dados do Cliente
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Pesquisar cliente por CNPJ
          </CnpjSearchButton>
          <span className={`chevron ${open ? "open" : ""}`}>v</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>RAZAO SOCIAL</label>
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
              <label>ENDERECO</label>
              <input name="endereco" value={data.endereco} onChange={handle} placeholder="Rua das Inovacoes, 123" />
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
              <input name="contato" value={data.contato} onChange={handle} placeholder="Nome do Responsavel" />
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
            <p className="modal-hint">A pesquisa deve ser feita pelo CNPJ.</p>

            <div className="modal-search-row">
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={search}
                onChange={(e) => {
                  setSearch(formatCnpj(e.target.value));
                  setSearchError("");
                  setSearched(false);
                }}
                className="input-busca"
              />
              <button type="button" className="btn-modal-search" onClick={handleSearch}>
                <SearchIcon />
              </button>
            </div>

            {searchError && <p className="modal-message is-error">{searchError}</p>}

            <div className="lista-clientes">
              {clientesEncontrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="cliente-item"
                  onClick={() => {
                    setData(cliente);
                    onChange?.(cliente);
                    closeModal();
                  }}
                >
                  <strong>{cliente.razaoSocial}</strong>
                  <span>{cliente.cnpj}</span>
                </div>
              ))}

              {searched && !searchError && clientesEncontrados.length === 0 && (
                <div className="modal-empty">
                  <p>O CNPJ nao esta cadastrado no sistema.</p>
                  <button type="button" className="btn-cadastrar-novo" onClick={startNewCliente}>
                    Cadastrar novo cliente
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="btn-modal-close" onClick={closeModal}>Fechar</button>
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
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const distribuidoresMock = [
    {
      id: 1,
      razaoSocial: "Distribuidora XYZ",
      cnpj: "22.222.222/0001-91",
      cidade: "Sao Paulo",
      uf: "SP",
      email: "contato@distribuidora.com",
      fone: "(11) 88888-8888",
      endereco: "Avenida Paulista, 456",
      contato: "Joao Oliveira",
    },
  ];

  const distribuidoresEncontrados = searched && !searchError
    ? distribuidoresMock.filter((distribuidor) => onlyDigits(distribuidor.cnpj) === onlyDigits(search))
    : [];

  const handle = (e) => {
    const value = e.target.name === "cnpj" ? formatCnpj(e.target.value) : e.target.value;
    const updated = { ...data, [e.target.name]: value };
    setData(updated);
    onChange?.(updated);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
  };

  const handleSearch = () => {
    if (!isValidCnpj(search)) {
      setSearchError("Informe um CNPJ valido para pesquisar distribuidores.");
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const startNewDistribuidor = () => {
    const updated = { ...data, cnpj: formatCnpj(search) };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    closeModal();
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={distribuidorIcon} alt="Distribuidor" /></span>
          Dados do Distribuidor
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Pesquisar distribuidor por CNPJ
          </CnpjSearchButton>
          <span className={`chevron ${open ? "open" : ""}`}>v</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>RAZAO SOCIAL</label>
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
              <label>ENDERECO</label>
              <input name="endereco" value={data.endereco} onChange={handle} placeholder="Rua das Inovacoes, 123" />
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
              <input name="contato" value={data.contato} onChange={handle} placeholder="Nome do Responsavel" />
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
            <p className="modal-hint">A pesquisa deve ser feita pelo CNPJ.</p>

            <div className="modal-search-row">
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={search}
                onChange={(e) => {
                  setSearch(formatCnpj(e.target.value));
                  setSearchError("");
                  setSearched(false);
                }}
                className="input-busca"
              />
              <button type="button" className="btn-modal-search" onClick={handleSearch}>
                <SearchIcon />
              </button>
            </div>

            {searchError && <p className="modal-message is-error">{searchError}</p>}

            <div className="lista-clientes">
              {distribuidoresEncontrados.map((distribuidor) => (
                <div
                  key={distribuidor.id}
                  className="cliente-item"
                  onClick={() => {
                    setData(distribuidor);
                    onChange?.(distribuidor);
                    closeModal();
                  }}
                >
                  <strong>{distribuidor.razaoSocial}</strong>
                  <span>{distribuidor.cnpj}</span>
                </div>
              ))}

              {searched && !searchError && distribuidoresEncontrados.length === 0 && (
                <div className="modal-empty">
                  <p>O CNPJ nao esta cadastrado no sistema.</p>
                  <button type="button" className="btn-cadastrar-novo" onClick={startNewDistribuidor}>
                    Cadastrar novo distribuidor
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="btn-modal-close" onClick={closeModal}>Fechar</button>
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
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const produtosMock = [
    {
      id: 1,
      cnpj: "12.345.678/0001-95",
      descricao: "Pacote Office 365 - 1 ano",
      pn: "00.000.000",
      valorUnitario: 100.00,
    },
  ];

  const produtosEncontrados = searched && !searchError
    ? produtosMock.filter((produto) => onlyDigits(produto.cnpj) === onlyDigits(search))
    : [];

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

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
  };

  const handleSearch = () => {
    if (!isValidCnpj(search)) {
      setSearchError("Informe um CNPJ valido para pesquisar produtos.");
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const startNewProduto = () => {
    setOpen(true);
    closeModal();
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon"><img src={carrinho} alt="Carrinho" /></span>
          Dados do Produto
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Pesquisar produto por CNPJ
          </CnpjSearchButton>
          <span className={`chevron ${open ? "open" : ""}`}>v</span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>DESCRICAO DO PRODUTO</label>
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
              <label>VALOR UNITARIO</label>
              <input name="valorUnitario" type="number" step="0.01" value={data.valorUnitario} onChange={handle} placeholder="R$ 0,00" />
            </div>
            <div className="form-group grow-1">
              <label>VALOR TOTAL</label>
              <input value={fmt(data.valorTotal)} readOnly className="readonly" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>VALOR UNIT. FATURADO</label>
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
            <p className="modal-hint">A pesquisa deve ser feita pelo CNPJ.</p>

            <div className="modal-search-row">
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={search}
                onChange={(e) => {
                  setSearch(formatCnpj(e.target.value));
                  setSearchError("");
                  setSearched(false);
                }}
                className="input-busca"
              />
              <button type="button" className="btn-modal-search" onClick={handleSearch}>
                <SearchIcon />
              </button>
            </div>

            {searchError && <p className="modal-message is-error">{searchError}</p>}

            <div className="lista-clientes">
              {produtosEncontrados.map((produto) => (
                <div
                  key={produto.id}
                  className="cliente-item"
                  onClick={() => {
                    const updated = {
                      ...data,
                      descricao: produto.descricao,
                      pn: produto.pn,
                      valorUnitario: produto.valorUnitario,
                    };
                    setData(updated);
                    onChange?.(updated);
                    closeModal();
                  }}
                >
                  <strong>{produto.descricao}</strong>
                  <span>{produto.cnpj}</span>
                  <span>{produto.pn}</span>
                </div>
              ))}

              {searched && !searchError && produtosEncontrados.length === 0 && (
                <div className="modal-empty">
                  <p>O CNPJ nao esta cadastrado no sistema.</p>
                  <button type="button" className="btn-cadastrar-novo" onClick={startNewProduto}>
                    Cadastrar novo produto
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="btn-modal-close" onClick={closeModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PedidoForm({ onFormChange }) {
  const [cliente, setCliente] = useState({});
  const [distribuidor, setDistribuidor] = useState({});
  const [produtos, setProdutos] = useState([]);

  const notify = (patch) => {
    onFormChange?.({ ...{ cliente, distribuidor, produtos }, ...patch });
  };

  const updateProduto = (index, data) => {
    const novos = [...produtos];
    novos[index] = data;
    setProdutos(novos);
    notify({ produtos: novos });
  };

  const addProduto = () => {
    setProdutos([...produtos, {
      descricao: "",
      valorTotal: 0,
      totalFaturado: 0,
    }]);
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
          <ProdutoSection onChange={(d) => updateProduto(index, d)} />

          {index > 0 && (
            <button
              type="button"
              className="btn-remover-produto"
              onClick={() => removeProduto(index)}
            >
              Remover produto
            </button>
          )}
        </div>
      ))}

      <button type="button" className="btn-add-produto" onClick={addProduto}>
        + Adicionar produto
      </button>
    </div>
  );
}
