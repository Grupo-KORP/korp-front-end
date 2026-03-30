import { NavLink, Outlet } from 'react-router-dom'
import { entities } from '../config/entities'

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Korp CRUD</h1>
        <p>Painel administrativo plug-and-play</p>

        <nav className="sidebar-nav">
          {entities.map((entity) => (
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
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
