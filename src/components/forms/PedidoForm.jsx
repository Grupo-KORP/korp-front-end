import { maskCNPJ as formatCnpj, maskCEP, maskPhone, formatMoneyInput, parseMoneyInput } from "../../utils/inputMasks";
import { confirmDelete } from "../modal/DeleteConfirmation";
import ActionIcon from "../ui/ActionIcon";
import RequiredMark from "../ui/RequiredMark";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import "./PedidoForm.css";
import distribuidorIcon from "../../assets/distribuidor.png";
import perfilCliente from "../../assets/perfil_cliente.png";
import carrinho from "../../assets/produto_carrinho.png";
import { fetchEmpresa, fetchCEP } from "../../utils/consultaExterna";
import {
  fetchClientesPedido,
  fetchDistribuidoresPedido,
  fetchProdutos,
  cadastrarProduto,
  cadastrarCliente,
  cadastrarDistribuidor,
  cadastrarContato,
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

function SearchIcon() { return <ActionIcon name="search" />; }
function AddIcon() { return <ActionIcon name="add" />; }

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

const emptyCadastro = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  fone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  cidade: "",
  uf: "",
  contato: "",
  email: "",
  contatoTelefone: "",
};

const isValidPhone = (value) => {
  const length = onlyDigits(String(value || "")).length;
  return length >= 10 && length <= 11;
};

const isCadastroCompleto = (d) =>
  Boolean(String(d.razaoSocial || "").trim()) &&
  Boolean(String(d.nomeFantasia || "").trim()) &&
  removeFormatting(d.cnpj).length === 14 &&
  isValidPhone(d.fone) &&
  onlyDigits(String(d.cep || "")).length === 8 &&
  Boolean(String(d.endereco || "").trim()) &&
  Boolean(String(d.numero || "").trim()) &&
  Boolean(String(d.cidade || "").trim()) &&
  Boolean(String(d.uf || "").trim()) &&
  Boolean(String(d.contato || "").trim()) &&
  isValidEmail(d.email) &&
  isValidPhone(d.contatoTelefone);

const buildCadastroPayload = (d) => ({
  razaoSocial: d.razaoSocial.trim(),
  nomeFantasia: d.nomeFantasia.trim(),
  cnpj: removeFormatting(d.cnpj),
  inscricaoEstadual: d.inscricaoEstadual ?? d.inscEst ?? "",
  telefone: onlyDigits(d.fone),
  cep: onlyDigits(d.cep),
  endereco: d.endereco,
  numero: d.numero.trim(),
  complemento: d.complemento || "",
  cidade: d.cidade,
  uf: d.uf,
  contatos: [
    {
      nome: d.contato.trim(),
      email: d.email.trim(),
      telefone: onlyDigits(d.contatoTelefone),
    },
  ],
});

function ClienteSection({ onChange, initialData }) {
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
    ...initialData,
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
  const [cadastroError, setCadastroError] = useState("");
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const dados = await fetchClientesPedido();
        setClientes(dados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Não foi possível carregar os clientes. Atualize a página para tentar novamente.");
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
  const canSaveClienteCadastro = isCadastroCompleto(data);
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
    Boolean(newContact.nome.trim()) &&
    isValidEmail(newContact.email) &&
    isValidPhone(newContact.telefone);

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
              .includes(normalizedSearch) ||
            getEntityContacts(cliente).some((contact) =>
              String(contact.nome || "").toLowerCase().includes(normalizedSearch)
            )
          );
        })
      : [];

  const handle = (e) => {
    const { name } = e.target;
    const value =
      name === "cnpj" ? formatCnpj(e.target.value) : name === "fone" || name === "contatoTelefone" ? maskPhone(e.target.value) : name === "cep" ? maskCEP(e.target.value) : e.target.value;
    const updated = { ...data, [name]: value };
    setData(updated);
    onChange?.(updated);
    if (name === "cep" && showSaveButton) buscarCep(value, updated);
  };

  const buscarCep = async (cepMasked, current) => {
    const digits = onlyDigits(cepMasked);
    if (digits.length !== 8) {
      const cleared = { ...current, endereco: "", cidade: "", uf: "" };
      setData(cleared);
      onChange?.(cleared);
      return;
    }

    setLoadingCep(true);
    try {
      const end = await fetchCEP(digits);
      if (onlyDigits(dataRef.current.cep) !== digits) return;
      const merged = { ...dataRef.current, ...end };
      setData(merged);
      onChange?.(merged);
    } catch {
      toast.error("CEP não encontrado.");
    } finally {
      setLoadingCep(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setCadastroError("");
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
        "Informe nome fantasia, CNPJ ou contato para pesquisar clientes.",
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

  const startNewCliente = async () => {
    if (loadingCnpj) return;
    const chosenCnpj =
      newCadastroCnpj && isValidCnpj(newCadastroCnpj)
        ? sanitizeCnpj(newCadastroCnpj)
        : sanitizeCnpj(search);

    setCadastroError("");
    setLoadingCnpj(true);
    try {
      const empresa = await fetchEmpresa(chosenCnpj);
      // Estado limpo: não herda o id/dados de um cliente selecionado antes.
      const updated = {
        ...emptyCadastro,
        inscricaoEstadual: empresa.inscEst,
        cnpj: formatCnpj(chosenCnpj),
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia,
      };
      setData(updated);
      onChange?.(updated);
      setOpen(true);
      setShowSaveButton(true);
      setNewCadastroCnpj("");
      closeModal();
    } catch (err) {
      setCadastroError(err?.message || "Não foi possível consultar o CNPJ.");
    } finally {
      setLoadingCnpj(false);
    }
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

  const registerClienteContact = async () => {
    if (!canRegisterClienteContact || savingContact) return;

    setSavingContact(true);
    try {
      const salvo = await cadastrarContato({
        nome: newContact.nome.trim(),
        email: newContact.email.trim(),
        telefone: onlyDigits(newContact.telefone),
        idCliente: selectedCliente.id,
      });
      const contato = {
        idContato: salvo.idContato,
        nome: salvo.nome,
        email: salvo.email,
        telefone: salvo.telefone,
      };
      setClientes((prev) =>
        prev.map((c) =>
          c.id === selectedCliente.id
            ? { ...c, contatos: [...(c.contatos || []), contato] }
            : c,
        ),
      );
      selectClienteContact(contato);
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar contato.");
    } finally {
      setSavingContact(false);
    }
  };

  const saveCliente = async () => {
    if (!canSaveClienteCadastro || saving) return;

    setSaving(true);
    try {
      const salvo = await cadastrarCliente(buildCadastroPayload(data));
      const updated = { ...data, id: salvo.idCliente };
      setData(updated);
      onChange?.(updated);
      setShowSaveButton(false);
      toast.success("Cliente cadastrado com sucesso!");
      try {
        setClientes(await fetchClientesPedido());
      } catch {
        setClientes((prev) => [...prev, { ...updated, contatos: [] }]);
      }
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar cliente.");
    } finally {
      setSaving(false);
    }
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
            Selecionar cliente
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
              <label>NOME FANTASIA<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="nomeFantasia"
                required
                aria-required="true"
                value={data.nomeFantasia}
                onChange={handle}
                placeholder="Ex: Tech Solutions"
              />
            </div>
            <div className="form-group grow-1">
              <label>RAZÃO SOCIAL</label>
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
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-120">
              <label>FONE{showSaveButton && <RequiredMark />}</label>
              <input
                name="fone"
                inputMode="tel"
                value={data.fone}
                onChange={handle}
                placeholder="(00) 00000-0000"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-140">
              <label>CEP{showSaveButton && <RequiredMark />}</label>
              <input
                name="cep"
                inputMode="numeric"
                value={data.cep}
                onChange={handle}
                placeholder="00000-000"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-180">
              <label>CNPJ</label>
              <input
                name="cnpj"
                inputMode="numeric"
                value={data.cnpj}
                onChange={handle}
                placeholder="00.000.000/0000-00"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDEREÇO</label>
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

          {showSaveButton && (
            <div className="form-row">
              <div className="form-group w-120">
                <label>NÚMERO<RequiredMark /></label>
                <input
                  name="numero"
                  aria-required="true"
                  value={data.numero || ""}
                  onChange={handle}
                  placeholder="104"
                />
              </div>
              <div className="form-group grow-1">
                <label>COMPLEMENTO</label>
                <input
                  name="complemento"
                  value={data.complemento || ""}
                  onChange={handle}
                  placeholder="Sala 104"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO{showSaveButton && <RequiredMark />}</label>
              <input
                name="contato"
                aria-required={showSaveButton || undefined}
                value={data.contato}
                onChange={handle}
                placeholder="Nome do Responsavel"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL{showSaveButton && <RequiredMark />}</label>
              <input
                name="email"
                aria-required={showSaveButton || undefined}
                type="email"
                value={data.email}
                onChange={handle}
                placeholder="contato@empresa.com"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            {showSaveButton && (
              <div className="form-group w-180">
                <label>TELEFONE DO CONTATO<RequiredMark /></label>
                <input
                  name="contatoTelefone"
                  inputMode="tel"
                  aria-required="true"
                  value={data.contatoTelefone || ""}
                  onChange={handle}
                  placeholder="(00) 00000-0000"
                />
              </div>
            )}
          </div>

          {showSaveButton && (
            <div className="cadastro-actions">
              {!canSaveClienteCadastro && (
                <p className="cadastro-required-message">
                  Preencha todos os campos obrigatórios (*) para salvar o
                  cadastro.
                </p>
              )}
              <button data-ui-action
                type="button"
                className="btn-salvar-cadastro modal-save-button"
                onClick={saveCliente}
                disabled={!canSaveClienteCadastro || saving}
              >
                {saving ? "Salvando..." : "Salvar cadastro do cliente"}
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
                  Pesquise por nome fantasia, CNPJ ou nome do contato.
                </p>

                <div className="modal-search-row">
                  <div className="app-search-field">
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                    <input
                    type="text"
                    placeholder="Nome fantasia, CNPJ ou contato"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="input-busca"
                  />
                  </div>
                  <button data-ui-action
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
                        <span className="block text-xs font-semibold text-gray-500">CNPJ<RequiredMark /></span>
                        <input
                          type="text"
                          placeholder="00.000.000/0000-00"
                          inputMode="numeric"
                        aria-required="true"
                          value={newCadastroCnpj}
                          onChange={(e) => {
                            setNewCadastroCnpj(formatCnpj(e.target.value));
                            setCadastroError("");
                          }}
                          className="input-cnpj-cadastro"
                        />
                        {cnpjExists(newCadastroCnpj, clientes) && (
                          <p className="modal-message is-error">
                            Este CNPJ já existe como cliente.
                          </p>
                        )}
                        {cadastroError && (
                          <p className="modal-message is-error">{cadastroError}</p>
                        )}
                        <button data-ui-action
                          type="button"
                          className="btn-cadastrar-novo modal-save-button"
                          onClick={startNewCliente}
                          disabled={!canRegisterNewCliente || loadingCnpj}
                        >
                          {loadingCnpj ? "Consultando CNPJ..." : "Cadastrar novo cliente"}
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
                  <div className="app-search-field">
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
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
                      <span className="block text-xs font-semibold text-gray-500">Nome<RequiredMark /></span>
                      <input
                        type="text"
                        placeholder="Nome"
                        aria-required="true"
                        value={newContact.nome}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <span className="block text-xs font-semibold text-gray-500">E-mail<RequiredMark /></span>
                      <input
                        type="email"
                        placeholder="E-mail"
                        aria-required="true"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <span className="block text-xs font-semibold text-gray-500">Telefone<RequiredMark /></span>
                      <input
                        type="text"
                        inputMode="tel"
                        placeholder="(00) 00000-0000"
                        aria-required="true"
                        value={newContact.telefone || ""}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            telefone: maskPhone(e.target.value),
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <button data-ui-action
                        type="button"
                        className="btn-cadastrar-novo modal-save-button"
                        onClick={registerClienteContact}
                        disabled={!canRegisterClienteContact || savingContact}
                      >
                        {savingContact ? "Salvando..." : "Cadastrar contato"}
                      </button>
                    </div>
                  )}
                </div>

                <button data-ui-action
                  type="button"
                  className="btn-modal-back"
                  onClick={() => setModalStep(1)}
                >
                  Voltar para Cliente
                </button>
              </>
            )}

            <button data-ui-action
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

function DistribuidorSection({ onChange, initialData }) {
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
    ...initialData,
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
  const [cadastroError, setCadastroError] = useState("");
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const [distribuidores, setDistribuidores] = useState([]);

  useEffect(() => {
    const carregarDistribuidores = async () => {
      try {
        const dados = await fetchDistribuidoresPedido();
        setDistribuidores(dados);
      } catch (error) {
        console.error("Erro ao carregar distribuidores:", error);
        toast.error("Não foi possível carregar os distribuidores. Atualize a página para tentar novamente.");
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
  const canSaveDistribuidorCadastro = isCadastroCompleto(data);
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
    Boolean(newContact.nome.trim()) &&
    isValidEmail(newContact.email) &&
    isValidPhone(newContact.telefone);

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
              .includes(normalizedSearch) ||
            getEntityContacts(distribuidor).some((contact) =>
              String(contact.nome || "").toLowerCase().includes(normalizedSearch)
            )
          );
        })
      : [];

  const handle = (e) => {
    const { name } = e.target;
    const value =
      name === "cnpj" ? formatCnpj(e.target.value) : name === "fone" || name === "contatoTelefone" ? maskPhone(e.target.value) : name === "cep" ? maskCEP(e.target.value) : e.target.value;
    const updated = { ...data, [name]: value };
    setData(updated);
    onChange?.(updated);
    if (name === "cep" && showSaveButton) buscarCep(value, updated);
  };

  const buscarCep = async (cepMasked, current) => {
    const digits = onlyDigits(cepMasked);
    if (digits.length !== 8) {
      const cleared = { ...current, endereco: "", cidade: "", uf: "" };
      setData(cleared);
      onChange?.(cleared);
      return;
    }

    setLoadingCep(true);
    try {
      const end = await fetchCEP(digits);
      if (onlyDigits(dataRef.current.cep) !== digits) return;
      const merged = { ...dataRef.current, ...end };
      setData(merged);
      onChange?.(merged);
    } catch {
      toast.error("CEP não encontrado.");
    } finally {
      setLoadingCep(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSearch("");
    setSearchError("");
    setCadastroError("");
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
        "Informe nome fantasia, CNPJ ou contato para pesquisar distribuidores.",
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

  const startNewDistribuidor = async () => {
    if (loadingCnpj) return;
    const chosenCnpj =
      newCadastroCnpj && isValidCnpj(newCadastroCnpj)
        ? sanitizeCnpj(newCadastroCnpj)
        : sanitizeCnpj(search);

    setCadastroError("");
    setLoadingCnpj(true);
    try {
      const empresa = await fetchEmpresa(chosenCnpj);
      // Estado limpo: não herda o id/dados de um distribuidor selecionado antes.
      const updated = {
        ...emptyCadastro,
        inscEst: empresa.inscEst,
        cnpj: formatCnpj(chosenCnpj),
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia,
      };
      setData(updated);
      onChange?.(updated);
      setOpen(true);
      setShowSaveButton(true);
      setNewCadastroCnpj("");
      closeModal();
    } catch (err) {
      setCadastroError(err?.message || "Não foi possível consultar o CNPJ.");
    } finally {
      setLoadingCnpj(false);
    }
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

  const registerDistribuidorContact = async () => {
    if (!canRegisterDistribuidorContact || savingContact) return;

    setSavingContact(true);
    try {
      const salvo = await cadastrarContato({
        nome: newContact.nome.trim(),
        email: newContact.email.trim(),
        telefone: onlyDigits(newContact.telefone),
        idDistribuidor: selectedDistribuidor.id,
      });
      const contato = {
        idContato: salvo.idContato,
        nome: salvo.nome,
        email: salvo.email,
        telefone: salvo.telefone,
      };
      setDistribuidores((prev) =>
        prev.map((d) =>
          d.id === selectedDistribuidor.id
            ? { ...d, contatos: [...(d.contatos || []), contato] }
            : d,
        ),
      );
      selectDistribuidorContact(contato);
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar contato.");
    } finally {
      setSavingContact(false);
    }
  };

  const saveDistribuidor = async () => {
    if (!canSaveDistribuidorCadastro || saving) return;

    setSaving(true);
    try {
      const salvo = await cadastrarDistribuidor(buildCadastroPayload(data));
      const updated = { ...data, id: salvo.idDistribuidor };
      setData(updated);
      onChange?.(updated);
      setShowSaveButton(false);
      toast.success("Distribuidor cadastrado com sucesso!");
      try {
        setDistribuidores(await fetchDistribuidoresPedido());
      } catch {
        setDistribuidores((prev) => [...prev, { ...updated, contatos: [] }]);
      }
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar distribuidor.");
    } finally {
      setSaving(false);
    }
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
            Selecionar distribuidor
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
              <label>NOME FANTASIA<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="nomeFantasia"
                required
                aria-required="true"
                value={data.nomeFantasia}
                onChange={handle}
                placeholder="Ex: Tech Solutions"
              />
            </div>
            <div className="form-group grow-1">
              <label>RAZÃO SOCIAL</label>
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
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-120">
              <label>FONE{showSaveButton && <RequiredMark />}</label>
              <input
                name="fone"
                inputMode="tel"
                value={data.fone}
                onChange={handle}
                placeholder="(00) 00000-0000"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-140">
              <label>CEP{showSaveButton && <RequiredMark />}</label>
              <input
                name="cep"
                inputMode="numeric"
                value={data.cep}
                onChange={handle}
                placeholder="00000-000"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group w-180">
              <label>CNPJ</label>
              <input
                name="cnpj"
                inputMode="numeric"
                value={data.cnpj}
                onChange={handle}
                placeholder="00.000.000/0000-00"
                {...readonlyInputProps}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-2">
              <label>ENDEREÇO</label>
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

          {showSaveButton && (
            <div className="form-row">
              <div className="form-group w-120">
                <label>NÚMERO<RequiredMark /></label>
                <input
                  name="numero"
                  aria-required="true"
                  value={data.numero || ""}
                  onChange={handle}
                  placeholder="104"
                />
              </div>
              <div className="form-group grow-1">
                <label>COMPLEMENTO</label>
                <input
                  name="complemento"
                  value={data.complemento || ""}
                  onChange={handle}
                  placeholder="Sala 104"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group grow-1">
              <label>CONTATO{showSaveButton && <RequiredMark />}</label>
              <input
                name="contato"
                aria-required={showSaveButton || undefined}
                value={data.contato}
                onChange={handle}
                placeholder="Nome do Responsavel"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group grow-1">
              <label>E-MAIL{showSaveButton && <RequiredMark />}</label>
              <input
                name="email"
                aria-required={showSaveButton || undefined}
                type="email"
                value={data.email}
                onChange={handle}
                placeholder="contato@empresa.com"
                {...(!showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            {showSaveButton && (
              <div className="form-group w-180">
                <label>TELEFONE DO CONTATO<RequiredMark /></label>
                <input
                  name="contatoTelefone"
                  inputMode="tel"
                  aria-required="true"
                  value={data.contatoTelefone || ""}
                  onChange={handle}
                  placeholder="(00) 00000-0000"
                />
              </div>
            )}
          </div>

          {showSaveButton && (
            <div className="cadastro-actions">
              {!canSaveDistribuidorCadastro && (
                <p className="cadastro-required-message">
                  Preencha todos os campos obrigatórios (*) para salvar o
                  cadastro.
                </p>
              )}
              <button data-ui-action
                type="button"
                className="btn-salvar-cadastro modal-save-button"
                onClick={saveDistribuidor}
                disabled={!canSaveDistribuidorCadastro || saving}
              >
                {saving ? "Salvando..." : "Salvar cadastro do distribuidor"}
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
                  Pesquise por nome fantasia, CNPJ ou nome do contato.
                </p>

                <div className="modal-search-row">
                  <div className="app-search-field">
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                    <input
                    type="text"
                    placeholder="Nome fantasia, CNPJ ou contato"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="input-busca"
                  />
                  </div>
                  <button data-ui-action
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
                        <span className="block text-xs font-semibold text-gray-500">CNPJ<RequiredMark /></span>
                        <input
                          type="text"
                          placeholder="00.000.000/0000-00"
                          inputMode="numeric"
                        aria-required="true"
                          value={newCadastroCnpj}
                          onChange={(e) => {
                            setNewCadastroCnpj(formatCnpj(e.target.value));
                            setCadastroError("");
                          }}
                          className="input-cnpj-cadastro"
                        />
                        {cnpjExists(newCadastroCnpj, distribuidores) && (
                          <p className="modal-message is-error">
                            Este CNPJ já existe como distribuidor.
                          </p>
                        )}
                        {cadastroError && (
                          <p className="modal-message is-error">{cadastroError}</p>
                        )}
                        <button data-ui-action
                          type="button"
                          className="btn-cadastrar-novo modal-save-button"
                          onClick={startNewDistribuidor}
                          disabled={!canRegisterNewDistribuidor || loadingCnpj}
                        >
                          {loadingCnpj ? "Consultando CNPJ..." : "Cadastrar novo distribuidor"}
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
                  <div className="app-search-field">
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
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
                      <span className="block text-xs font-semibold text-gray-500">Nome<RequiredMark /></span>
                      <input
                        type="text"
                        placeholder="Nome"
                        aria-required="true"
                        value={newContact.nome}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <span className="block text-xs font-semibold text-gray-500">E-mail<RequiredMark /></span>
                      <input
                        type="email"
                        placeholder="E-mail"
                        aria-required="true"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <span className="block text-xs font-semibold text-gray-500">Telefone<RequiredMark /></span>
                      <input
                        type="text"
                        inputMode="tel"
                        placeholder="(00) 00000-0000"
                        aria-required="true"
                        value={newContact.telefone || ""}
                        onChange={(e) =>
                          setNewContact((prev) => ({
                            ...prev,
                            telefone: maskPhone(e.target.value),
                          }))
                        }
                        className="input-cnpj-cadastro"
                      />
                      <button data-ui-action
                        type="button"
                        className="btn-cadastrar-novo modal-save-button"
                        onClick={registerDistribuidorContact}
                        disabled={!canRegisterDistribuidorContact || savingContact}
                      >
                        {savingContact ? "Salvando..." : "Cadastrar contato"}
                      </button>
                    </div>
                  )}
                </div>

                <button data-ui-action
                  type="button"
                  className="btn-modal-back"
                  onClick={() => setModalStep(1)}
                >
                  Voltar para Distribuidor
                </button>
              </>
            )}

            <button data-ui-action
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

function ProdutoSection({ onChange, initialData, onRemove }) {
  const [open, setOpen] = useState(true);

  const defaultValues = {
    descricao: "",
    pn: "",
    entrega: "",
    quantidade: "",
    valorUnitario: "",
    valorTotal: "",
    unitFaturado: "",
    totalFaturado: "",
    fkProduto: "",
  };

  const [data, setData] = useState({ ...defaultValues, ...initialData });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const dados = await fetchProdutos();
        setProdutos(dados || []);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Não foi possível carregar os produtos. Atualize a página para tentar novamente.", { id: "erro-carregar-produtos" });
        setProdutos([]);
      }
    };
    carregarProdutos();
  }, []);

  const produtosEncontrados =
    searched && !searchError
      ? produtos.filter((produto) =>
          [produto.nome, produto.pn].some((valor) =>
            (valor || "").toLowerCase().includes(search.trim().toLowerCase())
          )
        )
      : [];

  const canSaveProduto = data?.descricao?.trim() != "";

  const handle = (e) => {
    const field = e.target.name;
    if (["quantidade", "valorUnitario", "unitFaturado"].includes(field) && Number(e.target.value) < 0) {
      return;
    }
    const value = ["valorUnitario", "unitFaturado"].includes(field) ? parseMoneyInput(e.target.value) : e.target.value;
    let updated = { ...data, [field]: value };

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
      setSearchError("Informe o nome ou P/N do produto para pesquisar.");
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
    const updated = { ...data, descricao: search.trim(), pn: "", fkProduto: "" };
    setData(updated);
    onChange?.(updated);
    setOpen(true);
    setShowSaveButton(true);
    closeModal();
  };

  const saveProduto = async () => {
    const descricaoTrim = (data.descricao || "").trim();

    if (!descricaoTrim) {
      toast.error("Descrição é obrigatória.");
      return;
    }

    try {
      const novoProduto = await cadastrarProduto({
        nome: descricaoTrim,
        pn: (data.pn || "").trim(),
      });

      const updated = {
        ...data,
        fkProduto: novoProduto.idProduto,
        pn: novoProduto.pn ?? (data.pn || "").trim(),
      };
      setData(updated);
      onChange?.(updated);

      setProdutos((prev) => [...prev, novoProduto]);

      setShowSaveButton(false);
      toast.success("Produto cadastrado com sucesso!");
    } catch (error) {
      toast.error(error.message || "Erro ao cadastrar produto.");
    }
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
          {onRemove && (
            <button
              type="button"
              className="btn-remover-produto"
              aria-label="Remover produto"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
              </svg>
              <span className="remover-produto-tooltip" role="tooltip">Remover produto</span>
            </button>
          )}
          <CnpjSearchButton
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Selecionar produto
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
              <label>DESCRIÇÃO DO PRODUTO<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="descricao"
                required
                aria-required="true"
                value={data.descricao || ""}
                onChange={handle}
                placeholder="Ex: Pacote Office 365"
                {...(data.fkProduto && !showSaveButton ? readonlyInputProps : {})}
              />
            </div>
            <div className="form-group grow-1">
              <label>P/N</label>
              <input
                name="pn"
                value={data.pn || ""}
                onChange={handle}
                placeholder="Ex: ABC-001"
                {...(data.fkProduto && !showSaveButton ? readonlyInputProps : {})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>ENTREGA</label>
              <input
                name="entrega"
                value={data.entrega || ""}
                onChange={handle}
                placeholder="Ex: IMEDIATA"
              />
            </div>
            <div className="form-group grow-1">
              <label>QUANTIDADE<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="quantidade"
                min="1"
                required
                aria-required="true"
                type="number"
                value={data.quantidade || ""}
                onChange={handle}
                placeholder="Ex: 1"
              />
            </div>
            <div className="form-group grow-1">
              <label>VALOR UNITÁRIO<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="valorUnitario"

                required
                aria-required="true"
                type="text"
                inputMode="numeric"

                value={formatMoneyInput(data.valorUnitario)}
                onChange={handle}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="form-group grow-1">
              <label>VALOR TOTAL</label>
              <input
                value={fmt(data.valorTotal || "")}
                readOnly
                className="readonly"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group grow-1">
              <label>VALOR UNIT. FATURADO<span className="pedido-required" aria-hidden="true">*</span></label>
              <input
                name="unitFaturado"

                required
                aria-required="true"
                type="text"
                inputMode="numeric"

                value={formatMoneyInput(data.unitFaturado)}
                onChange={handle}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="form-group grow-1">
              <label>TOTAL FATURADO</label>
              <input
                value={fmt(data.totalFaturado || "")}
                readOnly
                className="readonly"
              />
            </div>
          </div>

          {showSaveButton && (
            <button data-ui-action
              type="button"
              className="btn-salvar-cadastro modal-save-button"
              onClick={saveProduto}
              disabled={!canSaveProduto}
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
              Pesquise pelo nome ou P/N do produto.
            </p>

            <div className="modal-search-row">
              <div className="app-search-field">
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                    <input
                type="text"
                placeholder="Digite o nome ou P/N do produto"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                className="input-busca"
              />
                  </div>
              <button data-ui-action
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
                  key={produto.idProduto}
                  className="cliente-item"
                  onClick={() => {
                    const updated = {
                      ...data,
                      descricao: produto.nome,
                      pn: produto.pn || "",
                      fkProduto: produto.idProduto,
                    };
                    setData(updated);
                    onChange?.(updated);
                    setShowSaveButton(false);
                    closeModal();
                  }}
                >
                  <strong>{produto.nome}</strong>
                  <span>P/N: {produto.pn || "—"}</span>
                </div>
              ))}

              {searched && !searchError && produtosEncontrados.length === 0 && (
                <div className="modal-empty">
                  <p>
                    Nenhum produto encontrado para essa pesquisa.
                  </p>
                  <button data-ui-action
                    type="button"
                    className="btn-cadastrar-novo modal-save-button"
                    onClick={startNewProduto}
                  >
                    Cadastrar novo produto
                  </button>
                </div>
              )}
            </div>

            <button data-ui-action
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

export default function PedidoForm({ onFormChange, initialData }) {
  const [cliente, setCliente] = useState(initialData?.cliente || {});
  const [distribuidor, setDistribuidor] = useState(initialData?.distribuidor || {});
  const [produtos, setProdutos] = useState(() =>
    initialData?.produtos?.length ? initialData.produtos : [{}]
  );

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
    const novos = [
      ...produtos,
      {
        descricao: "",
        pn: "",
        entrega: "",
        quantidade: "",
        valorUnitario: "",
        valorTotal: "",
        unitFaturado: "",
        totalFaturado: "",
        fkProduto: "",
      },
    ];
    setProdutos(novos);
    notify({ produtos: novos });
  };

  const removeProduto = async (index) => {
    if (!await confirmDelete({ entityLabel: "produto do pedido", name: produtos[index]?.descricao || produtos[index]?.pn || `Produto ${index + 1}`, description: "O item será removido deste pedido." })) return;
    const novos = produtos.filter((_, i) => i !== index);
    setProdutos(novos);
    notify({ produtos: novos });
  };

  return (
    <div className="pedido-form">
      <p className="pedido-form-hint">* Selecione um distribuidor, um cliente e um produto para preencher os campos automaticamente.</p>
      <DistribuidorSection
        initialData={distribuidor}
        onChange={(d) => {
          setDistribuidor(d);
          notify({ distribuidor: d });
        }}
      />
      <ClienteSection
        initialData={cliente}
        onChange={(d) => {
          setCliente(d);
          notify({ cliente: d });
        }}
      />
      {produtos.map((prod, index) => (
        <div key={index}>
          <ProdutoSection 
            initialData={prod}
            onChange={(d) => updateProduto(index, d)} 
            onRemove={index > 0 ? () => removeProduto(index) : undefined}
          />
        </div>
      ))}

      <button data-ui-action type="button" className="btn-add-produto" onClick={addProduto}>
        + Adicionar produto
      </button>
    </div>
  );
}
