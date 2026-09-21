// Hau'oli growth お問い合わせフォーム バックエンド
// hauoil.com のフォーム → doPost → シート記録 + 通知メール（小林・佐川）+ 自動返信
// 通知先・送信者名・担当者は「設定」シートで変更できる（コード変更不要）

const SHEET_NAME = 'お問い合わせ'
const CONFIG_SHEET_NAME = '設定'

// 列は右に足していく（既存の行・列は動かさない）。足した列は doPost 時に ensureHeaders() が自動で追加する
const HEADERS = [
  // ── 初期16列（2026-09-21 公開時） ──
  '受付日時', 'ID', 'ステータス', '担当', '対応日時',
  'お名前', '会社名', '会社URL', 'メール', '電話',
  '今、一番困っていること', '今後どうしていきたいか', '支援形態', 'ご予算',
  '参照元', 'UTM',
  // ── Phase1 計測列（2026-09-21 追加）。ID列 = lead_id = 広告イベントの event_id ──
  'リードステータス',            // Lead → Qualified → Meeting → Proposal → Won / Lost（Phase2のAdminで使う。今は Lead 固定）
  '着地ページ', 'フォームページ', '記事slug',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid',
  '初回接点日時', '初回着地', '初回参照元', '初回utm_source', '初回utm_medium', '初回utm_campaign',
  '最終接点日時', '最終着地', '最終参照元', '最終utm_source', '最終utm_medium', '最終utm_campaign',
  '接点JSON',                  // first/last/click_ids の生データ。後で項目を増やしても取り直し不要
]
const COL = {}
HEADERS.forEach((h, i) => { COL[h] = i + 1 })

const STATUS = { NEW: '未対応', DONE: '対応済' }
const LEAD_STATUS_INITIAL = 'Lead'
const LEAD_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// フォームから来た値 → 列名。ブラウザ側 src/tracking.js の attribution() と対
const FIELD_TO_COL = {
  landing_page: '着地ページ', form_page: 'フォームページ', blog_slug: '記事slug',
  utm_source: 'utm_source', utm_medium: 'utm_medium', utm_campaign: 'utm_campaign', utm_content: 'utm_content', utm_term: 'utm_term',
  fbclid: 'fbclid', gclid: 'gclid',
  first_ts: '初回接点日時', first_landing: '初回着地', first_referrer: '初回参照元',
  first_utm_source: '初回utm_source', first_utm_medium: '初回utm_medium', first_utm_campaign: '初回utm_campaign',
  last_ts: '最終接点日時', last_landing: '最終着地', last_referrer: '最終参照元',
  last_utm_source: '最終utm_source', last_utm_medium: '最終utm_medium', last_utm_campaign: '最終utm_campaign',
  touch_json: '接点JSON',
}

// ヘッダー行に無い列を右端に追加する（何度呼んでも安全）
function ensureHeaders(sheet) {
  const lastCol = sheet.getLastColumn()
  const existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : []
  const missing = HEADERS.filter(h => !existing.includes(h))
  if (missing.length === 0) return
  sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold')
  Logger.log('列を追加: ' + missing.join(', '))
}

// 初期設定値（以降は「設定」シートが正）
const DEFAULT_CONFIG = {
  '通知先': 'a.kobayashi@hauoil.com, s.yuna@hauoil.com',
  '送信者名': "Hau'oli growth",
  '担当者': '小林, 優奈',
}

// ── 初回セットアップ（エディタから1回実行して権限承認する） ──
function setup() {
  const ss = SpreadsheetApp.getActive()
  ss.setSpreadsheetTimeZone('Asia/Tokyo')
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0)
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold')
    sheet.setFrozenRows(1)
    sheet.setColumnWidths(COL['今、一番困っていること'], 2, 320)
    sheet.getRange(2, COL['受付日時'], 1000, 1).setNumberFormat('yyyy/MM/dd HH:mm')
    sheet.getRange(2, COL['対応日時'], 1000, 1).setNumberFormat('yyyy/MM/dd HH:mm')
  }
  let cfg = ss.getSheetByName(CONFIG_SHEET_NAME)
  if (!cfg) {
    cfg = ss.insertSheet(CONFIG_SHEET_NAME)
    cfg.getRange(1, 1, 1, 2).setValues([['項目', '値']]).setFontWeight('bold')
    const rows = Object.keys(DEFAULT_CONFIG).map(k => [k, DEFAULT_CONFIG[k]])
    cfg.getRange(2, 1, rows.length, 2).setValues(rows)
    cfg.setColumnWidth(2, 360)
  }
  const def = ss.getSheetByName('シート1')
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def)
  // MailApp の権限承認をここで確定させる
  Logger.log('セットアップ完了。メール残り送信可能数: ' + MailApp.getRemainingDailyQuota())
}

function getConfig(key) {
  const cfg = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_NAME)
  if (cfg) {
    const rows = cfg.getRange(2, 1, Math.max(cfg.getLastRow() - 1, 1), 2).getValues()
    const hit = rows.find(r => String(r[0]).trim() === key)
    if (hit && String(hit[1]).trim()) return String(hit[1]).trim()
  }
  return DEFAULT_CONFIG[key] || ''
}

// ── フォーム受信 ──
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    // ハニーポット: bot は成功を返して静かに捨てる
    if (data.website) return json({ ok: true })

    const err = validate(data)
    if (err) return json({ ok: false, error: err })

    // 伝票番号。ブラウザが発行した lead_id（UUID）をそのまま使う。無ければ従来どおり自前で作る
    const id = LEAD_ID_RE.test(String(data.lead_id || '')) ? String(data.lead_id).toLowerCase() : Utilities.getUuid().replace(/-/g, '').slice(0, 10)
    const now = new Date()
    // dry_run: 書き込み・通知をせず、シートに入る予定の行を返す（疎通テスト用。本番フォームは送らない）
    if (data.dry_run) return json({ ok: true, id, dry_run: true, headers: HEADERS, row: buildRow(id, now, data) })

    // 同一メールからの連投は60秒抑止
    const cache = CacheService.getScriptCache()
    const key = 'contact:' + data.email.toLowerCase()
    if (cache.get(key)) return json({ ok: false, error: '短時間に複数回送信されています。少し時間をおいてお試しください。' })
    cache.put(key, '1', 60)
    appendRow(id, now, data)
    notifyTeam(id, now, data)
    autoReply(data)
    Logger.log('問い合わせ受付: ' + id + ' ' + data.company + ' / ' + data.name)
    return json({ ok: true, id })
  } catch (err) {
    Logger.log('doPost エラー: ' + err)
    return json({ ok: false, error: 'server' })
  }
}

function validate(d) {
  const req = { name: 'お名前', company: '会社名', email: 'メールアドレス', problem: '今、一番困っていること', support: '支援形態', budget: 'ご予算' }
  for (const k in req) {
    if (!d[k] || !String(d[k]).trim()) return req[k] + 'を入力してください。'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email))) return 'メールアドレスの形式が正しくありません。'
  return null
}

function appendRow(id, now, d) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
  ensureHeaders(sheet)
  sheet.appendRow(buildRow(id, now, d))
}

function buildRow(id, now, d) {
  const row = new Array(HEADERS.length).fill('')
  row[COL['受付日時'] - 1] = now
  row[COL['ID'] - 1] = id
  row[COL['ステータス'] - 1] = STATUS.NEW
  row[COL['お名前'] - 1] = d.name
  row[COL['会社名'] - 1] = d.company
  row[COL['会社URL'] - 1] = d.url || ''
  row[COL['メール'] - 1] = d.email
  row[COL['電話'] - 1] = d.phone || ''
  row[COL['今、一番困っていること'] - 1] = d.problem
  row[COL['今後どうしていきたいか'] - 1] = d.goal || ''
  row[COL['支援形態'] - 1] = d.support
  row[COL['ご予算'] - 1] = d.budget
  row[COL['参照元'] - 1] = d.referrer || ''
  row[COL['UTM'] - 1] = utmSummary(d)
  row[COL['リードステータス'] - 1] = LEAD_STATUS_INITIAL
  for (const k in FIELD_TO_COL) row[COL[FIELD_TO_COL[k]] - 1] = d[k] != null ? String(d[k]) : ''
  return row
}

// 人が読む用の1行（旧UTM列の互換）。構造化した値は個別の列に入っている
function utmSummary(d) {
  if (d.utm) return String(d.utm)
  return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].filter(k => d[k]).map(k => k + '=' + d[k]).join('&')
}

function summaryText(d) {
  return [
    'お名前: ' + d.name,
    '会社名: ' + d.company,
    '会社URL: ' + (d.url || '—'),
    'メール: ' + d.email,
    '電話: ' + (d.phone || '—'),
    '支援形態: ' + d.support,
    'ご予算: ' + d.budget,
    '',
    '■ 今、一番困っていること',
    d.problem,
    '',
    '■ 今後どうしていきたいか',
    d.goal || '（未記入）',
  ].join('\n')
}

function notifyTeam(id, now, d) {
  const base = ScriptApp.getService().getUrl()
  const doneLinks = getConfig('担当者').split(',').map(s => s.trim()).filter(Boolean)
    .map(who => '・' + who + 'が対応済みにする: ' + base + '?action=done&id=' + id + '&by=' + encodeURIComponent(who))
  const body = [
    'hauoil.com にお問い合わせが届きました。',
    '',
    summaryText(d),
    '',
    '────────',
    '受付: ' + Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'),
    '参照元: ' + (d.referrer || '—') + (utmSummary(d) ? ' / ' + utmSummary(d) : ''),
    '着地: ' + (d.landing_page || '—') + (d.blog_slug ? ' / 読んだ記事: ' + d.blog_slug : ''),
    'ID: ' + id,
    '',
    '対応したら押す（シートの「ステータス」が対応済になる）:',
    ...doneLinks,
    '',
    '一覧: ' + SpreadsheetApp.getActive().getUrl(),
    '',
    'このメールに返信すると、問い合わせ者本人（' + d.email + '）宛になります。',
  ].join('\n')
  MailApp.sendEmail({
    to: getConfig('通知先'),
    replyTo: d.email,
    name: getConfig('送信者名') + ' サイト',
    subject: '【お問い合わせ】' + d.company + ' ' + d.name + ' 様（' + d.budget + '）',
    body,
  })
}

function autoReply(d) {
  const body = [
    d.name + ' 様',
    '',
    "Hau'oli growth です。お問い合わせをお送りいただき、ありがとうございます。",
    '内容を確認のうえ、担当よりご連絡いたします。',
    '',
    '── お送りいただいた内容 ──',
    summaryText(d),
    '',
    '────────',
    "Hau'oli growth",
    'https://hauoil.com',
  ].join('\n')
  MailApp.sendEmail({
    to: d.email,
    replyTo: getConfig('通知先'), // 自動返信への返事も通知先と同じ人に届く
    name: getConfig('送信者名'),
    subject: "【Hau'oli growth】お問い合わせを受け付けました",
    body,
  })
}

// ── 対応済みリンク / 疎通確認 ──
function doGet(e) {
  const p = (e && e.parameter) || {}
  if (p.action === 'ping') return json({ ok: true, ts: new Date().toISOString() })
  // 列の追加だけ先に済ませる（何度呼んでも安全。データは触らない）
  if (p.action === 'migrate') {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
    ensureHeaders(sheet)
    return json({ ok: true, columns: sheet.getLastColumn() })
  }
  if (p.action === 'done' && p.id) {
    const r = markDone(p.id, p.by || '')
    if (r.result === 'done') return html('対応済みにしました（担当: ' + r.by + '）')
    if (r.result === 'already') return html('この問い合わせは既に ' + r.by + ' が ' + r.at + ' に対応済みです。上書きしていません。')
    return html('該当する問い合わせが見つかりませんでした（ID: ' + p.id + '）')
  }
  return html("Hau'oli growth contact endpoint")
}

// 先に押した人が担当。後から押しても上書きしない（同時押しはロックで防ぐ）
function markDone(id, by) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
    const last = sheet.getLastRow()
    if (last < 2) return { result: 'notfound' }
    const ids = sheet.getRange(2, COL['ID'], last - 1, 1).getValues().map(r => String(r[0]))
    const idx = ids.indexOf(id)
    if (idx < 0) return { result: 'notfound' }
    const rowNum = idx + 2
    const cur = sheet.getRange(rowNum, COL['ステータス'], 1, 3).getValues()[0] // ステータス, 担当, 対応日時
    if (cur[0] === STATUS.DONE) {
      const at = cur[2] instanceof Date ? Utilities.formatDate(cur[2], 'Asia/Tokyo', 'M/d HH:mm') : String(cur[2])
      Logger.log('既に対応済み: ' + id + ' by ' + cur[1])
      return { result: 'already', by: cur[1] || '—', at }
    }
    sheet.getRange(rowNum, COL['ステータス'], 1, 3).setValues([[STATUS.DONE, by, new Date()]])
    Logger.log('対応済みに更新: ' + id + ' by ' + by)
    return { result: 'done', by: by || '—' }
  } finally {
    lock.releaseLock()
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
function html(text) {
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:32px;font-size:16px">' +
    text.replace(/</g, '&lt;') + '</body>'
  )
}
