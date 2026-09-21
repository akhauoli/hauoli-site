// サイト設定。本番URLは Vercel の環境変数で上書き可能（未設定ならここの値を使う）
export const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbyb6GMLqIIVmSfnTwBf0YaHwMOKr4yzxHZyDNVYPHmn2LOqXF8EvcsOet_qd7F9mIby/exec'

// 流入元の記録キー（Instagram等からの導線計測用）
export const SOURCE_STORAGE_KEY = 'hg_source'

// 初回訪問時の流入元（referrer / utm）を保存しておき、送信時に添える
export function rememberSource() {
  try {
    if (sessionStorage.getItem(SOURCE_STORAGE_KEY)) return
    const params = new URLSearchParams(window.location.search)
    const utm = [...params.entries()].filter(([k]) => k.startsWith('utm_')).map(([k, v]) => `${k}=${v}`).join('&')
    // landing: 最初に開いたページ（ブログ記事から入った場合にどの記事かが分かる）
    sessionStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify({ referrer: document.referrer || '', utm, landing: window.location.pathname }))
  } catch { /* プライベートモード等では無視 */ }
}
