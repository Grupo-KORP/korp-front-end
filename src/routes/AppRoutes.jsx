import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { EntityFormPage } from '../pages/EntityFormPage'
import { EntityListPage } from '../pages/EntityListPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<Navigate replace to="/clientes" />} path="/entities" />
        <Route element={<EntityListPage />} path=":entityKey" />
        <Route element={<EntityFormPage />} path=":entityKey/new" />
        <Route element={<EntityFormPage />} path=":entityKey/edit/:id" />
        <Route element={<EntityFormPage />} path=":entityKey/view/:id" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}
