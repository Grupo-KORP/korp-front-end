import NavbarVendedor from "../layout/NavbarVendedor";
import "./PedidoPage.css";
import PedidoForm from "../components/forms/PedidoForm";
import ResumoPedido from "../components/pedido/ResumoPedido";
import { useState } from "react";
import { useDarkMode } from "../hooks/useDarkMode";


export default function PedidoPage() {
    const { darkMode: modoEscuro } = useDarkMode();

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
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleEntregaChange = (updates) => {
        setFormData(prev => ({
            ...prev,
            entrega: { ...prev.entrega, ...updates }
        }));
    };

    return (
        <div className={`geral pedido-page ${modoEscuro ? "pedido-page-dark" : ""}`}>
            <NavbarVendedor />

            <div className="pedido-wrapper">
                <div className="pedido-content">
                    {/* ESQUERDA (SCROLL) */}
                    <div className="form-area" id="area-pdf">
                        <div className="pedido-header">
                            <h1>Novo Pedido</h1>
                            <p>Preencha os dados abaixo para gerar uma nova ordem de venda</p>
                        </div>
                        <PedidoForm
                            onFormChange={handleFormChange}
                        />
                    </div>

                    {/* DIREITA (FIXO) */}
                    <div className="resumo-area">
                        <ResumoPedido
                            formData={formData}
                            onEntregaChange={handleEntregaChange}
                        />                    </div>
                </div>
            </div>
        </div>
    );
}
