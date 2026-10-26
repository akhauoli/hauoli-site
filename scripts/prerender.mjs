// ビルド後にブログの各ページを静的HTMLとして書き出す。
// 手順: vite build(クライアント) → vite build --ssr(.ssr/) → このスクリプト
// 出力: dist/blog/index.html, dist/blog/<slug>/index.html, dist/cases/index.html, dist/cases/<slug>/index.html, dist/404.html,
//       dist/sitemap.xml, dist/feed.xml, dist/blog/index.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITE_URL, SITE_NAME, BLOG_TITLE, BLOG_DESCRIPTION, DEFAULT_OG_IMAGE } from './blog-content.mjs'
import { renderCover, coverInputFor } from './blog-cover.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const { render, blog, cases } = await import(pathToFileURL(join(root, '.ssr/entry-server.js')).href)
const { posts, categories, authors } = blog
const categoryById = Object.fromEntries(categories.map(c => [c.id, c]))
const authorById = Object.fromEntries(authors.map(a => [a.id, a]))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const abs = (p) => (p.startsWith('http') ? p : SITE_URL + p)

// テンプレ(index.html)のトップ用メタを外し、ページ用のメタに差し替える
function applyHead(head) {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, '')
  html = html.replace(/\s*<meta name="description"[^>]*>/, '')
  html = html.replace(/\s*<link rel="canonical"[^>]*>/, '')
  html = html.replace(/\s*<meta property="(og|article):[^>]*>/g, '')
  html = html.replace(/\s*<meta name="twitter:[^>]*>/g, '')
  html = html.replace(/\s*<!-- OG \/ Social -->|\s*<!-- Twitter Card -->|\s*<!-- JSON-LD -->/g, '')
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  const tags = [
    `<title>${esc(head.title)}</title>`,
    `<meta name="description" content="${esc(head.description)}" />`,
    `<link rel="canonical" href="${head.url}" />`,
    `<meta property="og:type" content="${head.type}" />`,
    `<meta property="og:url" content="${head.url}" />`,
    `<meta property="og:title" content="${esc(head.title)}" />`,
    `<meta property="og:description" content="${esc(head.description)}" />`,
    `<meta property="og:image" content="${head.image}" />`,
    `<meta property="og:locale" content="ja_JP" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    ...(head.article ? [
      `<meta property="article:published_time" content="${head.article.published}" />`,
      `<meta property="article:modified_time" content="${head.article.modified}" />`,
      `<meta property="article:section" content="${esc(head.article.section)}" />`,
      `<meta property="article:author" content="${esc(head.article.author)}" />`,
    ] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(head.title)}" />`,
    `<meta name="twitter:description" content="${esc(head.description)}" />`,
    `<meta name="twitter:image" content="${head.image}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(BLOG_TITLE)}" href="${SITE_URL}/feed.xml" />`,
    `<script type="application/ld+json">${JSON.stringify(head.jsonLd)}</script>`,
  ].map(t => '    ' + t).join('\n')
  return html.replace(/(<meta name="robots"[^>]*>)/, `$1\n${tags}`)
}

function writePage(relPath, html) {
  const file = join(dist, relPath)
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, html)
}

function renderPage(url, head, { status } = {}) {
  const body = render(url)
  let html = applyHead(head).replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (status === 404) html = html.replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex" />')
  return html
}

const organization = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.svg` }
const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })),
})

// ── 一覧 ──
const blogUrl = `${SITE_URL}/blog`
writePage('blog/index.html', renderPage('/blog', {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  url: blogUrl,
  type: 'website',
  image: abs(DEFAULT_OG_IMAGE),
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Blog', '@id': blogUrl, name: BLOG_TITLE, url: blogUrl, description: BLOG_DESCRIPTION, publisher: organization,
        blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: p.url, datePublished: p.date })) },
      crumbs([['Home', SITE_URL + '/'], ['Blog', blogUrl]]),
    ],
  },
}))

// ── Service Guide ──
// 商談後にURLで送る/サイト訪問者向けのサービス案内の正本。料金は「〜」表記なので最低価格として出す
const guideUrl = `${SITE_URL}/service-guide`
const GUIDE_TITLE = `Service Guide｜GROWTHパートナー・外部CMO｜${SITE_NAME}`
const GUIDE_DESCRIPTION = "Hau'oli growth の Service Guide。GROWTHパートナー（月20万円〜）と外部CMO（月50万円〜）で、経営・マーケティング・現場を横断して優先順位を決め、判断基準と仕組みを社内に残す。支援内容・代表の実績・料金・開始までの流れ。"
writePage('service-guide/index.html', renderPage('/service-guide', {
  title: GUIDE_TITLE,
  description: GUIDE_DESCRIPTION,
  url: guideUrl,
  type: 'website',
  image: abs(DEFAULT_OG_IMAGE),
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': guideUrl, url: guideUrl, name: GUIDE_TITLE, description: GUIDE_DESCRIPTION, inLanguage: 'ja', isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL } },
      {
        '@type': 'Service',
        name: 'GROWTHパートナー・外部CMO',
        serviceType: 'マーケティング戦略支援（GROWTHパートナー・外部CMO）',
        url: guideUrl,
        description: '経営・マーケティング・現場を横断して優先順位を決める責任者機能を月額で提供し、最終的に判断基準と仕組みを社内に残す支援。',
        provider: organization,
        areaServed: { '@type': 'Country', name: 'JP' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: '料金プラン',
          itemListElement: [
            { '@type': 'Offer', name: 'GROWTH診断（初期診断・戦略設計を1ヶ月で行う単発パッケージ）', priceSpecification: { '@type': 'PriceSpecification', minPrice: 300000, priceCurrency: 'JPY' } },
            { '@type': 'Offer', name: 'GROWTHパートナー（1ブランドごと）', priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: 200000, priceCurrency: 'JPY', unitText: '月' } },
            { '@type': 'Offer', name: '外部CMO', priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: 500000, priceCurrency: 'JPY', unitText: '月' } },
            { '@type': 'Offer', name: '広告運用（広告費の20%・最低10万円／月。プランとセット）', priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: 100000, priceCurrency: 'JPY', unitText: '月' } },
          ],
        },
      },
      crumbs([['Home', SITE_URL + '/'], ['Service Guide', guideUrl]]),
    ],
  },
}))

// ── 事例 ──
// 中身の正本は src/cases/data.js（画面と同じ1ファイルから title・説明・JSON-LD を作る）
const casesUrl = `${SITE_URL}/cases`
const CASES_TITLE = `事例｜${SITE_NAME}`
const CASES_DESCRIPTION = "Hau'oli growth の支援事例。外から会社の中に入り、話を聞いて「社内の当たり前」に隠れた問題を見つけ、チーム・仕組み・数字の見方として形にしたことを1社ずつ深く書いています。"
writePage('cases/index.html', renderPage('/cases', {
  title: CASES_TITLE,
  description: CASES_DESCRIPTION,
  url: casesUrl,
  type: 'website',
  image: abs(DEFAULT_OG_IMAGE),
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': casesUrl, url: casesUrl, name: CASES_TITLE, description: CASES_DESCRIPTION, inLanguage: 'ja', isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        hasPart: cases.map(c => ({ '@type': 'Article', headline: c.cardTitle, url: `${casesUrl}/${c.slug}`, datePublished: c.datePublished })) },
      crumbs([['Home', SITE_URL + '/'], ['Cases', casesUrl]]),
    ],
  },
}))
for (const c of cases) {
  const url = `${casesUrl}/${c.slug}`
  const title = `事例｜${c.industry}（${c.scale}）の${c.plan}｜${SITE_NAME}`
  writePage(`cases/${c.slug}/index.html`, renderPage(`/cases/${c.slug}`, {
    title,
    description: c.description,
    url,
    type: 'article',
    image: abs(DEFAULT_OG_IMAGE),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': url,
          mainEntityOfPage: url,
          headline: c.cardTitle,
          description: c.description,
          image: abs(DEFAULT_OG_IMAGE),
          datePublished: c.datePublished,
          dateModified: c.dateModified,
          inLanguage: 'ja',
          author: { '@type': 'Person', name: '小林顕人', jobTitle: '代表取締役 CEO', worksFor: organization },
          publisher: organization,
          about: { '@type': 'Service', name: c.plan, provider: organization, url: guideUrl },
        },
        { '@type': 'FAQPage', mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        crumbs([['Home', SITE_URL + '/'], ['Cases', casesUrl], [c.industry, url]]),
      ],
    },
  }))
}

// ── 記事 ──
let generated = 0
for (const p of posts) {
  const cat = categoryById[p.category]
  const author = authorById[p.author]
  // アイキャッチ未指定の記事は、frontmatter からブランドテンプレで生成（1200x630、一覧とOGPで共用）
  if (!p.coverCustom) {
    const png = await renderCover(coverInputFor(p, cat, author, categories))
    mkdirSync(join(dist, 'blog', p.slug), { recursive: true })
    writeFileSync(join(dist, 'blog', p.slug, 'cover.png'), png)
    generated++
  }
  const image = abs(p.cover || DEFAULT_OG_IMAGE)
  const title = `${p.metaTitle || p.title}｜${SITE_NAME}`
  writePage(`blog/${p.slug}/index.html`, renderPage(`/blog/${p.slug}`, {
    title,
    description: p.description,
    url: p.url,
    type: 'article',
    image,
    article: { published: p.date, modified: p.updated || p.date, section: cat.name, author: author.name },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': p.url,
          mainEntityOfPage: p.url,
          headline: p.title,
          description: p.description,
          image,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          articleSection: cat.name,
          inLanguage: 'ja',
          author: { '@type': 'Person', name: author.name, jobTitle: author.role, url: author.url, worksFor: { '@type': 'Organization', name: author.org } },
          publisher: organization,
        },
        crumbs([['Home', SITE_URL + '/'], ['Blog', blogUrl], [cat.name, `${blogUrl}?category=${cat.id}`], [p.title, p.url]]),
      ],
    },
  }))
}

// ── 404 ──
writePage('404.html', renderPage('/404', {
  title: `ページが見つかりません｜${SITE_NAME}`,
  description: 'お探しのページは見つかりませんでした。',
  url: SITE_URL + '/',
  type: 'website',
  image: abs(DEFAULT_OG_IMAGE),
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Not Found' },
}, { status: 404 }))

// ── sitemap / RSS / 目録 ──
const latest = posts[0] ? (posts[0].updated || posts[0].date) : null
const urls = [
  { loc: `${SITE_URL}/`, changefreq: 'monthly', priority: '1.0' },
  { loc: guideUrl, changefreq: 'monthly', priority: '0.9' },
  { loc: casesUrl, changefreq: 'monthly', priority: '0.8', lastmod: cases[0]?.dateModified },
  ...cases.map(c => ({ loc: `${casesUrl}/${c.slug}`, changefreq: 'monthly', priority: '0.8', lastmod: c.dateModified })),
  { loc: blogUrl, changefreq: 'weekly', priority: '0.8', lastmod: latest },
  ...posts.map(p => ({ loc: p.url, changefreq: 'monthly', priority: '0.7', lastmod: p.updated || p.date })),
]
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`)

const rfc822 = (d) => new Date(`${d}T09:00:00+09:00`).toUTCString()
writeFileSync(join(dist, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(BLOG_TITLE)}</title>
    <link>${blogUrl}</link>
    <description>${esc(BLOG_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${posts.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${esc(categoryById[p.category].name)}</category>
      <description>${esc(p.description)}</description>
      <content:encoded><![CDATA[${p.html}]]></content:encoded>
    </item>`).join('\n')}
  </channel>
</rss>
`)

writeFileSync(join(dist, 'blog/index.json'), JSON.stringify({
  site: SITE_URL,
  generatedAt: new Date().toISOString(),
  categories,
  authors: authors.map(({ bio: _bio, ...a }) => a),
  posts: posts.map(({ html: _html, sources: _sources, ...p }) => p),
}, null, 2))

console.log(`プリレンダー完了: Service Guide + 事例${cases.length}件 + 一覧 + 記事${posts.length}本(アイキャッチ自動生成 ${generated}本) + 404 / sitemap.xml / feed.xml / blog/index.json`)
