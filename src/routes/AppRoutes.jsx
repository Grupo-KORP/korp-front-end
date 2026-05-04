import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import VendedoresPage from '../pages/VendedoresPage'
import PedidoPage from '../pages/PedidoPage'
import HomeVendedor from '../pages/HomeVendedor'
import ClientePage from '../pages/ClientePage'
import DistribuidorPage from '../pages/DistribuidorPage'
import ProdutoPage from '../pages/ProdutoPage'

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
      <Route path="/vendedores/home"     element={<HomeVendedor/>} />
    </Routes>
  )
}

export default AppRoutes
