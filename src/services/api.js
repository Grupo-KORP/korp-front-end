/**
 * services/api.js
 */

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("korp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata erros HTTP de forma centralizada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || `Erro HTTP ${status}`;

    const err = new Error(message);
    err.status = status;
    throw err;
  },
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, senha }) {
  console.log("API: login", { email, senha });
  const { data } = await api.post("/auth/login", { email, senha });
  // data = { token, nome, email }
  localStorage.setItem("korp_token", data.token);
  return { usuario: { nome: data.nome, email: data.email } };
}

export function logout() {
  localStorage.removeItem("korp_token");
}

export function verificarToken() {
  const token = localStorage.getItem("korp_token");
  if (!token) return false;

  try {
    const { expiresAt } = decodeJWT(token);
    return new Date() < expiresAt;
  } catch {
    return false;
  }
}

export function decodeJWT(token) {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      throw new Error("Token JWT inválido: formato incorreto.");
    }

    const base64Decode = (str) => {
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "=",
      );
      return JSON.parse(atob(padded));
    };

    const { sub, roles, id, iat, exp } = base64Decode(payload);

    return {
      email: sub,
      roles: roles.map((r) => r.authority),
      id,
      issuedAt: new Date(iat * 1000),
      expiresAt: new Date(exp * 1000),
    };
  } catch (error) {
    throw new Error(`Falha ao decodificar o JWT: ${error.message}`);
  }
}

export function verificarSeVendedor() {
  if (!verificarToken()) return false;
  const token = localStorage.getItem("korp_token");
  return decodeJWT(token).roles.includes("ROLE_VEND");
}

export function verificarSeFinanceiroEAdmin() {
  if (!verificarToken()) return false;
  const token = localStorage.getItem("korp_token");
  return (
    decodeJWT(token).roles.includes("ROLE_FINAN") ||
    decodeJWT(token).roles.includes("ROLE_ADMIN")
  );
}

export function verificarSeAdmin() {
  if (!verificarToken()) return false;
  const token = localStorage.getItem("korp_token");
  return decodeJWT(token).roles.includes("ROLE_ADMIN");
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
