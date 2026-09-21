// サイト設定。本番URLは Vercel の環境変数で上書き可能（未設定ならここの値を使う）
// Phase2 以降: 問い合わせ・計測イベントの送り先は Admin API（admin.hauoil.com）。正本は Firestore、
// 通知メールとスプレッドシートのバックアップは API が GAS へ relay する（ブラウザから GAS へは送らない）
export const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_BASE || 'https://admin.hauoil.com'
export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || `${ADMIN_API_BASE}/api/leads`
export const EVENTS_ENDPOINT = import.meta.env.VITE_EVENTS_ENDPOINT ?? `${ADMIN_API_BASE}/api/events`   // 空文字で無効化

// Meta Pixel（hauoil.com 用。ビジネス Hau'oli growth 所有、2026-09-21 APIで作成）。
// ピクセルIDはページに埋め込まれる公開値なので既定値をここに置き、環境変数で差し替え可能にする。空文字で無効化
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '1768300734297039'

// 流入元・イベント計測は src/tracking.js に集約
