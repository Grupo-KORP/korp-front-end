import React, { useState } from "react";
import Navbar from "../layout/Navbar";
import Alert from "../components/ui/Alert";
import { api } from "../services/api.js"

const initialVendedores = [
  { id: 1, codigo: "V1", nome: "VENDEDOR 1", emailInterno: "maria.silva@tndbrasil.com", emailExterno: "maria.silva@microsoft.com", compras: 5, status: "Ativo", comissao: "30%" },
  { id: 2, codigo: "V2", nome: "VENDEDOR 2", emailInterno: "joao.oliveira@tndbrasil.com", emailExterno: "joao.oliveira@techsolutons.com", compras: 2, status: "Ativo", comissao: "25%" },
  { id: 3, codigo: "V3", nome: "VENDEDOR 3", emailInterno: "ana.costa@tndbrasil.com", emailExterno: "ana.costa@glabal.corp", compras: 4, status: "Ativo", comissao: "30%" },
  { id: 4, codigo: "V4", nome: "VENDEDOR 4", emailInterno: "rafa.santos@tndbrasil.com", emailExterno: "rafa.santos@globan.com", compras: 1, status: "Ativo", comissao: "20%" },
];

const emptyForm = { nome: "", email: "", fone: "", comissao: "30%", status: "Ativo" };

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState(initialVendedores);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  /* ── Máscara de telefone ── */
  function maskPhone(raw) {
    raw = raw.replace(/\D/g, "").slice(0, 11);
    if (raw.length > 7) return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    if (raw.length > 2) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return raw;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    const newValue = name === "fone" ? maskPhone(value) : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim() || form.nome.trim().split(" ").length < 2)
      errs.nome = "Informe o nome completo.";
    if (!form.email || !form.email.includes("@"))
      errs.email = "Informe um e-mail válido.";
    if (!form.fone || form.fone.replace(/\D/g, "").length < 10)
      errs.fone = "Telefone inválido.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }


async function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const payload = {
    nome: form.nome.toUpperCase(),
    email: form.email,
    senha: 123456,
    telefone: form.fone,
    role: 2,
    percentualComissao: parseFloat(form.comissao)
  };

  try {
  
      const response = await api.post(
        `/usuario`,
        payload
      );

      console.log(response.data);

      setVendedores((prev) => [...prev, response.data]);

      setSuccess("Vendedor cadastrado com sucesso!");
    

    setForm(emptyForm);
    setTimeout(() => setSuccess(null), 3000);

  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

  function handleEdit(v) {
    setEditingId(v.id);
    setForm({ nome: v.nome, email: v.emailExterno, fone: "", comissao: v.comissao, status: v.status });
    setErrors({});
  }

  function handleDelete(id) {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  const filtered = vendedores.filter(
    (v) =>
      v.nome.toLowerCase().includes(search.toLowerCase()) ||
      v.emailExterno.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-700 uppercase mb-1">
              Colaboradores Cadastrados
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">Painel de vendedores</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              placeholder="PESQUISAR VENDEDOR"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-500 placeholder-gray-400 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-300 w-64 shadow-sm"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex gap-6 items-start">
          {/* ── Tabela de Vendedores ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full bg-brand-blue" />
              <h2 className="text-lg font-bold text-gray-800">Base de vendedores</h2>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-2 mb-3">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Identificação dos Cadastros
              </span>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">E-Mail</span>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase text-center">
                Compras Realizadas
              </span>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right pr-2">
                Ferramentas
              </span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1">
              {displayed.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">Nenhum vendedor encontrado.</p>
              )}
              {displayed.map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 items-center px-2 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  {/* Identificação */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-blue">{v.codigo}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{v.nome}</p>
                      <p className="text-xs text-gray-400">{v.emailInterno}</p>
                    </div>
                  </div>

                  {/* E-mail externo */}
                  <span className="text-sm text-blue-600 font-medium truncate">{v.emailExterno}</span>

                  {/* Compras */}
                  <span className="text-sm font-bold text-gray-700 text-center">{v.compras}</span>

                  {/* Ferramentas */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      aria-label="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 018.586 12.5L15.232 5.232z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      aria-label="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ver mais */}
            {filtered.length > 4 && (
              <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 tracking-widest hover:text-brand-blue transition-colors uppercase"
                >
                  {showAll ? "VER MENOS" : "VER MAIS CLIENTES"}
                  <svg
                    className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* ── Painel de Cadastro ── */}
          <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
            {/* Header do form */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xs font-extrabold tracking-widest text-gray-800 uppercase">
                  {editingId ? "Editar Vendedor" : "Cadastrar Novo Vendedor"}
                </h3>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase">Formulário de Cadastro</p>
            </div>

            {/* Feedback */}
            {success && <Alert type="success" message={success} />}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Nome */}
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">
                  Nome Completo
                </label>
                <input
                  name="nome"
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={form.nome}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
                    errors.nome ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
              </div>

              {/* E-mail */}
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">
                  E-mail TND
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="rafael.santos@tndbrasil.com"
                  value={form.email}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Fone */}
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">
                  Fone
                </label>
                <input
                  name="fone"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  value={form.fone}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
                    errors.fone ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.fone && <p className="text-xs text-red-500 mt-1">{errors.fone}</p>}
              </div>

              {/* Comissão */}
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">
                  Percentual de Comissão
                </label>
                <input
                  name="comissao"
                  type="text"
                  placeholder="30%"
                  value={form.comissao}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">
                  Status do Colaborador
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none cursor-pointer"
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md"
                  style={{ background: "linear-gradient(135deg, #1a3a7a 0%, #2d5fa6 100%)" }}
                >
                  {editingId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
