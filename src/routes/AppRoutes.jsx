import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import VendedoresPage from '../pages/VendedoresPage'
import PedidoPage from '../pages/PedidoPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/vendedores" element={<VendedoresPage />} />
      <Route path="/pedido"     element={<PedidoPage />} />
      <Route path="*"           element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes