// 記事ファイルを作る（必ず draft: true で置く。公開判断は人間がする）
//
//   npm run new-post <slug>                 雛形(_TEMPLATE.md)から空の原稿を作る
//   npm run new-post -- --json <file.json>  構造化データから完成原稿を作る（ちびあっきー / Claude Code Bridge 用）
//   cat article.json | npm run new-post -- --json
//
// JSONの形（body 以外は frontmatter になる。未知のキーは無視）:
//   { "title", "description", "slug", "category", "author", "date", "body",
//     "custom_cover" | "cover", "related": [], "source_notes" | "sources": [] , "updated", "metaTitle" }
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadBlog } from './blog-content.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function fail(msg) { console.error(msg); process.exit(1) }

// YAMLに安全に書く（「:」や引用符を含む日本語もそのまま通す）
const yamlStr = (v) => JSON.stringify(String(v))

function frontmatter(fm) {
  const lines = ['---']
  for (const [k, v] of Object.entries(fm)) {
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue
    if (Array.isArray(v)) { lines.push(`${k}:`); for (const x of v) lines.push(`  - ${yamlStr(x)}`) }
    else if (typeof v === 'boolean' || /^\d{4}-\d{2}-\d{2}$/.test(String(v))) lines.push(`${k}: ${v}`)
    else lines.push(`${k}: ${yamlStr(v)}`)
  }
  lines.push('---')
  return lines.join('\n')
}

function writePost(slug, content) {
  const dest = `${root}content/blog/${slug}.md`
  if (existsSync(dest)) fail(`${dest} は既にある`)
  writeFileSync(dest, content)
  // 置いた直後に読み直して検証（category/author の id 違い、必須欠け等）。落ちたら消して原因を返す
  try { loadBlog({ includeDrafts: true }) } catch (e) { unlinkSync(dest); fail(`検証エラー: ${e.message}`) }
  mkdirSync(`${root}public/blog/${slug}`, { recursive: true })
  console.log(`作成: content/blog/${slug}.md（draft: true）\n画像置き場: public/blog/${slug}/\n確認: npm run dev → http://localhost:5173/blog/${slug}`)
}

if (args[0] === '--json') {
  const src = args[1] ? readFileSync(args[1], 'utf8') : readFileSync(0, 'utf8')
  let d
  try { d = JSON.parse(src) } catch { fail('JSONとして読めない') }
  const slug = d.slug
  if (!slug || !SLUG_RE.test(slug)) fail(`slug「${slug}」は半角英小文字・数字・ハイフンのみ`)
  if (!d.body || !String(d.body).trim()) fail('body が空')
  if (/^#\s/m.test(d.body)) fail('body に H1(# ) がある。記事タイトルが H1 なので本文は ## から')
  const fm = {
    title: d.title,
    description: d.description || d.excerpt,
    date: d.date || new Date().toISOString().slice(0, 10),
    updated: d.updated,
    category: d.category,
    author: d.author || 'akihito',
    cover: d.custom_cover || d.cover,
    related: d.related,
    metaTitle: d.metaTitle,
    sources: d.sources || d.source_notes,
    draft: true, // 構造化データから来た原稿も必ず下書き。公開は人間の「OK」の後
  }
  writePost(slug, `${frontmatter(fm)}\n\n${String(d.body).trim()}\n`)
} else {
  const slug = args[0]
  if (!slug || !SLUG_RE.test(slug)) fail('使い方: npm run new-post <slug>   または   npm run new-post -- --json <file.json>')
  const today = new Date().toISOString().slice(0, 10)
  const body = readFileSync(`${root}content/blog/_TEMPLATE.md`, 'utf8')
    .replace('date: 2026-01-01', `date: ${today}`)
    .replaceAll('<slug>', slug)
  writePost(slug, body)
}
