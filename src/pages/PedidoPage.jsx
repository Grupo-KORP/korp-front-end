import NavbarVendedor from "../layout/NavbarVendedor";
import "./PedidoPage.css";
import PedidoForm from "../components/forms/PedidoForm";
import ResumoPedido from "../components/pedido/ResumoPedido";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { draftStorageKey, readDrafts, saveDraft, removeDraft } from "../services/pedidoDrafts";
import { useDarkMode } from "../hooks/useDarkMode";


export default function PedidoPage() {
    const { darkMode: modoEscuro } = useDarkMode();
    const [drafts, setDrafts] = useState([]);
    const [activeDraft, setActiveDraft] = useState(null);
    const [showDrafts, setShowDrafts] = useState(false);
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

    const salvarRascunho = () => {
        try {
            const { draft, drafts: next } = saveDraft(localStorage, getKey(), formData, activeDraft || undefined);
            setDrafts(next);
            setActiveDraft(draft.id);
            setDirty(false);
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
        if (!window.confirm("Excluir este rascunho? Esta ação não pode ser desfeita.")) return;
        try {
            setDrafts(removeDraft(localStorage, getKey(), id));
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
                            {activeDraft && <button type="button" className="btn-secondary" disabled={busy} onClick={() => abrirPedido(null)}>Novo pedido</button>}
                            <button type="button" className="btn-secondary" disabled={busy} aria-expanded={showDrafts} aria-controls="pedido-rascunhos" onClick={() => setShowDrafts(!showDrafts)}>
                                Rascunhos ({drafts.length})
                            </button>
                          </div>
                        </div>
                        {showDrafts && <section className="pedido-drafts" id="pedido-rascunhos" aria-label="Rascunhos salvos">
                            <h2>Continue de onde parou</h2>
                            <p>Salvos neste navegador para sua conta. Use Salvar rascunho para guardar as alterações.</p>
                            {drafts.length === 0 && <p>Nenhum rascunho salvo ainda.</p>}
                            {drafts.map(draft => <article className="pedido-draft" key={draft.id}>
                                <div>
                                    <strong>{draft.data.cliente.nomeFantasia || draft.data.cliente.razaoSocial || "Pedido sem cliente"}</strong>
                                    <span>{draft.data.produtos.length} produto(s) · {new Date(draft.updatedAt).toLocaleString("pt-BR")}</span>
                                    <span>{draft.data.distribuidor.nomeFantasia || draft.data.distribuidor.razaoSocial || "Distribuidor não informado"}</span>
                                </div>
                                <div className="pedido-header-actions">
                                    <button type="button" className="btn-secondary" disabled={busy} onClick={() => abrirPedido(draft)}>Continuar</button>
                                    <button type="button" className="btn-secondary draft-delete" disabled={busy} onClick={() => excluirRascunho(draft.id)}>Excluir</button>
                                </div>
                            </article>)}
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
