import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DarkModeProvider } from './hooks/useDarkMode'
import App from './App.jsx'
import './index.css'
import './styles/scrollbars.css'
import './styles/buttons.css'
import './styles/search-fields.css'
import './styles/headings.css'
import './styles/page-layout.css'
import './styles/modal-layout.css'
import './styles/registration-forms.css'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <Toaster richColors position="bottom-left" />
          <App />
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
