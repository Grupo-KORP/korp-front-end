import { confirmDelete } from "../components/modal/DeleteConfirmation";
import NavbarVendedor from "../layout/NavbarVendedor";
import "./PedidoPage.css";
import PedidoForm from "../components/forms/PedidoForm";
import ResumoPedido from "../components/pedido/ResumoPedido";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
    listarRascunhos,
    buscarRascunho,
    criarRascunho,
    atualizarRascunho,
    excluirRascunho as excluirRascunhoApi,
} from "../services/api";
import { montarDadosRascunho, dadosParaFormData, diasParaExpirar, LIMITE_RASCUNHOS } from "../services/pedidoDrafts";
import { useDarkMode } from "../hooks/useDarkMode";


export default function PedidoPage() {
    const { darkMode: modoEscuro } = useDarkMode();
    const [drafts, setDrafts] = useState([]);
    const [activeDraft, setActiveDraft] = useState(null); // { id, versao }
    const [showDrafts, setShowDrafts] = useState(false);
    const draftsButtonRef = useRef(null);
    const fecharRascunhos = () => {
        setShowDrafts(false);
        draftsButtonRef.current?.focus();
    };
    const [formVersion, setFormVersion] = useState(0);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [pendingDraft, setPendingDraft] = useState(null);
    const discardDialogRef = useRef(null);
    const keepChangesButtonRef = useRef(null);
    const salvandoRascunho = useRef(false);

    const recarregarRascunhos = async () => {
        try { setDrafts(await listarRascunhos()); }
        catch (error) { toast.error(error.message || "Não foi possível carregar os rascunhos."); }
    };

    useEffect(() => {
        const dialog = discardDialogRef.current;
        if (pendingDraft && !dialog.open) {
            dialog.showModal();
            keepChangesButtonRef.current?.focus();
        }
        else if (!pendingDraft && dialog.open) dialog.close();
    }, [pendingDraft]);

    useEffect(() => {
        recarregarRascunhos();
    }, []);

    useEffect(() => {
        const warn = (event) => {
            if (dirty) { event.preventDefault(); event.returnValue = ""; }
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    const [formData, setFormData] = useState({
        cliente: {},
        distribuidor: {},
        produtos: [],
        formaPagamento: "",
        entrega: {
            endereco: "",
            cidade: "",
            cep: "",
        },
    });

    const handleFormChange = (data) => {
        setDirty(true);
        setFormData(prev => {
            const nextData = { ...prev, ...data };

            if (data.cliente) {
                nextData.entrega = {
                    ...prev.entrega,
                    endereco: data.cliente.endereco || "",
                    cidade: data.cliente.cidade || "",
                    cep: data.cliente.cep || "",
                };
            }

            return nextData;
        });
    };

    const handleFormaPagamentoChange = (valor) => {
        setDirty(true);
        setFormData(prev => ({ ...prev, formaPagamento: valor }));
    };

    const salvarRascunho = async (resumoData = {}) => {
        if (salvandoRascunho.current) return;
        salvandoRascunho.current = true;
        setBusy(true);
        try {
            const dados = montarDadosRascunho(formData, resumoData);
            if (activeDraft) await atualizarRascunho(activeDraft.id, dados, activeDraft.versao);
            else await criarRascunho(dados);
            await recarregarRascunhos();
            setFormData(dadosParaFormData());
            setActiveDraft(null);
            setFormVersion(version => version + 1);
            setDirty(false);
            setShowDrafts(false);
            toast.success("Rascunho salvo. Você pode continuar depois em Rascunhos.");
        } catch (error) {
            if (error.codigo === "LIMITE_RASCUNHOS" || error.codigo === "VERSAO_DESATUALIZADA") {
                await recarregarRascunhos();
                setShowDrafts(true);
                toast.error(error.message);
            } else if (error.status === 404) {
                setActiveDraft(null);
                await recarregarRascunhos();
                toast.error("Este rascunho expirou ou foi excluído. Clique em Salvar rascunho para criar um novo.");
            } else {
                toast.error(`Não foi possível salvar o rascunho. ${error.message}`);
            }
        } finally {
            salvandoRascunho.current = false;
            setBusy(false);
        }
    };

    const carregarPedido = async (resumo) => {
        setBusy(true);
        try {
            const rascunho = await buscarRascunho(resumo.id);
            setFormData(dadosParaFormData(rascunho.dados));
            setActiveDraft({ id: rascunho.id, versao: rascunho.versao });
            setFormVersion(version => version + 1);
            setDirty(false);
            setShowDrafts(false);
        } catch (error) {
            if (error.status === 404) {
                await recarregarRascunhos();
                toast.error("Este rascunho expirou ou foi excluído.");
            } else {
                toast.error(`Não foi possível abrir o rascunho. ${error.message}`);
            }
        } finally {
            setBusy(false);
        }
    };

    const abrirPedido = (draft) => {
        if (dirty) { setPendingDraft(draft); return; }
        carregarPedido(draft);
    };

    const excluirRascunho = async (id) => {
        const draft = drafts.find(item => item.id === id);
        if (!await confirmDelete({ entityLabel: "rascunho", name: draft?.nomeCliente || draft?.nomeDistribuidor || "Pedido sem cliente" })) return;
        setBusy(true);
        try {
            try { await excluirRascunhoApi(id); }
            catch (error) { if (error.status !== 404) throw error; }
            const restantes = await listarRascunhos();
            setDrafts(restantes);
            if (restantes.length === 0) setShowDrafts(false);
            if (id === activeDraft?.id) { setActiveDraft(null); setDirty(true); }
            toast.success("Rascunho excluído.");
        } catch (error) { toast.error(`Não foi possível excluir o rascunho. ${error.message}`); }
        finally { setBusy(false); }
    };

    // O back apaga o rascunho de origem na mesma transação que cria o pedido.
    const pedidoSalvo = () => {
        setDirty(false);
    };

    return (
        <div className={`geral pedido-page ${modoEscuro ? "pedido-page-dark" : ""}`}>
            <NavbarVendedor />

            <div className="pedido-wrapper">
                <div className="pedido-content">
                    {/* ESQUERDA (SCROLL) */}
                    <div className="form-area" id="area-pdf">
                        <div className="pedido-header">
                          <div>
                            <p data-page-eyebrow>Pedidos</p>
                            <h1>{activeDraft ? "Editar rascunho" : "Novo Pedido de Venda"}</h1>
                          </div>
                          <div className="pedido-header-actions">
                            {drafts.length > 0 && <button data-ui-action ref={draftsButtonRef} type="button" className="btn-secondary" disabled={busy} aria-expanded={showDrafts} aria-controls="pedido-rascunhos" onClick={() => setShowDrafts(!showDrafts)}>
                                Rascunhos ({drafts.length}/{LIMITE_RASCUNHOS})
                            </button>}
                          </div>
                        </div>
                        {showDrafts && drafts.length > 0 && <section className="pedido-drafts" id="pedido-rascunhos" aria-label="Rascunhos salvos"
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    event.stopPropagation();
                                    fecharRascunhos();
                                }
                            }}>
                            <div className="pedido-drafts-header">
                                <h2>Continue de onde parou</h2>
                                <button type="button" className="pedido-drafts-close" aria-label="Fechar rascunhos" onClick={fecharRascunhos}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                                        <path d="m6 6 12 12M18 6 6 18" />
                                    </svg>
                                </button>
                            </div>
                            <p>Salvos na sua conta, no máximo {LIMITE_RASCUNHOS}. Cada rascunho expira 30 dias após a última alteração. Para salvar outro com o limite atingido, exclua um.</p>
                            <div className="pedido-drafts-list" role="region" aria-label="Lista de rascunhos" tabIndex={0}>
                            {drafts.map(draft => <article className="pedido-draft" key={draft.id}>
                                <div>
                                    <strong>{draft.nomeCliente || "Pedido sem cliente"}</strong>
                                    <span>{draft.qtdProdutos} produto(s) · {new Date(draft.dtAtualizacao).toLocaleString("pt-BR")} · expira em {diasParaExpirar(draft.dtExpiracao)} dia(s)</span>
                                    <span>{draft.nomeDistribuidor || "Distribuidor não informado"}</span>
                                </div>
                                <div className="pedido-header-actions">
                                    <button data-ui-action type="button" className="btn-secondary" disabled={busy} onClick={() => abrirPedido(draft)}>Continuar</button>
                                    <button type="button" className="draft-delete" disabled={busy} aria-label="Apagar rascunho" onClick={() => excluirRascunho(draft.id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                                        </svg>
                                        <span className="draft-delete-tooltip" role="tooltip">Apagar rascunho</span>
                                    </button>
                                </div>
                            </article>)}
                            </div>
                        </section>}
                        <PedidoForm
                            key={formVersion}
                            initialData={formData}
                            onFormChange={handleFormChange}
                        />
                    </div>

                    {/* DIREITA (FIXO) */}
                    <div className="resumo-area">
                        <ResumoPedido
                            key={formVersion}
                            formData={formData}
                            idRascunho={activeDraft?.id}
                            onSaveDraft={salvarRascunho}
                            onPedidoSaved={pedidoSalvo}
                            onBusyChange={setBusy}
                            onFormaPagamentoChange={handleFormaPagamentoChange}
                        />                    </div>
                </div>
            </div>
            <dialog
                ref={discardDialogRef}
                className="pedido-discard-dialog"
                aria-labelledby="pedido-discard-title"
                aria-describedby="pedido-discard-description"
                onCancel={(event) => { event.preventDefault(); setPendingDraft(null); }}
            >
                <h2 id="pedido-discard-title">Descartar alterações?</h2>
                <p id="pedido-discard-description">Há alterações não salvas neste pedido. Deseja descartá-las e abrir o rascunho selecionado?</p>
                <div className="resumo-modal-actions">
                    <button data-ui-action type="button" className="btn-primary" onClick={() => {
                        const draft = pendingDraft;
                        setPendingDraft(null);
                        if (draft) carregarPedido(draft);
                    }}>Sim</button>
                    <button data-ui-action ref={keepChangesButtonRef} type="button" className="btn-secondary" onClick={() => setPendingDraft(null)}>Não</button>
                </div>
            </dialog>
        </div>
    );
}
