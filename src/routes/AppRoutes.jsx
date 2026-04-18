import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import VendedoresPage from '../pages/VendedoresPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vendedores" replace />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/vendedores" element={<VendedoresPage />} />
      <Route path="*"           element={<Navigate to="/vendedores" replace />} />
    </Routes>
  )
}

export default AppRoutes
