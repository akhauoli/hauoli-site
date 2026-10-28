import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { normalizePath } from './router'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App url={window.location.pathname} />
  </StrictMode>
)
// トップ・ブログ等はビルド時に静的HTMLを出しているので、その場合は hydrate で引き継ぐ。
// ただし HTML を作ったパス(data-ssr-path)と今のパスが違う時（サーバーが別ページの HTML を返した時）は、
// 食い違いのエラーを出さないよう中身を捨てて描き直す。404.html は目印を付けないのでどのパスでも hydrate する
const ssrPath = root.dataset.ssrPath
if (root.hasChildNodes() && (!ssrPath || ssrPath === normalizePath(window.location.pathname))) hydrateRoot(root, app)
else { root.textContent = ''; createRoot(root).render(app) }
