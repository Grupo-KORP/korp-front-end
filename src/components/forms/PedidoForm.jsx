import InputField from "../ui/InputField";
import "./PedidoForm.css";

export default function PedidoForm({ formData, setFormData }) {
    return (
        <div className="pedido-form">

            {/* ================= CLIENTE ================= */}
            <section className="form-section">
                <h2>👤 Dados do Cliente</h2>

                <div className="grid-3">
                    <InputField
                        label="Razão Social"
                        value={formData.cliente}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                cliente: e.target.value
                            })
                        }
                        className="col-span-2"
                    />

                    <InputField
                        label="CNPJ"
                        value={formData.cnpj}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                cnpj: e.target.value
                            })
                        }
                        className="col-span-2"
                    />

                    <InputField
                        label="Insc. Est."
                        value={formData.inscEst}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                inscEst: e.target.value
                            })
                        }
                    />

                    <InputField
                        label="Fone"
                        value={formData.fone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                fone: e.target.value
                            })
                        }
                        className="col-span-2"
                    />

                    <InputField
                        label="CEP"
                        value={formData.cep}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                cep: e.target.value
                            })
                        }
                    />

                    <InputField
                        label="Endereço"
                        value={formData.endereco}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                endereco: e.target.value
                            })
                        }
                        className="col-span-2"
                    />

                    <InputField
                        label="Cidade"
                        value={formData.cidade}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                cidade: e.target.value
                            })
                        }
                    />

                    <InputField
                        label="UF"
                        value={formData.uf}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                uf: e.target.value
                            })
                        }
                    />

                    <InputField
                        label="Contato"
                        value={formData.contato}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                contato: e.target.value
                            })
                        }
                        className="col-span-2"
                    />

                    <InputField
                        label="E-mail"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value
                            })
                        }
                        className="col-span-2"
                    />
                </div>

            </section>


            {/* ================= DISTRIBUIDOR ================= */}
            <section className="form-section">
                <h2>✳️ Dados do Distribuidor</h2>

                <div className="grid-3">
                    <InputField label="Razão Social" className="col-span-2" />
                    <InputField label="CNPJ" className="col-span-2" />

                    <InputField label="Insc. Est." />
                    <InputField label="Fone" className="col-span-2" />
                    <InputField label="CEP" />

                    <InputField label="Endereço" className="col-span-2" />
                    <InputField label="Cidade" />
                    <InputField label="UF" />

                    <InputField label="Contato" className="col-span-2" />
                    <InputField label="E-mail" className="col-span-2" />
                </div>

            </section>


            {/* ================= PRODUTO ================= */}
            <section className="form-section">
                <h2>📦 Dados do Produto</h2>

                <div className="grid-3">
                    <InputField label="Descrição do Produto" className="col-span-2"/>
                    <InputField label="P/N" />
                    <InputField label="Entrega" />

                    <InputField label="Quantidade" className="col-span-2" />
                    <InputField label="Valor Unitário" className="col-span-2" />
                </div>

            </section>

        </div>
    );
}