import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '../components/auth/RouteGuards'
import { AppLayout } from '../layouts/AppLayout'
import { EntityFormPage } from '../pages/EntityFormPage'
import { EntityListPage } from '../pages/EntityListPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/cadastro" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<Navigate replace to="/clientes" />} path="/entities" />
          <Route element={<EntityListPage />} path=":entityKey" />
          <Route element={<EntityFormPage />} path=":entityKey/new" />
          <Route element={<EntityFormPage />} path=":entityKey/edit/:id" />
          <Route element={<EntityFormPage />} path=":entityKey/view/:id" />
          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
