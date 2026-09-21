// Hau'oli growth お問い合わせフォーム バックエンド
// hauoil.com のフォーム → doPost → シート記録 + 通知メール（小林・佐川）+ 自動返信
// 通知先・返信先は「設定」シートで変更できる（コード変更不要）

const SHEET_NAME = 'お問い合わせ'
const CONFIG_SHEET_NAME = '設定'

const HEADERS = [
  '受付日時', 'ID', 'ステータス', '担当', '対応日時',
  'お名前', '会社名', '会社URL', 'メール', '電話',
  '今、一番困っていること', '今後どうしていきたいか', '支援形態', 'ご予算',
  '参照元', 'UTM',
]
const COL = {}
HEADERS.forEach((h, i) => { COL[h] = i + 1 })

const STATUS = { NEW: '未対応', DONE: '対応済' }

// 初期設定値（以降は「設定」シートが正）
const DEFAULT_CONFIG = {
  '通知先': 'a.kobayashi@hauoil.com, s.yuna@hauoil.com',
  '返信先': 'a.kobayashi@hauoil.com',
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

    // 同一メールからの連投は60秒抑止
    const cache = CacheService.getScriptCache()
    const key = 'contact:' + data.email.toLowerCase()
    if (cache.get(key)) return json({ ok: false, error: '短時間に複数回送信されています。少し時間をおいてお試しください。' })
    cache.put(key, '1', 60)

    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 10)
    const now = new Date()
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
  row[COL['UTM'] - 1] = d.utm || ''
  sheet.appendRow(row)
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
    '参照元: ' + (d.referrer || '—') + (d.utm ? ' / ' + d.utm : ''),
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
    replyTo: getConfig('返信先'),
    name: getConfig('送信者名'),
    subject: "【Hau'oli growth】お問い合わせを受け付けました",
    body,
  })
}

// ── 対応済みリンク / 疎通確認 ──
function doGet(e) {
  const p = (e && e.parameter) || {}
  if (p.action === 'ping') return json({ ok: true, ts: new Date().toISOString() })
  if (p.action === 'done' && p.id) {
    const done = markDone(p.id, p.by || '')
    return html(done
      ? '対応済みにしました（ID: ' + p.id + ' / 担当: ' + (p.by || '—') + '）'
      : '該当する問い合わせが見つかりませんでした（ID: ' + p.id + '）')
  }
  return html("Hau'oli growth contact endpoint")
}

function markDone(id, by) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
  const last = sheet.getLastRow()
  if (last < 2) return false
  const ids = sheet.getRange(2, COL['ID'], last - 1, 1).getValues().map(r => String(r[0]))
  const idx = ids.indexOf(id)
  if (idx < 0) return false
  const rowNum = idx + 2
  sheet.getRange(rowNum, COL['ステータス']).setValue(STATUS.DONE)
  sheet.getRange(rowNum, COL['担当']).setValue(by)
  sheet.getRange(rowNum, COL['対応日時']).setValue(new Date())
  Logger.log('対応済みに更新: ' + id + ' by ' + by)
  return true
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
