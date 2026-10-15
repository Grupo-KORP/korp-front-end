import { maskCNPJ, maskCEP, maskPhone } from "../utils/inputMasks";
import DeleteConfirmation from "../components/modal/DeleteConfirmation";
import ActionIcon from "../components/ui/ActionIcon";
import RequiredMark from "../components/ui/RequiredMark";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { toast } from "sonner";
import CatalogPage from "../components/catalog/CatalogPage";
import EntityDetailsModal from "../components/modal/EntityDetailsModal";

const PAGE_SIZE = 8;

// ─── Máscaras ─────────────────────────────────────────────────────────────────






// ─── Estado inicial ───────────────────────────────────────────────────────────
const emptyForm = {
  razaoSocial: "", nomeFantasia: "", cnpj: "", inscEst: "",
  fone: "", cep: "", endereco: "", numero: "", complemento: "",
  cidade: "", uf: "SP",
};

const emptyContact = { nome: "", email: "", telefone: "" };

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// ─── APIs externas ────────────────────────────────────────────────────────────
async function fetchEmpresa(cnpjRaw) {
  const res = await fetch(`https://api.opencnpj.org/${cnpjRaw}`);
  if (!res.ok) throw new Error("CNPJ não encontrado.");
  const data = await res.json();
  if (data.situacao_cadastral && data.situacao_cadastral.toLowerCase() !== "ativa") {
    throw new Error(`CNPJ com situação: ${data.situacao_cadastral}.`);
  }
  return {
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    inscEst: "",
  };
}

async function fetchCEP(cepRaw) {
  const res = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}

// ─── Helper: mapeia distribuidor da API para row ──────────────────────────────
function mapDistribuidorToRow(d, onEdit, onDelete, onView) {
  return {
    id: d.idDistribuidor ?? d.id,
    badge: d.nomeFantasia?.slice(0, 2).toUpperCase() ?? "DT",
    title: d.razaoSocial,
    subtitle: d.nomeFantasia || "",
    cells: [
      { value: d.contatos?.length ?? 0, className: "catalog-centered" },
      { value: d.uf || "-", className: "catalog-centered" },
      { value: "", className: "catalog-column-spacer" },
    ],
    onEdit: () => onEdit(d),
    onDelete: () => onDelete(d.idDistribuidor ?? d.id),
    onView: () => onView(d),
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DistribuidorPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("pagina") || "1", 10);
  const buscaFromUrl = searchParams.get("busca") || "";

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(buscaFromUrl);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl
  );
  const [isContactStep, setIsContactStep] = useState(false);
  const [contacts, setContacts] = useState([{ ...emptyContact }]);
  const [contactErrors, setContactErrors] = useState([{}]);
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);

  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [contactToDelete, setContactToDelete] = useState(null);
  const [deletingContact, setDeletingContact] = useState(false);

  // ── Sincroniza URL ──
  const syncUrl = useCallback((page, busca) => {
    const params = {};
    if (page > 1) params.pagina = String(page);
    if (busca) params.busca = busca;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // ── Fetch lista (paginado + busca) ──
  const fetchDistribuidores = useCallback(async (page, busca) => {
    setLoadingRows(true);
    try {
      const { data } = await api.get("/distribuidor/listarFiltro", {
        params: {
          page: page - 1,
          size: PAGE_SIZE,
          sort: "nomeFantasia",
          ...(busca ? { busca } : {}),
        },
      });
      if (data.content !== undefined) {
        setRows(data.content.map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete, handleView)));
        setTotalPages(data.totalPages ?? 1);
        console.log("Distribuidores carregados:", data.content);
      } else {
        setRows(data.map((d) => mapDistribuidorToRow(d, handleEdit, handleDelete, handleView)));
        setTotalPages(1);
      }
    } catch {
      toast.error("Erro ao carregar distribuidores.");
    } finally {
      setLoadingRows(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDistribuidores(currentPage, search);
  }, [currentPage, search, fetchDistribuidores]);

  // ── Troca de página ──
  function handlePageChange(page) {
    setCurrentPage(page);
    syncUrl(page, search);
  }

  // ── Search ──
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    syncUrl(1, val);
  }

  // ── Mudança de campo ──
  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;

    const updateField = (n, v) => {
      setForm((prev) => ({ ...prev, [n]: v }));
      setErrors((prev) => { const next = { ...prev }; delete next[n]; return next; });
    };

    if (name === "cnpj") {
      const masked = maskCNPJ(value);
      updateField("cnpj", masked);
      if (masked.replace(/\D/g, "").length === 14) {
        setLoadingCNPJ(true);
        try {
          const empresa = await fetchEmpresa(masked.replace(/\D/g, ""));
          setForm((prev) => ({ ...prev, razaoSocial: empresa.razaoSocial, inscEst: empresa.inscEst, nomeFantasia: empresa.nomeFantasia || "" }));
        } catch (err) { toast.error(err?.message ?? "Não foi possível consultar o CNPJ."); }
        finally { setLoadingCNPJ(false); }
      } else {
        setForm((prev) => ({ ...prev, razaoSocial: "", inscEst: "", nomeFantasia: "" }));
      }
      return;
    }

    if (name === "cep") {
      const masked = maskCEP(value);
      updateField("cep", masked);
      if (masked.replace(/\D/g, "").length === 8) {
        setLoadingCEP(true);
        try {
          const end = await fetchCEP(masked.replace(/\D/g, ""));
          setForm((prev) => ({ ...prev, ...end }));
        } catch { toast.error("CEP não encontrado."); }
        finally { setLoadingCEP(false); }
      } else {
        setForm((prev) => ({ ...prev, endereco: "", cidade: "", uf: "SP" }));
      }
      return;
    }

    if (name === "fone") { updateField("fone", maskPhone(value)); return; }
    updateField(name, value);
  }, []);

  // ── Contatos ──
  function handleContactChange(index, name, value) {
    setContacts((prev) => prev.map((item, idx) =>
      idx === index ? { ...item, [name]: name === "telefone" ? maskPhone(value) : value } : item
    ));
    setContactErrors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index] };
      delete next[index][name];
      return next;
    });
  }

  function addContact() {
    setContacts((prev) => [...prev, { ...emptyContact }]);
    setContactErrors((prev) => [...prev, {}]);
  }

  function removeContact(index) {
    if (contacts.length === 1) {
      setContacts([{ ...emptyContact }]);
      setContactErrors([{}]);
      return;
    }
    setContacts((prev) => prev.filter((_, idx) => idx !== index));
    setContactErrors((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleDeleteContact() {
    if (!contactToDelete) return;

    setDeletingContact(true);

    try {
      if (contactToDelete.idContato) {
        await api.delete(`/contatos/${contactToDelete.idContato}`);

        setContacts((prev) =>
          prev.filter(
            (c) => c.idContato !== contactToDelete.idContato
          )
        );

        toast.success("Contato removido com sucesso!");
      } else {
        removeContact(contactToDelete.index);
      }
    } catch {
      toast.error("Erro ao remover contato.");
    } finally {
      setDeletingContact(false);
      setContactToDelete(null);
    }
  }

  // ── View ──
  function handleView(d) {
    setSelectedDistribuidor(d);
    setShowDetailsModal(true);
  }

  // ── Editar ──
  function handleEdit(d) {
    setEditingId(d.idDistribuidor ?? d.id);
    setForm({
      razaoSocial: d.razaoSocial ?? "",
      inscEst: d.inscricaoEstadual ?? "",
      cnpj: maskCNPJ(d.cnpj ?? ""),
      nomeFantasia: d.nomeFantasia ?? "",
      fone: maskPhone(d.telefone ?? ""),
      cep: maskCEP(d.cep ?? ""),
      endereco: d.logradouro ?? "",
      numero: d.numero ?? "",
      complemento: d.complemento ?? "",
      cidade: d.cidade ?? "",
      uf: d.uf ?? "SP",
    });
    setContacts(
      d.contatos && d.contatos.length > 0
        ? d.contatos.map((item) => ({
          idContato: item.idContato,
          nome: item.nome || "",
          email: item.email || "",
          telefone: maskPhone(item.telefone || ""),
        }))
        : [{ nome: d.contato || "", email: d.email || "", telefone: "" }]
    );
    setContactErrors([{}]);
    setIsContactStep(false);
    setErrors({});
  }

  // ── Cancelar ──
  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setContacts([{ ...emptyContact }]);
    setContactErrors([{}]);
    setIsContactStep(false);
    setErrors({});
  }

  // ── Deletar ──
  async function handleDelete(id) {
    setLoadingRows(true);
    try {
      await api.delete(`/distribuidor/${id}`);
      toast.success("Distribuidor removido com sucesso!");
      await fetchDistribuidores(currentPage, search);
    } catch (err) {
      if (err?.status === 404) toast.error("Distribuidor não encontrado.");
      else toast.error("Erro ao remover distribuidor. Tente novamente.");
    } finally {
      setLoadingRows(false);
    }
  }

  // ── Validação ──
  function validateCompany() {
    const errs = {};
    if (!form.razaoSocial.trim()) errs.razaoSocial = "Razão social obrigatória.";
    if (!form.nomeFantasia.trim()) errs.nomeFantasia = "Nome fantasia obrigatório.";
    if (form.cnpj.replace(/\D/g, "").length < 14) errs.cnpj = "CNPJ inválido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10) errs.fone = "Telefone inválido.";
    if (form.cep.replace(/\D/g, "").length < 8) errs.cep = "CEP inválido.";
    if (!form.numero.trim()) errs.numero = "Número obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateContacts() {
    const errorsByContact = contacts.map((contact) => {
      const err = {};
      if (!contact.nome.trim()) err.nome = "Nome obrigatório.";
      if (!contact.email || !contact.email.includes("@")) err.email = "E-mail inválido.";
      if (!contact.telefone || contact.telefone.replace(/\D/g, "").length < 10) err.telefone = "Telefone inválido.";
      return err;
    });
    const hasAny = errorsByContact.some((e) => Object.keys(e).length > 0);
    setContactErrors(errorsByContact);
    return !hasAny && contacts.length > 0;
  }

  // ── Submit (2 etapas) ──
  async function handleSubmit() {
    if (!isContactStep) {
      if (!validateCompany()) return;
      setIsContactStep(true);
      return;
    }

    if (!validateContacts()) {
      if (contacts.length === 0) {
        toast.error("Cadastre pelo menos um contato.");
      }
      return;
    }

    const companyPayload = {
      razaoSocial: form.razaoSocial,
      inscricaoEstadual: form.inscEst,
      cnpj: form.cnpj.replace(/\D/g, ""),
      nomeFantasia: form.nomeFantasia,
      telefone: form.fone.replace(/\D/g, ""),
      cep: form.cep.replace(/\D/g, ""),
      endereco: form.endereco,
      numero: form.numero,
      complemento: form.complemento,
      cidade: form.cidade,
      uf: form.uf,
    };

    const contatosPayload = {
      contatos: contacts.map((c) => ({
        idContato: c.idContato,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone.replace(/\D/g, ""),
      })),
    };

    setLoading(true);

    try {
      if (editingId) {
        console.log("Payload distribuidor:", {
  ...companyPayload,
  contatos: contatosPayload.contatos,
});
        await api.put(
          `/distribuidor/${editingId}`,
          companyPayload
        );

        await api.put(
          `/distribuidor/${editingId}/contatos`,
          contatosPayload
        );

        toast.success(
          "Distribuidor atualizado com sucesso!"
        );

        setEditingId(null);

      } else {
        console.log("Payload para criação:", {
          ...companyPayload,
          contatos: contatosPayload.contatos,
        });

        await api.post("/distribuidor", {
          ...companyPayload,
          contatos: contatosPayload.contatos,
        });

        toast.success(
          "Distribuidor cadastrado com sucesso!"
        );
      }

      setForm(emptyForm);
      setContacts([{ ...emptyContact }]);
      setContactErrors([{}]);
      setIsContactStep(false);
      setErrors({});

      await fetchDistribuidores(
        currentPage,
        search
      );

    } catch (err) {

      if (err?.status === 409) {
        toast.error(err.message);
      } else if (err?.status === 404) {
        toast.error("Distribuidor não encontrado.");
      } else if (err?.status === 400) {
        toast.error(
          err.message ?? "Dados inválidos."
        );
      } else {
        toast.error(
          editingId
            ? "Erro ao atualizar distribuidor."
            : "Erro ao cadastrar distribuidor."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  // ── Fields da etapa 1 ──
  const fields = [
    { name: "cnpj", required: true, label: "CNPJ", pair: "start", placeholder: "00.000.000/0000-00", value: form.cnpj, loading: loadingCNPJ, error: errors.cnpj, readOnly: !!editingId  },
    { name: "inscEst", label: "Insc. Est.", pair: "end", placeholder: "Inscri\u00e7\u00e3o estadual ou Isento", value: form.inscEst, loading: loadingCNPJ, readOnly: !!editingId  },
    { name: "razaoSocial", required: true, label: "Razão Social", placeholder: "Ex: Tech Solutions Ltda", value: form.razaoSocial, readOnly: true, loading: loadingCNPJ, error: errors.razaoSocial },
    { name: "nomeFantasia", required: true, label: "Nome Fantasia", placeholder: "Ex: Tech Solutions", value: form.nomeFantasia, loading: loadingCNPJ, error: errors.nomeFantasia },
    { name: "fone", required: true, label: "Fone", pair: "start", placeholder: "(00) 00000-0000", value: form.fone, error: errors.fone },
    { name: "cep", required: true, label: "CEP", pair: "end", placeholder: "00000-000", value: form.cep, loading: loadingCEP, error: errors.cep },
    { name: "endereco", label: "Endereço", placeholder: "Rua das Inovações", value: form.endereco, readOnly: true, loading: loadingCEP },
    { name: "numero", required: true, label: "Número", pair: "start", placeholder: "104", value: form.numero, error: errors.numero },
    { name: "complemento", label: "Complemento", pair: "end", placeholder: "Sala 104", value: form.complemento },
    { name: "cidade", label: "Cidade", pair: "start", placeholder: "São Paulo", value: form.cidade, readOnly: true, loading: loadingCEP },
    { name: "uf", label: "UF", pair: "end", type: "select", value: form.uf, readOnly: true, options: UF_OPTIONS },
  ];

  // ── Conteúdo da etapa 2 (contatos) ──
  const contactStepContent = (
    <div className="space-y-6">
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="catalog-contact-card">
            <div className="catalog-contact-heading">
              <p>Contato {index + 1}</p>
              <button
                type="button"
                className="catalog-contact-delete"
                onClick={() =>
                  setContactToDelete({
                    ...contact,
                    index,
                  })
                }
                aria-label={`Remover contato ${index + 1}`}
                title="Remover contato"
              >
                <ActionIcon name="delete" />
              </button>
            </div>
            <div className="catalog-form-row mt-4">
              <div className="catalog-form-field">
                <span>Nome do contato<RequiredMark /></span>
                <input type="text" placeholder="Nome do contato"
                  aria-required="true"
                  aria-invalid={Boolean(contactErrors[index]?.nome)}
                  title={contactErrors[index]?.nome || undefined}
                  value={contact.nome}
                  onChange={(e) => handleContactChange(index, "nome", e.target.value)}
                />
              </div>
              <div className="catalog-form-field">
                <span>E-mail<RequiredMark /></span>
                <input type="email" placeholder="contato@empresa.com"
                  aria-required="true"
                  aria-invalid={Boolean(contactErrors[index]?.email)}
                  title={contactErrors[index]?.email || undefined}
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, "email", e.target.value)}
                />
              </div>
            </div>
            <div className="catalog-form-field mt-4">
              <span>Telefone<RequiredMark /></span>
              <input type="tel" placeholder="(00) 00000-0000"
                  aria-required="true"
                aria-invalid={Boolean(contactErrors[index]?.telefone)}
                  title={contactErrors[index]?.telefone || undefined}
                  value={contact.telefone}
                onChange={(e) => handleContactChange(index, "telefone", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <button data-ui-action type="button" className="btn-add-produto" onClick={addContact}>
        + Adicionar Contato
      </button>
    </div>
  );

  return (
    <>
      <CatalogPage
        eyebrow="Distribuidores Cadastrados"
        title="Painel de Fornecedores"
        searchPlaceholder="Pesquisar Distribuidor"
        searchValue={search}
        onSearchChange={handleSearchChange}
        tableTitle="Base de Fornecedores"
        tableColumns={[
          { label: "Identificação dos Cadastros", flex: "2" },
          { label: "Contatos", flex: "1" },
          { label: "UF", flex: "0.7" },
          { label: "", flex: "1.4" },
        ]}
        rows={rows}
        loadingRows={loadingRows}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        formTitle="Cadastrar Novo Distribuidor"
        formTitleEdit="Editar Distribuidor"
        isEditing={!!editingId}
        fields={isContactStep ? [] : fields}
        extraFormContent={isContactStep ? contactStepContent : null}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel={loading ? "Aguarde..." : isContactStep ? "Salvar cadastro" : editingId ? "Salvar e editar contatos →" : "Salvar e adicionar contato →"}
        submitDisabled={loading}
        validationError={isContactStep && contactErrors.some((errors) => Object.keys(errors || {}).length > 0)}
        deleteEntityLabel="distribuidor"
      />

      <EntityDetailsModal
      title="Detalhes do Distribuidor"
      open={showDetailsModal}
      entity={selectedDistribuidor}
      onClose={() => setShowDetailsModal(false)}
    />

    {contactToDelete && <DeleteConfirmation name={contactToDelete.nome || ('Contato ' + (contactToDelete.index + 1))} entityLabel="contato" busy={deletingContact} onCancel={() => setContactToDelete(null)} onConfirm={handleDeleteContact} />}
    </>
  );
}
