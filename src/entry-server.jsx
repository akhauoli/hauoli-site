// ビルド時プリレンダー用エントリ（scripts/prerender.mjs から呼ばれる）
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import blogData from 'virtual:blog-data'

export function render(url) {
  return renderToString(<App url={url} />)
}

export const blog = blogData
