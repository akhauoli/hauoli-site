import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { track } from './tracking'

// 2画面(トップ/ブログ)しか無いので、ルーターは自前の最小実装。
// pathname を state に持ち、内部リンクは pushState で切り替える。
const RouterContext = createContext({ path: '/', navigate: () => {} })

export function normalizePath(p) {
  const s = (p || '/').replace(/\/+$/, '')
  return s === '' ? '/' : s
}

export function RouterProvider({ initialPath, children }) {
  const [path, setPath] = useState(normalizePath(initialPath))

  // 2回目以降のパス変更(SPA遷移)だけ page_view を送る。初回表示は GTM/Pixel の初期化側が数える
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    track('page_view', { path })
  }, [path])

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (to) => {
    const url = new URL(to, window.location.href)
    window.history.pushState(null, '', url)
    setPath(normalizePath(url.pathname))
    // ハッシュ付き(例: /#contact)なら描画後にその位置へ、それ以外は先頭へ
    requestAnimationFrame(() => {
      const target = url.hash && document.querySelector(url.hash)
      if (target) target.scrollIntoView({ behavior: 'instant' })  // 別ページから来た時は滑らかに流さず即その位置へ
      else window.scrollTo(0, 0)
    })
  }

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export function useRoute() {
  return useContext(RouterContext)
}

// 内部リンク。別ページへの遷移だけ横取りし、同一ページ内のハッシュ移動や外部リンクはブラウザに任せる
export function Link({ href, onClick, children, ...rest }) {
  const { path, navigate } = useRoute()
  const handleClick = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!href.startsWith('/')) return
    const targetPath = normalizePath(href.split('#')[0].split('?')[0])
    if (targetPath === path) return
    e.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={handleClick} {...rest}>{children}</a>
}

// SPA内遷移時にタブのタイトルだけ追従させる（metaはビルド時の静的HTMLが担当）
export function useTitle(title) {
  useEffect(() => { if (title) document.title = title }, [title])
}
