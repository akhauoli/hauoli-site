// サイト設定。本番URLは Vercel の環境変数で上書き可能（未設定ならここの値を使う）
export const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbyb6GMLqIIVmSfnTwBf0YaHwMOKr4yzxHZyDNVYPHmn2LOqXF8EvcsOet_qd7F9mIby/exec'

// Meta Pixel（hauoil.com 用。ビジネス Hau'oli growth 所有、2026-09-21 APIで作成）。
// ピクセルIDはページに埋め込まれる公開値なので既定値をここに置き、環境変数で差し替え可能にする。空文字で無効化
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '1768300734297039'

// 流入元・イベント計測は src/tracking.js に集約
