import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App url={window.location.pathname} />
  </StrictMode>
)
// ブログはビルド時に静的HTMLを出しているので、その場合は hydrate で引き継ぐ
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
