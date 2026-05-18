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
                        />                    </div>
                </div>
            </div>
        </div>
    );
}
