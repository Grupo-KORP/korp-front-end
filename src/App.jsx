import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'sonner'

/**
 * Componente raiz da aplicação KORP.
 * Delega o roteamento para AppRoutes.
 */
function App() {
  return (<>
    <AppRoutes />
  </>
  )
}

export default App
