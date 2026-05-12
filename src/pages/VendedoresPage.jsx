import React, { useEffect, useRef, useState } from "react";
import Alert from "../components/ui/Alert";
import { api, verificarSeFinanceiro, verificarToken } from "../services/api.js";
import NavbarVendedor from "../layout/NavbarFinanceiro.jsx";
import { useDarkMode } from "../hooks/useDarkMode.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialVendedores = [
  { id: 1, codigo: "V1", nome: "Matheus Camargo", emailInterno: "maria.silva@tndbrasil.com", emailExterno: "maria.silva@microsoft.com", vendas: 5, comissoesPendentes: 2, status: "Ativo", comissao: "30%" },
  { id: 2, codigo: "V2", nome: "Ana Silva", emailInterno: "joao.oliveira@tndbrasil.com", emailExterno: "joao.oliveira@techsolutons.com", vendas: 2, comissoesPendentes: 1, status: "Ativo", comissao: "25%" },
  { id: 3, codigo: "V3", nome: "Henrique Santos", emailInterno: "ana.costa@tndbrasil.com", emailExterno: "ana.costa@glabal.corp", vendas: 4, comissoesPendentes: 0, status: "Ativo", comissao: "30%" },
  { id: 4, codigo: "V4", nome: "Rafael Almeida", emailInterno: "rafa.santos@tndbrasil.com", emailExterno: "rafa.santos@globan.com", vendas: 1, comissoesPendentes: 1, status: "Ativo", comissao: "20%" },
];

const emptyForm = { nome: "", email: "", fone: "", comissao: "30%", status: "Ativo" };

export default function VendedoresPage() {
  const navigate = useNavigate();
  const toastShown = useRef(false);

useEffect(() => {
  if (toastShown.current) return;

  if (!verificarToken()) {
    toastShown.current = true;
    toast.error("Sessão expirada. Faça login novamente.", {
      duration: 500,
      onAutoClose: () => navigate("/login"),
    });
    return;
  }

  // Página exclusiva do financeiro — vendedor não tem acesso
  if (!verificarSeFinanceiro()) {
    toastShown.current = true;
    toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
    navigate("/vendedores/home");
  }
}, []);

  const { darkMode: modoEscuro } = useDarkMode();

  const [vendedores, setVendedores] = useState(initialVendedores);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  /* classes de tema */
  const bg      = modoEscuro ? "bg-gray-900"  : "";
  const cardBg  = modoEscuro ? "bg-gray-800"  : "bg-white";
  const borda   = modoEscuro ? "border-gray-700" : "border-gray-200";
  const textoP  = modoEscuro ? "text-white"   : "text-gray-900";
  const textoM  = modoEscuro ? "text-gray-300" : "text-gray-800";
  const textoS  = modoEscuro ? "text-gray-400" : "text-gray-400";
  const inputBg = modoEscuro ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-300";
  const hover   = modoEscuro ? "hover:bg-gray-700" : "hover:bg-gray-50";

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
      senha: "",
      telefone: form.fone,
      role: 2,
      percentualComissao: parseFloat(form.comissao)
    };

    try {
      const response = await api.post(`/usuario`, payload);
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
    <div
      className={`h-screen overflow-hidden flex flex-col ${bg} transition-colors duration-300`}
      style={!modoEscuro ? { background: "linear-gradient(120deg, #e0e7ff, #f8fafc)" } : undefined}
    >
      <NavbarVendedor />

      <div className="flex-1 overflow-y-auto lg:overflow-hidden w-full px-5 py-4 sm:py-5">
        <div className="flex h-full w-full flex-col">
        {/* Main Grid */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-4 items-stretch">

          {/* ── Tabela de Vendedores ── */}
          <div className="min-w-0 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="pl-4 sm:pl-6">
                <h1 className={`text-xl font-extrabold leading-tight ${textoP}`}>Painel de vendedores</h1>
                <p className="text-[10px] font-semibold tracking-widest text-blue-500 uppercase leading-none mt-0.5">
                  Colaboradores Cadastrados
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:max-w-xs md:max-w-sm xl:max-w-md">
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
                  className={`pl-9 pr-4 py-2 rounded-xl border text-[13px] placeholder-gray-400 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-300 w-full shadow-sm ${inputBg}`}
                />
              </div>
            </div>

            <div className={`${cardBg} rounded-2xl shadow-sm p-4 sm:p-6 transition-colors duration-300 flex min-h-0 flex-col flex-1`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full bg-blue-700" />
              <h2 className={`text-lg font-bold ${textoM}`}>Base de vendedores</h2>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-2 mb-2">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${textoS}`}>
                Identificação dos Cadastros
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase text-center ${textoS}`}>
                Vendas Realizadas
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase text-center whitespace-nowrap ${textoS}`}>
                Comiss&otilde;es Pendentes
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase text-center ${textoS}`}>
                Ferramentas
              </span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1 flex-1">
              {displayed.length === 0 && (
                <p className={`text-sm text-center py-8 ${textoS}`}>Nenhum vendedor encontrado.</p>
              )}
              {displayed.map((v) => (
                <div
                  key={v.id}
                  className={`grid grid-cols-4 gap-4 items-center px-2 py-3.5 rounded-xl ${hover} transition-colors group`}
                >
                  {/* Identificação */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${modoEscuro ? "bg-blue-900/50" : "bg-blue-50"}`}>
                      <span className="text-xs font-bold text-blue-500">{v.codigo}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${textoM}`}>{v.nome}</p>
                      <p className={`text-xs ${textoS}`}>{v.emailInterno}</p>
                    </div>
                  </div>

                  {/* Vendas */}
                  <span className={`text-sm font-bold text-center ${textoM}`}>{v.vendas ?? 0}</span>

                  {/* Comissoes pendentes */}
                  <span className={`text-sm font-bold text-center ${textoM}`}>{v.comissoesPendentes ?? 0}</span>

                  {/* Ferramentas */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${textoS} hover:text-blue-500 ${modoEscuro ? "hover:bg-blue-900/40" : "hover:bg-blue-50"}`}
                      aria-label="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 018.586 12.5L15.232 5.232z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${textoS} hover:text-red-500 ${modoEscuro ? "hover:bg-red-900/30" : "hover:bg-red-50"}`}
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
            <div className={`-mx-6 mt-4 flex justify-center border-t ${borda} pt-4 pb-1`}>
              <button
                onClick={() => setShowAll(!showAll)}
                disabled={filtered.length <= 4}
                className={`flex items-center gap-3 text-[11px] font-extrabold tracking-widest uppercase transition-colors ${
                  filtered.length > 4 ? `${textoS} hover:text-blue-500` : `${textoS} cursor-default`
                }`}
              >
                {showAll ? "VER MENOS" : "VER MAIS VENDEDORES"}
                <svg
                  className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Painel de Cadastro ── */}
          </div>

          <div className={`w-full lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 ${cardBg} rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-5 transition-colors duration-300`}>
            {/* Header do form */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className={`text-xs font-extrabold tracking-widest uppercase ${textoM}`}>
                  {editingId ? "Editar Vendedor" : "Cadastrar Vendedor"}
                </h3>
              </div>
              <p className={`text-[10px] tracking-wider uppercase ${textoS}`}>Formulário de Cadastro</p>
            </div>

            {/* Feedback */}
            {success && <Alert type="success" message={success} />}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Nome */}
              <div>
                <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                  Nome Completo
                </label>
                <input
                  name="nome"
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={form.nome}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.nome ? "border-red-400" : ""}`}
                />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
              </div>

              {/* E-mail */}
              <div>
                <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                  E-mail TND
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="rafael.santos@tndbrasil.com"
                  value={form.email}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.email ? "border-red-400" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Fone */}
              <div>
                <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                  Telefone
                </label>
                <input
                  name="fone"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  value={form.fone}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${errors.fone ? "border-red-400" : ""}`}
                />
                {errors.fone && <p className="text-xs text-red-500 mt-1">{errors.fone}</p>}
              </div>

              {/* Comissão */}
              <div>
                <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                  Percentual de Comissão
                </label>
                <input
                  name="comissao"
                  type="text"
                  placeholder="30%"
                  value={form.comissao}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg}`}
                />
              </div>

              {/* Status */}
              <div>
                <label className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${textoS}`}>
                  Status do Colaborador
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none cursor-pointer ${inputBg}`}
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-1">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${borda} ${textoS} ${hover}`}
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
    </div>
  );
}
