import { useEffect, useState } from 'react'
import blog from 'virtual:blog-data'
import Budou from '../Budou'
import { Link, useTitle } from '../router'
import { rememberPost, track } from '../tracking'
import './blog.css'

const { posts, categories, authors } = blog
const categoryById = Object.fromEntries(categories.map(c => [c.id, c]))
const authorById = Object.fromEntries(authors.map(a => [a.id, a]))
const postBySlug = Object.fromEntries(posts.map(p => [p.slug, p]))

const BLOG_TITLE = "Blog｜Hau'oli growth"

// 2026-09-21 → 2026.09.21
const fmtDate = (d) => d.replaceAll('-', '.')

// アイキャッチ。frontmatter で指定が無ければビルド時に自動生成された /blog/<slug>/cover.png
function Cover({ post, className = '' }) {
  return <img className={`blog-cover ${className}`.trim()} src={post.cover} alt="" width="1200" height="630" loading="lazy" decoding="async" />
}

function AuthorLine({ author, compact }) {
  if (!author) return null
  return (
    <span className={`blog-author${compact ? ' blog-author--compact' : ''}`}>
      {author.image && <img className="blog-author-img" src={author.image} alt="" width="28" height="28" loading="lazy" />}
      <span className="blog-author-name">{author.name}</span>
      {!compact && <span className="blog-author-role">{[author.org, author.role].filter(Boolean).join(' ')}</span>}
    </span>
  )
}

function PostCard({ post }) {
  const cat = categoryById[post.category]
  const author = authorById[post.author]
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-card-link">
        <Cover post={post} />
        <div className="blog-card-body">
          <p className="blog-card-meta">
            <span className="blog-cat">{cat?.name}</span>
            <time dateTime={post.date}>{fmtDate(post.date)}</time>
          </p>
          <Budou as="h2" className="blog-card-title">{post.title}</Budou>
          <p className="blog-card-desc">{post.description}</p>
          <AuthorLine author={author} compact />
        </div>
      </Link>
    </article>
  )
}

// ── 一覧 ──────────────────────────────────────────────────────
export function BlogList() {
  useTitle(BLOG_TITLE)
  // ?category=xxx はハイドレーション後に読む（静的HTMLは全件表示で固定）
  const [active, setActive] = useState(null)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('category')
    if (c && categoryById[c]) setActive(c)
  }, [])

  const select = (id) => {
    setActive(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('category', id); else url.searchParams.delete('category')
    window.history.replaceState(null, '', url)
  }

  const usedCategories = categories.filter(c => posts.some(p => p.category === c.id))
  const shown = active ? posts.filter(p => p.category === active) : posts

  return (
    <>
      <section className="blog-head">
        <div className="section-inner">
          <nav className="blog-crumbs" aria-label="パンくず">
            <Link href="/">Home</Link><span>/</span><span aria-current="page">Blog</span>
          </nav>
          <p className="section-label">Blog</p>
          <Budou as="h1" className="blog-head-title">仕事で、何を見ているか。</Budou>
          <Budou as="p" className="blog-head-lead">
            Instagramで話したことを、もう一段深く。マーケティング、経営・組織、AI・仕組み、仕事の考え方を、読んだ人が自分の仕事に持ち帰れる形で残していきます。
          </Budou>
        </div>
      </section>

      <section className="section blog-list">
        <div className="section-inner">
          <div className="blog-filter" role="group" aria-label="カテゴリー">
            <button type="button" className={`blog-chip${active ? '' : ' active'}`} onClick={() => select(null)}>すべて</button>
            {usedCategories.map(c => (
              <button key={c.id} type="button" className={`blog-chip${active === c.id ? ' active' : ''}`} onClick={() => select(c.id)}>{c.name}</button>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="blog-empty">このカテゴリーの記事はまだありません。</p>
          ) : (
            <div className="blog-grid">
              {shown.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

// ── 記事 ──────────────────────────────────────────────────────
export function BlogPost({ slug }) {
  const post = postBySlug[slug]
  useTitle(post ? `${post.metaTitle || post.title}｜Hau'oli growth` : null)

  // 記事閲覧を計測し、どの記事を読んで問い合わせに来たかを覚えておく
  useEffect(() => {
    if (!post) return
    rememberPost(post.slug)
    track('article_view', { slug: post.slug, category: post.category, title: post.title })
  }, [post])

  if (!post) return <NotFound />
  const cat = categoryById[post.category]
  const author = authorById[post.author]
  const related = post.related.map(s => postBySlug[s]).filter(Boolean)

  return (
    <article className="blog-post">
      <header className="blog-head blog-post-head">
        <div className="blog-post-inner">
          <nav className="blog-crumbs" aria-label="パンくず">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/blog">Blog</Link><span>/</span>
            <Link href={`/blog?category=${post.category}`} aria-current="page">{cat?.name}</Link>
          </nav>
          <Budou as="h1" className="blog-post-title">{post.title}</Budou>
          <p className="blog-post-meta">
            <span className="blog-cat">{cat?.name}</span>
            <time dateTime={post.date}>{fmtDate(post.date)}</time>
            {post.updated && <span className="blog-updated">更新 <time dateTime={post.updated}>{fmtDate(post.updated)}</time></span>}
          </p>
          <AuthorLine author={author} />
        </div>
      </header>

      <div className="blog-post-main">
        <div className="blog-post-inner">
          {post.coverCustom && <img className="blog-post-cover" src={post.cover} alt="" decoding="async" />}
          <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.html }} />

          {author && (
            <aside className="blog-author-box">
              {author.image && <img src={author.image} alt="" width="64" height="64" loading="lazy" />}
              <div>
                <p className="blog-author-box-name">{author.name}<span>{[author.org, author.role].filter(Boolean).join(' ')}</span></p>
                {author.bio && <p className="blog-author-box-bio">{author.bio}</p>}
              </div>
            </aside>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section blog-related">
          <div className="section-inner">
            <p className="section-label">Related</p>
            <Budou as="h2" className="blog-related-title">あわせて読む</Budou>
            <div className="blog-grid">
              {related.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section blog-cta">
        <div className="section-inner">
          <Budou as="h2" className="blog-cta-title">読んでいて、自社の状況が浮かんだなら。</Budou>
          <Budou as="p" className="blog-cta-text">
            何が問題か、まだ整理できていなくても大丈夫です。現在地を整理するところから、一緒に考えます。
          </Budou>
          <Link href="/#contact" className="situations-cta" onClick={() => track('cta_click', { location: 'blog_post', slug: post.slug })}>相談してみる <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </article>
  )
}

export function NotFound() {
  useTitle("ページが見つかりません｜Hau'oli growth")
  return (
    <section className="blog-head blog-notfound">
      <div className="section-inner">
        <p className="section-label">404</p>
        <Budou as="h1" className="blog-head-title">ページが見つかりません。</Budou>
        <p className="blog-head-lead">
          <Link href="/blog">ブログ一覧へ</Link> ／ <Link href="/">トップへ</Link>
        </p>
      </div>
    </section>
  )
}
