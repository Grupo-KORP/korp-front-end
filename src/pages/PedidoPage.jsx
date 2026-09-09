import NavbarVendedor from "../layout/NavbarVendedor";
import "./PedidoPage.css";
import PedidoForm from "../components/forms/PedidoForm";
import ResumoPedido from "../components/pedido/ResumoPedido";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { draftStorageKey, readDrafts, saveDraft, removeDraft } from "../services/pedidoDrafts";
import { useDarkMode } from "../hooks/useDarkMode";


export default function PedidoPage() {
    const { darkMode: modoEscuro } = useDarkMode();
    const [drafts, setDrafts] = useState([]);
    const [activeDraft, setActiveDraft] = useState(null);
    const [showDrafts, setShowDrafts] = useState(false);
    const draftsButtonRef = useRef(null);
    const fecharRascunhos = () => {
        setShowDrafts(false);
        draftsButtonRef.current?.focus();
    };
    const [formVersion, setFormVersion] = useState(0);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const getKey = () => draftStorageKey(localStorage.getItem("korp_token"));

    useEffect(() => {
        try { setDrafts(readDrafts(localStorage, getKey())); }
        catch (error) { toast.error(error.message); }
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

    const salvarRascunho = (resumoData = {}) => {
        try {
            const { drafts: next } = saveDraft(localStorage, getKey(), { ...formData, ...resumoData }, activeDraft || undefined);
            setDrafts(next);
            setFormData({ cliente: {}, distribuidor: {}, produtos: [], entrega: {} });
            setActiveDraft(null);
            setFormVersion(version => version + 1);
            setDirty(false);
            setShowDrafts(false);
            toast.success("Rascunho salvo. Você pode continuar depois em Rascunhos.");
        } catch (error) { toast.error(`Não foi possível salvar o rascunho. ${error.message}`); }
    };

    const abrirPedido = (draft) => {
        if (dirty && !window.confirm("Há alterações não salvas. Deseja descartá-las e continuar?")) return;
        setFormData(draft?.data || { cliente: {}, distribuidor: {}, produtos: [], entrega: {} });
        setActiveDraft(draft?.id || null);
        setFormVersion(version => version + 1);
        setDirty(false);
        setShowDrafts(false);
    };

    const excluirRascunho = (id) => {
        try {
            const remaining = removeDraft(localStorage, getKey(), id);
            setDrafts(remaining);
            if (remaining.length === 0) setShowDrafts(false);
            if (id === activeDraft) { setActiveDraft(null); setDirty(true); }
            toast.success("Rascunho excluído.");
        } catch (error) { toast.error(error.message); }
    };

    const pedidoSalvo = () => {
        setDirty(false);
        if (!activeDraft) return;
        try { setDrafts(removeDraft(localStorage, getKey(), activeDraft)); }
        catch { toast.error("Pedido criado, mas não foi possível remover o rascunho deste navegador."); }
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
                            <p>Pedidos</p>
                            <h1>{activeDraft ? "Editar rascunho" : "Novo Pedido"}</h1>
                          </div>
                          <div className="pedido-header-actions">
                            {drafts.length > 0 && <button ref={draftsButtonRef} type="button" className="btn-secondary" disabled={busy} aria-expanded={showDrafts} aria-controls="pedido-rascunhos" onClick={() => setShowDrafts(!showDrafts)}>
                                Rascunhos ({drafts.length})
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
                            <p>Salvos neste navegador para sua conta. Use Salvar rascunho para guardar as alterações.</p>
                            <div className="pedido-drafts-list" role="region" aria-label="Lista de rascunhos" tabIndex={0}>
                            {drafts.map(draft => <article className="pedido-draft" key={draft.id}>
                                <div>
                                    <strong>{draft.data.cliente.nomeFantasia || draft.data.cliente.razaoSocial || "Pedido sem cliente"}</strong>
                                    <span>{draft.data.produtos.length} produto(s) · {new Date(draft.updatedAt).toLocaleString("pt-BR")}</span>
                                    <span>{draft.data.distribuidor.nomeFantasia || draft.data.distribuidor.razaoSocial || "Distribuidor não informado"}</span>
                                </div>
                                <div className="pedido-header-actions">
                                    <button type="button" className="btn-secondary" disabled={busy} onClick={() => abrirPedido(draft)}>Continuar</button>
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
                            onSaveDraft={salvarRascunho}
                            onPedidoSaved={pedidoSalvo}
                            onBusyChange={setBusy}
                        />                    </div>
                </div>
            </div>
        </div>
    );
}
