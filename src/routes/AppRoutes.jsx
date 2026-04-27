import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import VendedoresPage from '../pages/VendedoresPage'
import PedidoPage from '../pages/PedidoPage'
import HomeVendedor from '../pages/HomeVendedor'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*"           element={<Navigate to="/login" replace />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/financeiro/vendedores" element={<VendedoresPage />} />
      <Route path="/vendedores/pedido"     element={<PedidoPage />} />
      <Route path="/vendedores/home"     element={<HomeVendedor/>} />
    </Routes>
  )
}

export default AppRoutes