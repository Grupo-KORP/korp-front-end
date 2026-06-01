import { useState, useEffect } from "react";
import "./PedidoForm.css";
import distribuidorIcon from "../../assets/distribuidor.png";
import perfilCliente from "../../assets/perfil_cliente.png";
import carrinho from "../../assets/produto_carrinho.png";
import {
  fetchClientesPedido,
  fetchDistribuidoresPedido,
} from "../../services/api";

const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const onlyDigits = (value) => value.replace(/\D/g, "");

const removeFormatting = (value) =>
  String(value || "")
    .replace(/[.\-\/]/g, "")
    .toUpperCase();

const sanitizeCnpj = (value) => onlyDigits(String(value || ""));

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const getEntityContacts = (entity) => {
  const contactsList = entity?.contatos;

  if (contactsList && contactsList.length > 0) {
    return contactsList;
  }
  return [];
};

const cnpjExists = (value, list) => {
  const digits = sanitizeCnpj(value);
  const cleanedValue = removeFormatting(value);
  return (
    (digits.length === 14 || cleanedValue.length === 14) &&
    list.some((item) => {
      const itemDigits = onlyDigits(item.cnpj);
      const itemCleaned = removeFormatting(item.cnpj);
      return itemDigits === digits || itemCleaned === cleanedValue;
    })
  );
};

const formatCnpj = (value) => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const isValidCnpj = (value) => {
  const cleanedValue = removeFormatting(value);
  const digitsOnly = sanitizeCnpj(value);

  // Validar CNPJ alfanumérico: exatamente 14 caracteres alfanuméricos
  if (cleanedValue.length === 14 && /^[A-Z0-9]{14}$/.test(cleanedValue)) {
    // Se for puro numérico, validar checksum; senão, apenas aceitar
    if (/^\d{14}$/.test(cleanedValue)) {
      // É numérico, aplicar validação de checksum
      if (/^(\d)\1+$/.test(cleanedValue)) {
        return false;
      }

      const calculateDigit = (base) => {
        const weights =
          base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const sum = base
          .split("")
          .reduce(
            (total, digit, index) => total + Number(digit) * weights[index],
            0,
          );
        const remainder = sum % 11;
        return remainder < 2 ? "0" : String(11 - remainder);
      };

      const digit1 = calculateDigit(cleanedValue.slice(0, 12));
      const digit2 = calculateDigit(`${cleanedValue.slice(0, 12)}${digit1}`);

      return cleanedValue.endsWith(`${digit1}${digit2}`);
    }

    // É alfanumérico (contém letras), aceitar sem checksum
    return true;
  }

  // Validação legada: apenas dígitos
  const cnpj = digitsOnly;
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const calculateDigit = (base) => {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base
      .split("")
      .reduce(
        (total, digit, index) => total + Number(digit) * weights[index],
        0,
      );
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

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function CnpjSearchButton({ children, onClick }) {
  return (
    <button type="button" className="cnpj-search-trigger" onClick={onClick}>
      <AddIcon />
      <span>{children}</span>
    </button>
  );
}

const readonlyInputProps = {
  readOnly: true,
  className: "readonly",
};

function ClienteSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    inscricaoEstadual: "",
    fone: "",
    cep: "",
    endereco: "",
    cidade: "",
    uf: "",
    contato: "",
    email: "",
  });
  const [search, setSearch] = useState("");
  const [newCadastroCnpj, setNewCadastroCnpj] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [contactSearch, setContactSearch] = useState("");
  const [newContact, setNewContact] = useState({ nome: "", email: "" });

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const dados = await fetchClientesPedido();
        setClientes(dados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setClientes([]);
      }
    };
    carregarClientes();
  }, []);

  const newCadastroCnpjDigits = sanitizeCnpj(newCadastroCnpj);
  const newCadastroCnpjCleaned = removeFormatting(newCadastroCnpj);
  const canRegisterNewCliente =
    (newCadastroCnpjDigits.length === 14 ||
      newCadastroCnpjCleaned.length === 14) &&
    isValidCnpj(newCadastroCnpj) &&
    !cnpjExists(newCadastroCnpj, clientes);
  const canSaveClienteCadastro =
    Boolean(data.nomeFantasia.trim()) &&
    Boolean(data.contato.trim()) &&
    isValidEmail(data.email);
  const clienteContacts = getEntityContacts(selectedCliente);
  const filteredClienteContacts = clienteContacts.filter((contact) => {
    const normalizedSearch = contactSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    return (
      String(contact.nome || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(contact.email || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });
  const showClienteContactEmpty =
    selectedCliente &&
    contactSearch.trim() &&
    filteredClienteContacts.length === 0;
  const canRegisterClienteContact =
    Boolean(newContact.nome.trim()) && isValidEmail(newContact.email);

  const clientesEncontrados =
    searched && !searchError
      ? clientes.filter((cliente) => {
          const normalizedSearch = String(search || "")
            .trim()
            .toLowerCase();
          const digits = onlyDigits(String(search || ""));

          if (digits.length === 14 && isValidCnpj(search)) {
            return onlyDigits(String(cliente.cnpj || "")) === digits;
          }

          return (
            String(cliente.nomeFantasia || "")
              .toLowerCase()
              .includes(normalizedSearch) ||
            String(cliente.razaoSocial || "")
              .toLowerCase()
              .includes(normalizedSearch)
          );
        })
      : [];

  const handle = (e) => {
    const value =
      e.target.name === "cnpj" ? formatCnpj(e.target.value) : e.target.value;
    const updated = { ...data, [e.target.name]: value };
    setData(updated);
    onChange?.(updated);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
    setModalStep(1);
    setSelectedCliente(null);
    setContactSearch("");
    setNewContact({ nome: "", email: "" });
  };

  const handleSearch = () => {
    const digits = onlyDigits(search);

    if (digits.length === 14) {
      if (!isValidCnpj(search)) {
        setSearchError("Informe um CNPJ valido para pesquisar clientes.");
        setSearched(false);
        return;
      }

      setSearchError("");
      setSearched(true);
      return;
    }

    if (!search.trim()) {
      setSearchError(
        "Informe um nome fantasia ou CNPJ para pesquisar clientes.",
      );
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearched(false);
    setSearchError("");
  };

  const startNewCliente = () => {
    const chosenCnpj =
      newCadastroCnpj && isValidCnpj(newCadastroCnpj)
        ? sanitizeCnpj(newCadastroCnpj)
        : sanitizeCnpj(search);

    const updated = { ...data, cnpj: formatCnpj(chosenCnpj) };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    setShowSaveButton(true);
    setNewCadastroCnpj("");
    closeModal();
  };

  const selectClienteForContact = (cliente) => {
    setSelectedCliente(cliente);
    setContactSearch("");
    setNewContact({ nome: "", email: "" });
    setModalStep(2);
  };

  const selectClienteContact = (contact) => {
    const updated = {
      ...selectedCliente,
      contato: contact.nome || "",
      email: contact.email || "",
    };

    setData(updated);
    onChange?.(updated);
    setShowSaveButton(false);
    setOpen(true);
    closeModal();
  };

  const registerClienteContact = () => {
    if (!canRegisterClienteContact) return;

    selectClienteContact({
      id: `novo-${Date.now()}`,
      nome: newContact.nome.trim(),
      email: newContact.email.trim(),
    });
  };

  const saveCliente = () => {
    if (!canSaveClienteCadastro) return;
    setShowSaveButton(false);
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon">
            <img src={perfilCliente} alt="Perfil do Cliente" />
          </span>
          Dados do Cliente
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Adicionar cliente
          </CnpjSearchButton>
          <span className="chevron">
            <ChevronIcon open={open} />
          </span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-1">
              <label>NOME FANTASIA</label>
              <input
                name="nomeFantasia"
                value={data.nomeFantasia}
                onChange={handle}
                placeholder="Ex: Tech Solutions"
              />
            </div>
            <div className="form-group grow-1">
              <label>RAZAO SOCIAL</label>
              <input
                name="razaoSocial"
                value={data.razaoSocial}
                onChange={handle}
                placeholder="Ex: Tech Solutions Ltda"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-160">
              <label>INSC. EST.</label>
              <input
                name="inscricaoEstadual"
                value={data.inscricaoEstadual}
                onChange={handle}
                placeholder="Isento"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-120">
              <label>FONE</label>
              <input
                name="fone"
                value={data.fone}
                onChange={handle}
                placeholder="(00) 0000-0000"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-140">
              <label>CEP</label>
              <input
                name="cep"
                value={data.cep}
                onChange={handle}
                placeholder="00000-000"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-180">
              <label>CNPJ</label>
              <input
                name="cnpj"
                value={data.cnpj}
                onChange={handle}
                placeholder="00.000.000/0000-00"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDERECO</label>
              <input
                name="endereco"
                value={data.endereco}
                onChange={handle}
                placeholder="Rua das Inovacoes, 123"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group grow-1">
              <label>CIDADE</label>
              <input
                name="cidade"
                value={data.cidade}
                onChange={handle}
                placeholder="Centro"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-70">
              <label>UF</label>
              <select
                name="uf"
                value={data.uf}
                onChange={handle}
                disabled
                className="readonly"
              >
                <option value="">--</option>
                {UF_LIST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO</label>
              <input
                name="contato"
                value={data.contato}
                onChange={handle}
                placeholder="Nome do Responsavel"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL</label>
              <input
                name="email"
                type="email"
                value={data.email}
                onChange={handle}
                placeholder="contato@empresa.com"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
          </div>

          {showSaveButton && (
            <div className="cadastro-actions">
              {!canSaveClienteCadastro && (
                <p className="cadastro-required-message">
                  Preencha nome fantasia, contato e e-mail valido para salvar o
                  cadastro.
                </p>
              )}
              <button
                type="button"
                className="btn-salvar-cadastro"
                onClick={saveCliente}
                disabled={!canSaveClienteCadastro}
              >
                Salvar cadastro do cliente
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cliente-modal-title"
          >
            <div
              className={`modal-steps ${modalStep === 2 ? "is-complete" : ""}`}
              aria-label={`Etapa ${modalStep} de 2`}
            >
              <button
                type="button"
                className={`modal-step ${modalStep === 1 ? "active" : ""}`}
                onClick={() => setModalStep(1)}
              >
                {modalStep}/2
              </button>
              <button
                type="button"
                className={`modal-step ${modalStep === 2 ? "active" : ""}`}
                onClick={() => selectedCliente && setModalStep(2)}
                disabled={!selectedCliente}
              >
                {modalStep === 1 ? "Cliente" : "Contato"}
              </button>
            </div>
            {modalStep === 1 ? (
              <>
                <h3 id="cliente-modal-title">Buscar Cliente</h3>
                <p className="modal-hint">
                  A pesquisa pode ser feita por Nome Fantasia ou CNPJ.
                </p>

                <div className="modal-search-row">
                  <input
                    type="text"
                    placeholder="Nome fantasia ou CNPJ"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-busca"
                  />
                  <button
                    type="button"
                    className="btn-modal-search"
                    onClick={handleSearch}
                  >
                    <SearchIcon />
                  </button>
                </div>

                {searchError && (
                  <p className="modal-message is-error">{searchError}</p>
                )}

                <div className="lista-clientes">
                  {clientesEncontrados.map((cliente, index) => (
                    <button
                      key={`${cliente.id}-${cliente.cnpj}-${index}`}
                      type="button"
                      className="cliente-item"
                      onClick={() => selectClienteForContact(cliente)}
                    >
                      <strong>
                        {cliente.nomeFantasia || cliente.razaoSocial}
                      </strong>
                      {cliente.razaoSocial &&
                        cliente.nomeFantasia !== cliente.razaoSocial && (
                          <small>{cliente.razaoSocial}</small>
                        )}
                      <span>{cliente.cnpj}</span>
                    </button>
                  ))}

                  {searched &&
                    !searchError &&
                    clientesEncontrados.length === 0 && (
                      <div className="modal-empty">
                        <p>Cliente não encontrado.</p>
                        <p>
                          Para cadastrar um novo cliente, digite o CNPJ do
                          cliente que deseja cadastrar.
                        </p>
                        <input
                          type="text"
                          placeholder="Digite o CNPJ para cadastro"
                          value={newCadastroCnpj}
                          onChange={(e) => setNewCadastroCnpj(e.target.value)}
                          className="input-cnpj-cadastro"
                        />
                        {cnpjExists(newCadastroCnpj, clientes) && (
                          <p className="modal-message is-error">
                            Este CNPJ já existe como cliente.
                          </p>
                        )}
                        <button
                          type="button"
                          className="btn-cadastrar-novo"
                          onClick={startNewCliente}
                          disabled={!canRegisterNewCliente}
                        >
                          Cadastrar novo cliente
                        </button>
                      </div>
                    )}
                </div>
              </>
            ) : (
              <>
                <h3 id="cliente-modal-title">Selecionar Contato</h3>
                <p className="modal-hint">
                  Cliente selecionado:{" "}
                  <strong>
                    {selectedCliente?.nomeFantasia ||
                      selectedCliente?.razaoSocial}
                  </strong>
                </p>

                <div className="modal-search-row single">
                  <input
                    type="text"
                    placeholder="Buscar contato por nome ou e-mail"
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setNewContact({ nome: "", email: "" });
                    }}
                    className="input-busca"
                  />
                </div>

                <div className="lista-clientes">
                  {filteredClienteContacts.map((contact) => (
                    <button
                      key={
                        contact.idContato || `${contact.nome}-${contact.email}`
                      }
                      type="button"
                      className="cliente-item"
                      onClick={() => selectClienteContact(contact)}
                    >
                      <strong>{contact.nome}</strong>
                      <span>{contact.email}</span>
                    </button>
                  ))}

                  {showClienteContactEmpty && (
                    <div className="modal-empty">
                      <p>Contato não encontrado.</p>
                      <p>Cadastre um novo contato para este cliente.</p>
                      <input
                        type="text"
                        placeholder="Nome"
                        value={newContact.nome}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <button
                        type="button"
                        className="btn-cadastrar-novo"
                        onClick={registerClienteContact}
                        disabled={!canRegisterClienteContact}
                      >
                        Cadastrar contato
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-modal-back"
                  onClick={() => setModalStep(1)}
                >
                  Voltar para Cliente
                </button>
              </>
            )}

            <button
              type="button"
              className="btn-modal-close"
              onClick={closeModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DistribuidorSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    inscEst: "",
    fone: "",
    cep: "",
    endereco: "",
    cidade: "",
    uf: "",
    contato: "",
    email: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [newCadastroCnpj, setNewCadastroCnpj] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);
  const [contactSearch, setContactSearch] = useState("");
  const [newContact, setNewContact] = useState({ nome: "", email: "" });

  const [distribuidores, setDistribuidores] = useState([]);

  useEffect(() => {
    const carregarDistribuidores = async () => {
      try {
        const dados = await fetchDistribuidoresPedido();
        setDistribuidores(dados);
      } catch (error) {
        console.error("Erro ao carregar distribuidores:", error);
        setDistribuidores([]);
      }
    };
    carregarDistribuidores();
  }, []);

  const newCadastroCnpjDigits = sanitizeCnpj(newCadastroCnpj);
  const newCadastroCnpjCleaned = removeFormatting(newCadastroCnpj);
  const canRegisterNewDistribuidor =
    (newCadastroCnpjDigits.length === 14 ||
      newCadastroCnpjCleaned.length === 14) &&
    isValidCnpj(newCadastroCnpj) &&
    !cnpjExists(newCadastroCnpj, distribuidores);
  const canSaveDistribuidorCadastro =
    Boolean(data.nomeFantasia.trim()) &&
    Boolean(data.contato.trim()) &&
    isValidEmail(data.email);
  const distribuidorContacts = getEntityContacts(selectedDistribuidor);
  const filteredDistribuidorContacts = distribuidorContacts.filter(
    (contact) => {
      const normalizedSearch = contactSearch.trim().toLowerCase();
      if (!normalizedSearch) return true;

      return (
        String(contact.nome || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(contact.email || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    },
  );
  const showDistribuidorContactEmpty =
    selectedDistribuidor &&
    contactSearch.trim() &&
    filteredDistribuidorContacts.length === 0;
  const canRegisterDistribuidorContact =
    Boolean(newContact.nome.trim()) && isValidEmail(newContact.email);

  const distribuidoresEncontrados =
    searched && !searchError
      ? distribuidores.filter((distribuidor) => {
          const normalizedSearch = String(search || "")
            .trim()
            .toLowerCase();
          const digits = onlyDigits(String(search || ""));

          if (digits.length === 14 && isValidCnpj(search)) {
            return onlyDigits(String(distribuidor.cnpj || "")) === digits;
          }

          return (
            String(distribuidor.nomeFantasia || "")
              .toLowerCase()
              .includes(normalizedSearch) ||
            String(distribuidor.razaoSocial || "")
              .toLowerCase()
              .includes(normalizedSearch)
          );
        })
      : [];

  const handle = (e) => {
    const value =
      e.target.name === "cnpj" ? formatCnpj(e.target.value) : e.target.value;
    const updated = { ...data, [e.target.name]: value };
    setData(updated);
    onChange?.(updated);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
    setModalStep(1);
    setSelectedDistribuidor(null);
    setContactSearch("");
    setNewContact({ nome: "", email: "" });
  };

  const handleSearch = () => {
    const digits = onlyDigits(search);

    if (digits.length === 14) {
      if (!isValidCnpj(search)) {
        setSearchError("Informe um CNPJ valido para pesquisar distribuidores.");
        setSearched(false);
        return;
      }

      setSearchError("");
      setSearched(true);
      return;
    }

    if (!search.trim()) {
      setSearchError(
        "Informe um nome fantasia ou CNPJ para pesquisar distribuidores.",
      );
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearched(false);
    setSearchError("");
  };

  const startNewDistribuidor = () => {
    const chosenCnpj =
      newCadastroCnpj && isValidCnpj(newCadastroCnpj)
        ? sanitizeCnpj(newCadastroCnpj)
        : sanitizeCnpj(search);

    const updated = { ...data, cnpj: formatCnpj(chosenCnpj) };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    setShowSaveButton(true);
    setNewCadastroCnpj("");
    closeModal();
  };

  const selectDistribuidorForContact = (distribuidor) => {
    setSelectedDistribuidor(distribuidor);
    setContactSearch("");
    setNewContact({ nome: "", email: "" });
    setModalStep(2);
  };

  const selectDistribuidorContact = (contact) => {
    const updated = {
      ...selectedDistribuidor,
      contato: contact.nome || "",
      email: contact.email || "",
    };

    setData(updated);
    onChange?.(updated);
    setShowSaveButton(false);
    setOpen(true);
    closeModal();
  };

  const registerDistribuidorContact = () => {
    if (!canRegisterDistribuidorContact) return;

    selectDistribuidorContact({
      id: `novo-${Date.now()}`,
      nome: newContact.nome.trim(),
      email: newContact.email.trim(),
    });
  };

  const saveDistribuidor = () => {
    if (!canSaveDistribuidorCadastro) return;
    setShowSaveButton(false);
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon">
            <img src={distribuidorIcon} alt="Distribuidor" />
          </span>
          Dados do Distribuidor
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Adicionar distribuidor
          </CnpjSearchButton>
          <span className="chevron">
            <ChevronIcon open={open} />
          </span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-1">
              <label>NOME FANTASIA</label>
              <input
                name="nomeFantasia"
                value={data.nomeFantasia}
                onChange={handle}
                placeholder="Ex: Tech Solutions"
              />
            </div>
            <div className="form-group grow-1">
              <label>RAZAO SOCIAL</label>
              <input
                name="razaoSocial"
                value={data.razaoSocial}
                onChange={handle}
                placeholder="Ex: Tech Solutions Ltda"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-160">
              <label>INSC. EST.</label>
              <input
                name="inscEst"
                value={data.inscEst}
                onChange={handle}
                placeholder="Isento"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-120">
              <label>FONE</label>
              <input
                name="fone"
                value={data.fone}
                onChange={handle}
                placeholder="(00) 0000-0000"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-140">
              <label>CEP</label>
              <input
                name="cep"
                value={data.cep}
                onChange={handle}
                placeholder="00000-000"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-180">
              <label>CNPJ</label>
              <input
                name="cnpj"
                value={data.cnpj}
                onChange={handle}
                placeholder="00.000.000/0000-00"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDERECO</label>
              <input
                name="endereco"
                value={data.endereco}
                onChange={handle}
                placeholder="Rua das Inovacoes, 123"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group grow-1">
              <label>CIDADE</label>
              <input
                name="cidade"
                value={data.cidade}
                onChange={handle}
                placeholder="Centro"
                {...readonlyInputProps}
              />
            </div>
            <div className="form-group w-70">
              <label>UF</label>
              <select
                name="uf"
                value={data.uf}
                onChange={handle}
                disabled
                className="readonly"
              >
                <option value="">--</option>
                {UF_LIST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO</label>
              <input
                name="contato"
                value={data.contato}
                onChange={handle}
                placeholder="Nome do Responsavel"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL</label>
              <input
                name="email"
                type="email"
                value={data.email}
                onChange={handle}
                placeholder="contato@empresa.com"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
          </div>

          {showSaveButton && (
            <div className="cadastro-actions">
              {!canSaveDistribuidorCadastro && (
                <p className="cadastro-required-message">
                  Preencha nome fantasia, contato e e-mail valido para salvar o
                  cadastro.
                </p>
              )}
              <button
                type="button"
                className="btn-salvar-cadastro"
                onClick={saveDistribuidor}
                disabled={!canSaveDistribuidorCadastro}
              >
                Salvar cadastro do distribuidor
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="distribuidor-modal-title"
          >
            <div
              className={`modal-steps ${modalStep === 2 ? "is-complete" : ""}`}
              aria-label={`Etapa ${modalStep} de 2`}
            >
              <button
                type="button"
                className={`modal-step ${modalStep === 1 ? "active" : ""}`}
                onClick={() => setModalStep(1)}
              >
                {modalStep}/2
              </button>
              <button
                type="button"
                className={`modal-step ${modalStep === 2 ? "active" : ""}`}
                onClick={() => selectedDistribuidor && setModalStep(2)}
                disabled={!selectedDistribuidor}
              >
                {modalStep === 1 ? "Distribuidor" : "Contato"}
              </button>
            </div>
            {modalStep === 1 ? (
              <>
                <h3 id="distribuidor-modal-title">Buscar Distribuidor</h3>
                <p className="modal-hint">
                  A pesquisa pode ser feita por Nome Fantasia ou CNPJ.
                </p>

                <div className="modal-search-row">
                  <input
                    type="text"
                    placeholder="Nome fantasia ou CNPJ"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-busca"
                  />
                  <button
                    type="button"
                    className="btn-modal-search"
                    onClick={handleSearch}
                  >
                    <SearchIcon />
                  </button>
                </div>

                {searchError && (
                  <p className="modal-message is-error">{searchError}</p>
                )}

                <div className="lista-clientes">
                  {distribuidoresEncontrados.map((distribuidor, index) => (
                    <button
                      key={`${distribuidor.id}-${distribuidor.cnpj}-${index}`}
                      type="button"
                      className="cliente-item"
                      onClick={() => selectDistribuidorForContact(distribuidor)}
                    >
                      <strong>
                        {distribuidor.nomeFantasia || distribuidor.razaoSocial}
                      </strong>
                      {distribuidor.razaoSocial &&
                        distribuidor.nomeFantasia !==
                          distribuidor.razaoSocial && (
                          <small>{distribuidor.razaoSocial}</small>
                        )}
                      <span>{distribuidor.cnpj}</span>
                    </button>
                  ))}

                  {searched &&
                    !searchError &&
                    distribuidoresEncontrados.length === 0 && (
                      <div className="modal-empty">
                        <p>Distribuidor não encontrado.</p>
                        <p>
                          Para cadastrar um novo distribuidor, digite o CNPJ do
                          distribuidor que deseja cadastrar.
                        </p>
                        <input
                          type="text"
                          placeholder="Digite o CNPJ para cadastro"
                          value={newCadastroCnpj}
                          onChange={(e) => setNewCadastroCnpj(e.target.value)}
                          className="input-cnpj-cadastro"
                        />
                        {cnpjExists(newCadastroCnpj, distribuidores) && (
                          <p className="modal-message is-error">
                            Este CNPJ já existe como distribuidor.
                          </p>
                        )}
                        <button
                          type="button"
                          className="btn-cadastrar-novo"
                          onClick={startNewDistribuidor}
                          disabled={!canRegisterNewDistribuidor}
                        >
                          Cadastrar novo distribuidor
                        </button>
                      </div>
                    )}
                </div>
              </>
            ) : (
              <>
                <h3 id="distribuidor-modal-title">Selecionar Contato</h3>
                <p className="modal-hint">
                  Distribuidor selecionado:{" "}
                  <strong>
                    {selectedDistribuidor?.nomeFantasia ||
                      selectedDistribuidor?.razaoSocial}
                  </strong>
                </p>

                <div className="modal-search-row single">
                  <input
                    type="text"
                    placeholder="Buscar contato por nome ou e-mail"
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setNewContact({ nome: "", email: "" });
                    }}
                    className="input-busca"
                  />
                </div>

                <div className="lista-clientes">
                  {filteredDistribuidorContacts.map((contact) => (
                    <button
                      key={
                        contact.idContato ||
                        contact.id ||
                        `${contact.nome}-${contact.email}`
                      }
                      type="button"
                      className="cliente-item"
                      onClick={() => selectDistribuidorContact(contact)}
                    >
                      <strong>{contact.nome}</strong>
                      <span>{contact.email}</span>
                    </button>
                  ))}

                  {showDistribuidorContactEmpty && (
                    <div className="modal-empty">
                      <p>Contato não encontrado.</p>
                      <p>Cadastre um novo contato para este distribuidor.</p>
                      <input
                        type="text"
                        placeholder="Nome"
                        value={newContact.nome}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <button
                        type="button"
                        className="btn-cadastrar-novo"
                        onClick={registerDistribuidorContact}
                        disabled={!canRegisterDistribuidorContact}
                      >
                        Cadastrar contato
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-modal-back"
                  onClick={() => setModalStep(1)}
                >
                  Voltar para Distribuidor
                </button>
              </>
            )}

            <button
              type="button"
              className="btn-modal-close"
              onClick={closeModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProdutoSection({ onChange }) {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    descricao: "",
    pn: "",
    entrega: "",
    quantidade: "",
    valorUnitario: "",
    valorTotal: "",
    unitFaturado: "",
    totalFaturado: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const produtosMock = [
    {
      id: 1,
      descricao: "Pacote Office 365 - 1 ano",
      pn: "00.000.000",
      valorUnitario: 100.0,
    },
  ];

  const produtosEncontrados =
    searched && !searchError
      ? produtosMock.filter((produto) =>
          produto.descricao.toLowerCase().includes(search.trim().toLowerCase()),
        )
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
    return isNaN(n)
      ? "R$ 0,00"
      : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setSearched(false);
  };

  const handleSearch = () => {
    if (!search.trim()) {
      setSearchError("Informe o nome do produto para pesquisar.");
      setSearched(false);
      return;
    }

    setSearchError("");
    setSearched(true);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearchError("");
    setSearched(Boolean(value.trim()));
  };

  const startNewProduto = () => {
    const updated = { ...data, descricao: search.trim() };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    setShowSaveButton(true);
    closeModal();
  };

  const saveProduto = () => {
    setShowSaveButton(false);
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <div className="section-title">
          <span className="section-icon">
            <img src={carrinho} alt="Carrinho" />
          </span>
          Dados do Produto
        </div>
        <div className="section-header-right">
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Adicionar produto
          </CnpjSearchButton>
          <span className="chevron">
            <ChevronIcon open={open} />
          </span>
        </div>
      </div>

      {open && (
        <div className="section-body">
          <div className="form-row">
            <div className="form-group grow-2">
              <label>DESCRICAO DO PRODUTO</label>
              <input
                name="descricao"
                value={data.descricao}
                onChange={handle}
                placeholder="Ex: Pacote Office 365"
              />
            </div>
            <div className="form-group grow-1">
              <label>P/N</label>
              <input
                name="pn"
                value={data.pn}
                onChange={handle}
                placeholder="00.000.000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>ENTREGA</label>
              <input
                name="entrega"
                value={data.entrega}
                onChange={handle}
                placeholder="Ex: IMEDIATA"
              />
            </div>
            <div className="form-group grow-1">
              <label>QUANTIDADE</label>
              <input
                name="quantidade"
                type="number"
                value={data.quantidade}
                onChange={handle}
                placeholder="0000"
              />
            </div>
            <div className="form-group grow-1">
              <label>VALOR UNITARIO</label>
              <input
                name="valorUnitario"
                type="number"
                step="0.01"
                value={data.valorUnitario}
                onChange={handle}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="form-group grow-1">
              <label>VALOR TOTAL</label>
              <input
                value={fmt(data.valorTotal)}
                readOnly
                className="readonly"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>VALOR UNIT. FATURADO</label>
              <input
                name="unitFaturado"
                type="number"
                step="0.01"
                value={data.unitFaturado}
                onChange={handle}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="form-group grow-1">
              <label>TOTAL FATURADO</label>
              <input
                value={fmt(data.totalFaturado)}
                readOnly
                className="readonly"
              />
            </div>
          </div>

          {showSaveButton && (
            <button
              type="button"
              className="btn-salvar-cadastro"
              onClick={saveProduto}
            >
              Salvar cadastro do produto
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Buscar Produto</h3>
            <p className="modal-hint">
              A pesquisa deve ser feita pelo nome do produto.
            </p>

            <div className="modal-search-row">
              <input
                type="text"
                placeholder="Digite o nome do produto"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-busca"
              />
              <button
                type="button"
                className="btn-modal-search"
                onClick={handleSearch}
              >
                <SearchIcon />
              </button>
            </div>

            {searchError && (
              <p className="modal-message is-error">{searchError}</p>
            )}

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
                    setShowSaveButton(false);
                    closeModal();
                  }}
                >
                  <strong>{produto.descricao}</strong>
                  <span>{produto.pn}</span>
                </div>
              ))}

              {searched && !searchError && produtosEncontrados.length === 0 && (
                <div className="modal-empty">
                  <p>
                    Nenhum produto com esse nome esta cadastrado no sistema.
                  </p>
                  <button
                    type="button"
                    className="btn-cadastrar-novo"
                    onClick={startNewProduto}
                  >
                    Cadastrar novo produto
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-modal-close"
              onClick={closeModal}
            >
              Fechar
            </button>
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
    setProdutos([
      ...produtos,
      {
        descricao: "",
        valorTotal: 0,
        totalFaturado: 0,
      },
    ]);
  };

  const removeProduto = (index) => {
    const novos = produtos.filter((_, i) => i !== index);
    setProdutos(novos);
    notify({ produtos: novos });
  };

  return (
    <div className="pedido-form">
      <ClienteSection
        onChange={(d) => {
          setCliente(d);
          notify({ cliente: d });
        }}
      />
      <DistribuidorSection
        onChange={(d) => {
          setDistribuidor(d);
          notify({ distribuidor: d });
        }}
      />
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
