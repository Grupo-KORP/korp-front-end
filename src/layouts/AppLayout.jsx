import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { entities } from '../config/entities'
import { useAuth } from '../context/AuthContext'

const hiddenMenuKeys = new Set(['usuarios'])

export function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Korp CRUD</h1>
        <p>Painel administrativo com autenticacao JWT</p>

        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/">
            Inicio
          </NavLink>

          {entities
            .filter((entity) => !hiddenMenuKeys.has(entity.key))
            .map((entity) => (
            <NavLink
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              key={entity.key}
              to={entity.routeBase}
            >
              {entity.label}
            </NavLink>
            ))}
        </nav>

        <footer className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.nome || 'Usuario autenticado'}</strong>
            <small>{user?.email || ''}</small>
          </div>
          <button className="btn btn-light" onClick={handleLogout} type="button">
            Sair
          </button>
        </footer>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
