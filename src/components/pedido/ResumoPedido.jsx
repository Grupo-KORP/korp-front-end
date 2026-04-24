import "./ResumoPedido.css";
import { useState } from "react";

export default function ResumoPedido({ formData, setFormData }) {
    const [canalVenda, setCanalVenda] = useState("direct");

    return (
        <div className="resumo-container">
            {/* ================= RESUMO PEDIDO ================= */}
            <div className="resumo-box">
                <h3>📋 Resumo do Pedido</h3>

                <div className="resumo-item">
                    <span>Distribuidor Responsável</span>
                    <select defaultValue="main">
                        <option value="main">Main Distribution Hub SE</option>
                        <option value="other">Outro Distribuidor</option>
                    </select>
                </div>

                <div className="resumo-item">
                    <span>Canal de Venda</span>
                    <div className="canal-buttons">
                        <button 
                            className={`canal-btn ${canalVenda === "direct" ? "active" : ""}`}
                            onClick={() => setCanalVenda("direct")}
                        >
                            Direct
                        </button>
                        <button 
                            className={`canal-btn ${canalVenda === "partner" ? "active" : ""}`}
                            onClick={() => setCanalVenda("partner")}
                        >
                            Partner
                        </button>
                        <button 
                            className={`canal-btn ${canalVenda === "online" ? "active" : ""}`}
                            onClick={() => setCanalVenda("online")}
                        >
                            Online
                        </button>
                    </div>
                </div>

                <div className="resumo-item">
                    <span>Cliente Faturado</span>
                    <select value={formData.cliente || ""} onChange={(e) => 
                        setFormData({...formData, cliente: e.target.value})
                    }>
                        <option value="">Selecionar Cliente</option>
                        <option value="Tech Solutions Ltda">Tech Solutions Ltda</option>
                    </select>
                </div>

                <div className="resumo-item">
                    <span>Local de Entrega</span>
                    <select value={formData.endereco || ""} onChange={(e) => 
                        setFormData({...formData, endereco: e.target.value})
                    }>
                        <option value="">Selecionar Local</option>
                        <option value="Rua das Inovações, 123">Rua das Inovações, 123</option>
                    </select>
                </div>

                <div className="resumo-row">
                    <div className="resumo-item">
                        <span>Cidade</span>
                        <strong>{formData.cidade || "—"}</strong>
                    </div>
                    <div className="resumo-item">
                        <span>CEP</span>
                        <strong>{formData.cep || "—"}</strong>
                    </div>
                </div>

                <div className="resumo-item">
                    <span>Produto</span>
                    <select defaultValue="office365">
                        <option value="office365">Pacote Office 365</option>
                        <option value="office">Pacote Office</option>
                    </select>
                </div>
            </div>

            {/* ================= RESUMO FINANCEIRO ================= */}
            <div className="resumo-box resumo-financeiro-box">
                <h3>💰 Resumo Financeiro</h3>

                <div className="financeiro-item">
                    <span>Valor de Compra</span>
                    <strong>R$ 5.500,00</strong>
                </div>

                <div className="financeiro-item">
                    <span>Valor de Faturamento</span>
                    <strong>R$ 6.500,00</strong>
                </div>

                <button className="btn-final">Adicionar Pedido</button>
            </div>
        </div>
    );
}