// content/ を読んで記事データを組み立てる（Vite plugin と prerender の共通ロジック）
// ここでMarkdown→HTMLまで済ませるので、ブラウザ側にMarkdownパーサーは載らない
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { Marked } from 'marked'

export const SITE_URL = 'https://hauoil.com'
export const SITE_NAME = "Hau'oli growth"
export const BLOG_TITLE = `Blog｜${SITE_NAME}`
export const BLOG_DESCRIPTION = 'マーケティング、経営・組織、AI・仕組み、仕事の考え方。Hau\'oli growth が日々の仕事で何を見て、なぜそう判断するのかを蓄積していきます。'
export const DEFAULT_OG_IMAGE = '/og-default.jpg'

const CONTENT_DIR = fileURLToPath(new URL('../content/', import.meta.url))
const BLOG_DIR = join(CONTENT_DIR, 'blog')

// 見出しにidを振る（ページ内リンク・目次用）。日本語見出しもそのまま使えるように最低限の正規化だけ
function slugifyHeading(text, used) {
  let id = text.trim().toLowerCase().replace(/<[^>]+>/g, '').replace(/[\s　]+/g, '-').replace(/[^\p{L}\p{N}\-_]/gu, '')
  if (!id) id = 'section'
  let n = 1
  let out = id
  while (used.has(out)) out = `${id}-${++n}`
  used.add(out)
  return out
}

function createMarked() {
  const used = new Set()
  const marked = new Marked({
    gfm: true,
    // 1行改行をそのまま <br> にする。短い行で息をつく書き方（Reelの声）をそのまま活かすため
    breaks: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens)
        const id = slugifyHeading(text, used)
        return `<h${depth} id="${id}">${text}</h${depth}>\n`
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL)
        const attrs = [`href="${href}"`, title ? `title="${title}"` : '', external ? 'target="_blank" rel="noopener"' : ''].filter(Boolean).join(' ')
        return `<a ${attrs}>${text}</a>`
      },
      image({ href, title, text }) {
        return `<figure><img src="${href}" alt="${text || ''}" loading="lazy" decoding="async" />${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`
      },
    },
  })
  return marked
}

function readJson(name) {
  return JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8'))
}

function toDateString(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).slice(0, 10)
}

function assert(cond, msg) {
  if (!cond) throw new Error(`[blog] ${msg}`)
}

/**
 * @param {{ includeDrafts?: boolean }} opts
 */
export function loadBlog({ includeDrafts = false } = {}) {
  const categories = readJson('categories.json')
  const authors = readJson('authors.json')
  const categoryIds = new Set(categories.map(c => c.id))
  const authorIds = new Set(authors.map(a => a.id))

  const files = existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_')) : []
  const posts = []
  const seen = new Set()

  for (const file of files) {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    const slug = data.slug || basename(file, '.md')
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), `${file}: slug「${slug}」は半角英小文字・数字・ハイフンのみ`)
    assert(!seen.has(slug), `${file}: slug「${slug}」が重複`)
    seen.add(slug)
    if (data.draft && !includeDrafts) continue
    for (const k of ['title', 'description', 'date', 'category', 'author']) assert(data[k], `${file}: frontmatter「${k}」が必須`)
    assert(categoryIds.has(data.category), `${file}: category「${data.category}」は content/categories.json に無い`)
    assert(authorIds.has(data.author), `${file}: author「${data.author}」は content/authors.json に無い`)

    // 表はスマホで横スクロールできるよう包む（表自体は幅いっぱいに広げる）
    const html = createMarked().parse(content).replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
    const date = toDateString(data.date)
    const updated = data.updated ? toDateString(data.updated) : null
    posts.push({
      slug,
      title: String(data.title),
      metaTitle: data.metaTitle ? String(data.metaTitle) : null,
      description: String(data.description),
      date,
      updated: updated && updated !== date ? updated : null,
      category: data.category,
      author: data.author,
      // アイキャッチ兼OG画像。指定(cover / image)があればそれ、無ければビルド時に自動生成する固定パス
      cover: data.cover || data.image || `/blog/${slug}/cover.png`,
      coverCustom: !!(data.cover || data.image),
      related: Array.isArray(data.related) ? data.related : [],
      // 出典メモ（brain-hubのid・記録名など）。表示はしない。事実確認の証跡として残す
      sources: Array.isArray(data.sources) ? data.sources : [],
      draft: !!data.draft,
      html,
      url: `${SITE_URL}/blog/${slug}`,
    })
  }

  // 関連記事: 指定があればそのslug、無ければ同カテゴリの最新3本（自分を除く）
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  for (const p of posts) {
    for (const r of p.related) assert(seen.has(r), `${p.slug}: related「${r}」という記事は無い`)
    if (p.related.length === 0) {
      p.related = posts.filter(o => o.slug !== p.slug && o.category === p.category).slice(0, 3).map(o => o.slug)
    }
  }

  return { posts, categories, authors }
}
