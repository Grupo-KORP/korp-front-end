import Navbar from "../layout/Navbar";
import "./PedidoPage.css";
import PedidoForm from "../components/forms/PedidoForm";
import ResumoPedido from "../components/pedido/ResumoPedido";
import { useState } from "react";

export default function PedidoPage() {

    const [formData, setFormData] = useState({
        cliente: "",
        cnpj: "",
        endereco: "",
        cidade: "",
        cep: "",
    });

    return (
        <div className="geral">
            <Navbar />

            <div className="pedido-wrapper">
                <div className="pedido-content">
                    {/* ESQUERDA (SCROLL) */}
                    <div className="form-area">
                        <div className="pedido-header">
                            <h1>Novo Pedido</h1>
                            <p>Preencha os dados abaixo para gerar uma nova ordem de venda</p>
                        </div>
                        <PedidoForm
                            formData={formData}
                            setFormData={setFormData}
                        />
                    </div>

                    {/* DIREITA (FIXO) */}
                    <div className="resumo-area">
                        <ResumoPedido
                            formData={formData}
                            setFormData={setFormData}
                        />                    </div>
                </div>
            </div>
        </div>
    );
}