import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fonte para baixa visão (diferencia bem 0 e O, 1 e l). Vem do npm, funciona sem internet.
import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/700.css'
import './estilos.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
