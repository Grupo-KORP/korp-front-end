import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  initializeCsrf,
  loadSession as loadSessionRequest,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      await initializeCsrf();
      const sessionUser = await loadSessionRequest();
      setUsuario(sessionUser);
      return sessionUser;
    } catch (error) {
      if (error?.status !== 401) {
        console.error("Falha ao restaurar a sessão", error);
      }
      setUsuario(null);
      return null;
    } finally {
      setInitialized(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUsuario(null);
      setInitialized(true);
      setLoading(false);
    };

    window.addEventListener("korp:session-expired", handleSessionExpired);
    return () => window.removeEventListener("korp:session-expired", handleSessionExpired);
  }, []);

  const entrar = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await initializeCsrf();
      const data = await loginRequest(credentials);
      setUsuario(data.usuario);
      return data;
    } catch (requestError) {
      const message =
        requestError?.status === 401
          ? "Usuário ou senha incorretos."
          : requestError?.status === 403
            ? requestError.message || "Acesso negado."
            : "Erro inesperado. Tente novamente.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sair = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUsuario(null);
    }
  }, []);

  const hasRole = useCallback(
    (role) => Boolean(usuario?.roles?.includes(role)),
    [usuario],
  );

  const value = useMemo(() => ({
    usuario,
    error,
    loading,
    initialized,
    isAuthenticated: Boolean(usuario),
    hasRole,
    loadSession,
    entrar,
    sair,
  }), [usuario, error, loading, initialized, hasRole, loadSession, entrar, sair]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
