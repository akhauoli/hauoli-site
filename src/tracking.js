// 計測の一本化: 接点(first/last touch)の保持、イベント発火(dataLayer + Meta Pixel)、lead_id の発行。
// Admin(Phase2)・広告CV高度化(Phase3)は、ここで取っているデータをそのまま使う前提。
//
// イベント名（Phase1 で定義した5つ）:
//   page_view / article_view / cta_click / form_start / form_submit
// Meta Pixel への対応:
//   page_view→PageView, article_view→ViewContent, cta_click→CTAClick(custom),
//   form_start→FormStart(custom), form_submit→Lead（eventID = lead_id。将来サーバー送信と重複計上しないため）
import { META_PIXEL_ID, EVENTS_ENDPOINT } from './config'

const FIRST_KEY = 'hg_first_touch'   // localStorage: 初めてサイトに来た時の接点。以後上書きしない
const LAST_KEY = 'hg_last_touch'     // sessionStorage: この訪問の接点。広告クリックで来直したら更新
const LAST_POST_KEY = 'hg_last_post' // sessionStorage: 最後に読んだ記事の slug
const SESSION_KEY = 'hg_sid'         // sessionStorage: この訪問のID。Admin で「訪問→CTA→送信」を同じ人として数える
const TEST_KEY = 'hg_test'           // sessionStorage: ?hg_test=1 で来た訪問はテスト（Admin の通常集計から除外）

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const CLICK_ID_RE = /^(fbclid|gclid|gbraid|wbraid|ttclid|msclkid|yclid|li_fat_id)$/

const store = {
  get(kind, key) { try { return JSON.parse((kind === 'local' ? localStorage : sessionStorage).getItem(key) || 'null') } catch { return null } },
  set(kind, key, v) { try { (kind === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(v)) } catch { /* プライベートモード等 */ } },
}

// 今のURLから接点情報を組む
function currentTouch() {
  const params = new URLSearchParams(window.location.search)
  const touch = { ts: new Date().toISOString(), landing: window.location.pathname, referrer: document.referrer || '' }
  for (const k of UTM_KEYS) if (params.get(k)) touch[k] = params.get(k)
  for (const [k, v] of params.entries()) if (CLICK_ID_RE.test(k) && v) touch[k] = v
  return touch
}
const hasCampaign = (t) => UTM_KEYS.some(k => t[k]) || Object.keys(t).some(k => CLICK_ID_RE.test(k))

// この訪問のセッションID（タブを閉じるまで同じ）
export function sessionId() {
  let sid = store.get('session', SESSION_KEY)
  if (!sid) { sid = newLeadId(); store.set('session', SESSION_KEY, sid) }
  return sid
}
// ?hg_test=1 で来た訪問はテスト。URL も見るのは、記事ページの effect が App の rememberTouch より先に走るため
export const isTestVisit = () => store.get('session', TEST_KEY) === true || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('hg_test') === '1')

// サイト到着時に1回呼ぶ。first は無ければ書く、last は無い or 広告クリック付きなら書く
export function rememberTouch() {
  const t = currentTouch()
  if (new URLSearchParams(window.location.search).get('hg_test') === '1') store.set('session', TEST_KEY, true)
  sessionId()
  if (!store.get('local', FIRST_KEY)) store.set('local', FIRST_KEY, t)
  const last = store.get('session', LAST_KEY)
  if (!last || hasCampaign(t)) store.set('session', LAST_KEY, t)
}

export function rememberPost(slug) { store.set('session', LAST_POST_KEY, slug) }

// フォーム送信に添える接点情報（GAS がそのまま列に展開する）
export function attribution() {
  const first = store.get('local', FIRST_KEY) || {}
  const last = store.get('session', LAST_KEY) || {}
  const pick = (t, prefix) => Object.fromEntries(
    ['ts', 'landing', 'referrer', ...UTM_KEYS].map(k => [`${prefix}_${k}`, t[k] || '']),
  )
  const clickIds = Object.fromEntries(Object.entries(last).filter(([k]) => CLICK_ID_RE.test(k)))
  return {
    landing_page: last.landing || '',
    form_page: window.location.pathname + window.location.hash,
    referrer: last.referrer || '',
    ...Object.fromEntries(UTM_KEYS.map(k => [k, last[k] || ''])),
    fbclid: last.fbclid || '',
    gclid: last.gclid || last.gbraid || last.wbraid || '',
    blog_slug: store.get('session', LAST_POST_KEY) || '',
    ...pick(first, 'first'),
    ...pick(last, 'last'),
    touch_json: JSON.stringify({ first, last, click_ids: clickIds }),
    session_id: sessionId(),
    test: isTestVisit(),
  }
}

// 伝票番号。ブラウザ側で先に作り、GAS の ID 列・Pixel の eventID・将来の CAPI で同じ値を使う
export function newLeadId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// ── Meta Pixel ──
let pixelReady = false
export function initPixel() {
  if (pixelReady || !META_PIXEL_ID || typeof window === 'undefined') return
  pixelReady = true
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
}
// 子コンポーネントの effect（記事閲覧など）は App の effect より先に走るので、未初期化なら先に初期化してから送る
const fbq = (...args) => { initPixel(); if (window.fbq) window.fbq(...args) }

// ── イベント ──
// dataLayer(GTM→GA4) と Meta Pixel の両方に流す。GTM 側は event 名でトリガーを作れる
// 自社 API（Admin の Dashboard 用）。sendBeacon + text/plain なので画面遷移を止めず、プリフライトも出ない
function beacon(event, params) {
  if (!EVENTS_ENDPOINT) return
  try {
    const last = store.get('session', LAST_KEY) || {}
    const body = JSON.stringify({
      event, session_id: sessionId(), test: isTestVisit(),
      path: window.location.pathname, title: document.title,
      landing: last.landing || '', referrer: last.referrer || '',
      utm_source: last.utm_source || '', utm_medium: last.utm_medium || '', utm_campaign: last.utm_campaign || '', utm_content: last.utm_content || '',
      blog_slug: store.get('session', LAST_POST_KEY) || '',
      slug: params.slug || '', category: params.category || '', location: params.location || '', lead_id: params.lead_id || '',
    })
    if (navigator.sendBeacon && navigator.sendBeacon(EVENTS_ENDPOINT, new Blob([body], { type: 'text/plain' }))) return
    fetch(EVENTS_ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => {})
  } catch { /* 計測は本体を止めない */ }
}

export function track(event, params = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
  beacon(event, params)

  switch (event) {
    case 'page_view':
      fbq('track', 'PageView'); break
    case 'article_view':
      fbq('track', 'ViewContent', { content_ids: [params.slug], content_type: 'article', content_category: params.category, content_name: params.title }); break
    case 'cta_click':
      fbq('trackCustom', 'CTAClick', { location: params.location }); break
    case 'form_start':
      fbq('trackCustom', 'FormStart', { form_page: params.form_page }); break
    case 'form_submit':
      // 広告のCV。eventID を付けておくと、将来サーバーから同じ Lead を送っても1件に統合される
      fbq('track', 'Lead', { content_name: params.blog_slug || 'site', content_category: params.support, value: 0, currency: 'JPY' }, { eventID: params.lead_id })
      // 旧イベント名（GTM 側の既存トリガー用）。GTM を form_submit に切り替えたら消す
      window.dataLayer.push({ event: 'contact_submit', support: params.support, budget: params.budget, lead_id: params.lead_id })
      break
    default:
  }
}
