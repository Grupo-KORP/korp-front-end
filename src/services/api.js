/**
 * services/api.js
 */

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: trata erros HTTP de forma centralizada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || `Erro HTTP ${status}`;

    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("korp:session-expired"));
    }

    const err = new Error(message);
    err.status = status;
    throw err;
  },
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, senha }) {
  const { data } = await api.post("/auth/login", { email, senha });
  return data;
}

export async function initializeCsrf() {
  await api.get("/auth/csrf");
}

export async function loadSession() {
  const { data } = await api.get("/auth/session");
  return data.usuario;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function verificarPrimeiroAcesso(usuario) {
  const sessao = usuario || await loadSession();
  if (!sessao?.id) throw new Error("Sessão não encontrada");

  const { data } = await api.get(`/usuario/${sessao.id}`);
  if (!data) throw new Error("Usuário não encontrado");

  const primeiroAcesso = Boolean(data.primeiroAcesso);

  return primeiroAcesso;
}

// ─── Troca de Senha ───────────────────────────────────────────────────────

export async function alterarSenha({ senhaAtual, novaSenha }) {
  const { data } = await api.post(`/usuario/trocar-senha-primeiro-acesso`, {
    senhaAtual,
    novaSenha,
  });
  return data;
}

export async function solicitarRecuperacaoSenha(email) {
  const { data } = await api.post('/usuario/esqueci-senha', { email });
  return data;
}

export async function redefinirSenha({ token, novaSenha, confirmaSenha }) {
  const { data } = await api.patch('/usuario/troca-senha', 
    { novaSenha, confirmaSenha },           
    { params: { token } }    
  );
  return data;
}
// ─── Colaboradores ───────────────────────────────────────────────────────────

export async function cadastrarColaborador(dados) {
  const payload = {
    idUsuario: "",
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone.replace(/\D/g, ""), // envia só números
    senha: "12345678", // mockado
    role: 1, // mockado
    percentualComissao: 6.0,
  };

  const { data } = await api.post("/usuario", payload);
  return data;
}

// export async function listarColaboradores() {
//   await new Promise(r => setTimeout(r, 500))
//   return []
// }

// ─── Clientes ────────────────────────────────────────────────────────

export async function fetchClientesPedido() {
  const { data } = await api.get("/cliente/pedido-dto");
  return data;
}

// ─── Distribuidores ──────────────────────────────────────────────────

export async function fetchDistribuidoresPedido() {
  const { data } = await api.get("/distribuidor/pedido-dto");
  return data;
}

// ─── Produtos ────────────────────────────────────────────────────────

export async function fetchProdutos() {
  const { data } = await api.get("/produto");
  return data;
}

export async function cadastrarProduto(produto) {
  const { data } = await api.post("/produto/cadastrar", produto);
  return data;
}

// ─── Pedidos ─────────────────────────────────────────────────────────

export async function cadastrarPedido(pedidoRequest) {
  console.log("API: cadastrarPedido", pedidoRequest);
  const { data } = await api.post("/pedidos/cadastrar", pedidoRequest);
  return data;
}

export async function criarComissao(idPedido, pagamentoDTO) {
  const { data } = await api.post(`/pedidos/${idPedido}/comissao`, pagamentoDTO);
  return data;
}

export async function atualizarPedido(idPedido, pedidoEditRequest) {
  const { data } = await api.put(`/pedidos/atualizar/${idPedido}`, pedidoEditRequest);
  return data;
}

// ─── Painel do vendedor ─────────────────────────────────────────────────────

export async function buscarPainelVendedor({ ano, mes, dia } = {}) {
  const params = {};
  if (ano !== null && ano !== undefined) params.ano = ano;
  if (mes !== null && mes !== undefined) params.mes = mes;
  if (dia !== null && dia !== undefined) params.dia = dia;

  try {
    const { data } = await api.get("/vendedor/home", { params });
    return data;
  } catch (err) {
    const status = err?.status ?? err?.response?.status;

    if (status === 404) throw new Error("Painel do vendedor sem dados.");
    if (status === 403) throw new Error("Sem permissão para acessar o painel.");
    if (status === 401) throw new Error("Sessão expirada. Faça login novamente.");

    throw new Error("Erro ao carregar o painel. Tente novamente.");
  }
}
