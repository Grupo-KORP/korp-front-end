import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import VendedoresPage from '../pages/VendedoresPage'
import PedidoPage from '../pages/PedidoPage'
import HomeVendedor from '../pages/HomeVendedor'
import ClientePage from '../pages/ClientePage'
import DistribuidorPage from '../pages/DistribuidorPage'
import ProdutoPage from '../pages/ProdutoPage'
import ComissoesPage from '../pages/ComissoesPage'
import PaginaRecuperarSenha from './../pages/PaginaRecuperarSenha'
import PaginaRedefinirSenha from './../pages/PaginaRedefinirSenha'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*"           element={<Navigate to="/login" replace />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/financeiro/vendedores" element={<VendedoresPage />} />
      <Route path="/vendedores/cliente" element={<ClientePage />} />
      <Route path="/vendedores/distribuidor" element={<DistribuidorPage />} />
      <Route path="/vendedores/produtos" element={<ProdutoPage />} />
      <Route path="/vendedores/pedido"     element={<PedidoPage />} />
      <Route path="/vendedores/home"     element={<HomeVendedor/>}   />
      <Route path="/comissoes" element={<ComissoesPage />} />
      <Route path="/vendedores/recuperar-senha" element={<PaginaRecuperarSenha />} />
      <Route path="/vendedores/redefinir-senha" element={<PaginaRedefinirSenha />} />
    </Routes>
  )
}

export default AppRoutes
