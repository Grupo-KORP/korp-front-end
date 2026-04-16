import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import CadastroPage from '../pages/CadastroPage'

/**
 * Configuração central de rotas da aplicação.
 *
 * Rotas disponíveis:
 *   /login     → Tela de login do vendedor
 *   /cadastro  → Tela de cadastro de colaborador
 *   /          → Redireciona para /login
 *
 * Futuras rotas a adicionar aqui:
 *   /dashboard → Dashboard principal
 *   /usuarios  → Listagem de usuários
 *   /vendas    → Módulo de vendas
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Redireciona raiz para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Autenticação */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      {/* TODO: adicionar rota de dashboard quando backend estiver pronto */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}

      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
