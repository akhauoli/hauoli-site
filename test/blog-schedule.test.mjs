// 予約公開（publishAt）のテスト
//   1) 日時の解釈（タイムゾーン省略 = 日本時間）
//   2) 一時ディレクトリにサイトを複製し、テスト用記事を足して「本番ビルド」「Preview ビルド」を実際に走らせ、
//      一覧 / 記事ページ / sitemap / RSS / blog/index.json / JS バンドル で公開判定が一致するかを見る
// 実行: npm test（ビルドを2回走らせるので1分ほどかかる）
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, cpSync, symlinkSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parsePublishAt, toJstIso } from '../scripts/blog-content.mjs'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
// 本番ビルドの時刻: 2026-09-25 08:30 JST
const NOW_ISO = '2026-09-25T08:30:00+09:00'
const NOW = Date.parse(NOW_ISO)

test('publishAt: タイムゾーン省略は日本時間、明示はその通り、日付だけは 0:00 JST', () => {
  assert.equal(parsePublishAt('2026-09-25T08:00:00+09:00'), Date.parse('2026-09-24T23:00:00Z'))
  assert.equal(parsePublishAt('2026-09-25 08:00'), Date.parse('2026-09-24T23:00:00Z'))
  assert.equal(parsePublishAt('"2026-09-25T08:00"'), Date.parse('2026-09-24T23:00:00Z'))
  assert.equal(parsePublishAt('2026-09-24T23:00:00Z'), Date.parse('2026-09-24T23:00:00Z'))
  assert.equal(parsePublishAt('2026-09-25T08:00:00+0900'), Date.parse('2026-09-24T23:00:00Z'))
  assert.equal(parsePublishAt('2026-09-25'), Date.parse('2026-09-24T15:00:00Z'))
  assert.equal(parsePublishAt(''), null)
  assert.equal(parsePublishAt(null), null)
  for (const bad of ['明日', '2026-02-30 08:00', '2026-09-25 25:00', '9/25 8:00', '2026-09-25T08:00:00+09:00 extra']) {
    assert.ok(Number.isNaN(parsePublishAt(bad)), bad)
  }
  assert.equal(toJstIso(Date.parse('2026-09-24T23:00:00Z')), '2026-09-25T08:00:00+09:00')
})

// ── ビルドして確かめる ──
const FIXTURES = {
  // 公開時刻を過ぎた予約記事（date は過去日付のまま＝毎日投稿に見せる運用）→ 出る
  'zz-sched-past': { publishAt: '2026-09-25T08:00:00+09:00', date: '2026-09-14' },
  // タイムゾーン省略。日本時間なら過去（UTC と誤読すると未来になる）→ 出る
  'zz-sched-notz-past': { publishAt: '2026-09-25 08:00', date: '2026-09-25' },
  // まだ公開時刻前 → 出ない
  'zz-sched-future': { publishAt: '2026-09-26T08:00:00+09:00', date: '2026-09-26' },
  'zz-sched-notz-future': { publishAt: '"2026-09-25 09:00"', date: '2026-09-25' },
  // 下書き → 出ない（publishAt が過去でも draft が優先）
  'zz-draft': { draft: true, date: '2026-09-20' },
  'zz-draft-sched-past': { draft: true, publishAt: '2026-09-24T08:00:00+09:00', date: '2026-09-24' },
}
const EXPECT_PUBLIC = ['zz-sched-past', 'zz-sched-notz-past']
const EXPECT_HIDDEN = ['zz-sched-future', 'zz-sched-notz-future', 'zz-draft', 'zz-draft-sched-past']

function fixtureMd(slug, f) {
  return [
    '---',
    `title: "テスト記事 ${slug}"`,
    `description: "予約公開テスト用 ${slug}"`,
    `date: ${f.date}`,
    ...(f.publishAt ? [`publishAt: ${f.publishAt}`] : []),
    'category: perspective',
    'author: akihito',
    `draft: ${f.draft ? 'true' : 'false'}`,
    '---',
    '',
    `本文 ${slug}`,
    '',
  ].join('\n')
}

// 実際の記事のうち、テストのビルド時刻(NOW)で本番に出るべきもの（draft でなく、予約なら時刻を過ぎている）
function existingPublicSlugs() {
  const dir = join(ROOT, 'content/blog')
  return readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')).filter(f => {
    const fm = readFileSync(join(dir, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]
    const at = fm.match(/^publishAt:[ \t]*(.*?)[ \t]*$/m)
    return !/^draft:\s*true/m.test(fm) && (!at || parsePublishAt(at[1]) <= NOW)
  }).map(f => f.replace(/\.md$/, ''))
}

let work
function makeCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'hauoli-site-test-'))
  for (const p of ['src', 'scripts', 'content', 'public', 'index.html', 'vite.config.js', 'package.json']) cpSync(join(ROOT, p), join(dir, p), { recursive: true })
  symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'dir')
  for (const [slug, f] of Object.entries(FIXTURES)) writeFileSync(join(dir, 'content/blog', `${slug}.md`), fixtureMd(slug, f))
  return dir
}
function build(dir, env) {
  const r = spawnSync('node', ['scripts/build.mjs'], { cwd: dir, env: { ...process.env, VERCEL_ENV: '', ...env }, encoding: 'utf8' })
  assert.equal(r.status, 0, `ビルド失敗:\n${r.stdout}\n${r.stderr}`)
  const out = join(dir, `dist-${env.VERCEL_ENV || 'production'}`)
  cpSync(join(dir, 'dist'), out, { recursive: true })
  return out
}
function readAll(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...readAll(p))
    else if (/\.(html|xml|json|js)$/.test(name)) out.push({ path: p, text: readFileSync(p, 'utf8') })
  }
  return out
}

before(() => { work = makeCopy() })
after(() => { if (work) rmSync(work, { recursive: true, force: true }) })

test('loadBlog: 本番は公開時刻を過ぎた記事だけ、Preview は全部（予約中の印つき）', async () => {
  const { loadBlog } = await import(pathToFileURL(join(work, 'scripts/blog-content.mjs')).href)
  const prod = loadBlog({ now: NOW }).posts.map(p => p.slug)
  for (const s of [...EXPECT_PUBLIC, ...existingPublicSlugs()]) assert.ok(prod.includes(s), `本番に出るべき: ${s}`)
  for (const s of EXPECT_HIDDEN) assert.ok(!prod.includes(s), `本番に出てはいけない: ${s}`)
  const preview = loadBlog({ includeDrafts: true, now: NOW }).posts
  for (const s of [...EXPECT_PUBLIC, ...EXPECT_HIDDEN]) assert.ok(preview.some(p => p.slug === s), `Preview には出る: ${s}`)
  assert.equal(preview.find(p => p.slug === 'zz-sched-future').scheduled, true)
  assert.equal(preview.find(p => p.slug === 'zz-sched-past').scheduled, undefined)
  // 公開時刻ちょうどは公開
  assert.ok(loadBlog({ now: Date.parse('2026-09-26T08:00:00+09:00') }).posts.some(p => p.slug === 'zz-sched-future'))
  assert.ok(!loadBlog({ now: Date.parse('2026-09-26T07:59:59+09:00') }).posts.some(p => p.slug === 'zz-sched-future'))
})

test('loadBlog: publishAt が読めない記事はビルドを止める（下書きは今まで通り検証しない）', async () => {
  const bad = join(work, 'content/blog/zz-bad.md')
  writeFileSync(bad, fixtureMd('zz-bad', { publishAt: '9/27 8:00', date: '2026-09-27' }))
  try {
    const { loadBlog } = await import(pathToFileURL(join(work, 'scripts/blog-content.mjs')).href + '?bad')
    assert.throws(() => loadBlog({ now: NOW }), /zz-bad\.md: publishAt「9\/27 8:00」は日時として読めない/)
    writeFileSync(bad, fixtureMd('zz-bad', { publishAt: '9/27 8:00', date: '2026-09-27', draft: true }))
    assert.doesNotThrow(() => loadBlog({ now: NOW }))
  } finally { rmSync(bad) }
})

test('本番ビルド: 一覧・記事ページ・sitemap・RSS・index.json・JS で公開判定が一致', { timeout: 300_000 }, () => {
  const dist = build(work, { BLOG_NOW: NOW_ISO })
  const index = JSON.parse(readFileSync(join(dist, 'blog/index.json'), 'utf8'))
  const indexSlugs = index.posts.map(p => p.slug)
  const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  const feed = readFileSync(join(dist, 'feed.xml'), 'utf8')
  const list = readFileSync(join(dist, 'blog/index.html'), 'utf8')
  const inSitemap = [...sitemap.matchAll(/<loc>https:\/\/hauoil\.com\/blog\/([a-z0-9-]+)<\/loc>/g)].map(m => m[1])
  const inFeed = [...feed.matchAll(/<link>https:\/\/hauoil\.com\/blog\/([a-z0-9-]+)<\/link>/g)].map(m => m[1])
  const inList = [...new Set([...list.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map(m => m[1]))]
  const pages = readdirSync(join(dist, 'blog')).filter(n => existsSync(join(dist, 'blog', n, 'index.html')))

  const expected = [...EXPECT_PUBLIC, ...existingPublicSlugs()].sort()
  assert.deepEqual([...indexSlugs].sort(), expected, 'index.json')
  assert.deepEqual([...inSitemap].sort(), expected, 'sitemap.xml')
  assert.deepEqual([...inFeed].sort(), expected, 'feed.xml')
  assert.deepEqual([...inList].sort(), expected, '一覧')
  assert.deepEqual([...pages].sort(), expected, '記事ページ')

  // 公開前の記事は dist のどこにも（JS バンドル・アイキャッチ含め）痕跡を残さない
  const files = readAll(dist)
  for (const s of EXPECT_HIDDEN) {
    assert.ok(!existsSync(join(dist, 'blog', s)), `${s} のディレクトリが無い`)
    const leak = files.find(f => f.text.includes(s))
    assert.ok(!leak, `${s} が ${leak?.path} に出ている`)
  }
  // 予約記事は publishAt を持つ。date は記事の日付のまま（並び順・表示は date）
  const past = index.posts.find(p => p.slug === 'zz-sched-past')
  assert.equal(past.publishAt, '2026-09-25T08:00:00+09:00')
  assert.equal(past.date, '2026-09-14')
  assert.equal(past.scheduled, undefined)
  // 既存記事には publishAt / scheduled が増えない（index.json の形は今まで通り）
  for (const p of index.posts.filter(p => !p.slug.startsWith('zz-'))) { assert.ok(!('scheduled' in p)) }
})

test('Preview ビルド: 下書きも予約中の記事も確認できる', { timeout: 300_000 }, () => {
  const dist = build(work, { BLOG_NOW: NOW_ISO, VERCEL_ENV: 'preview' })
  const index = JSON.parse(readFileSync(join(dist, 'blog/index.json'), 'utf8'))
  for (const s of [...EXPECT_PUBLIC, ...EXPECT_HIDDEN]) {
    assert.ok(index.posts.some(p => p.slug === s), `index.json: ${s}`)
    assert.ok(existsSync(join(dist, 'blog', s, 'index.html')), `記事ページ: ${s}`)
  }
  const page = readFileSync(join(dist, 'blog/zz-sched-future/index.html'), 'utf8')
  assert.match(page, /公開予約 9\/26 08:00/)
  assert.match(readFileSync(join(dist, 'blog/zz-draft/index.html'), 'utf8'), /下書き/)
})
