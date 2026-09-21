# hauoli-site（hauoil.com）

Hau'oli growth コーポレートサイト。React 19 + Vite。トップ（1ページ）＋ブログ（`/blog`）。Vercel が `main` を自動デプロイ。

## 構成

- `src/App.jsx` — トップの全セクション（Hero / What we do / Concept / Services / Situations / Strengths / About / MVV / Contact）とページ切替（`Page`）
- `src/router.jsx` — 自前の最小ルーター（`Link` / `useRoute` / `useTitle`）。ライブラリ不使用
- `src/blog/Blog.jsx` `src/blog/blog.css` — ブログ一覧・記事・404
- `src/ContactForm.jsx` — サイト内お問い合わせフォーム
- `src/config.js` — フォーム送信先URL・流入元記録（着地ページ・読んだ記事もUTM欄に載る）
- `src/Budou.jsx` — 日本語の改行ルール（下記）
- `src/index.css` — デザイントークンと全スタイル
- `src/entry-server.jsx` — ビルド時プリレンダー用エントリ
- `content/` — **ブログ記事の正本**（Markdown）。仕組みは [content/README.md](content/README.md)、原稿の書き方は [content/BLOG_WRITING_GUIDE.md](content/BLOG_WRITING_GUIDE.md)
- `scripts/blog-content.mjs` — content/ を読んでHTML化する共通ロジック（Vite plugin と prerender が使う）
- `scripts/prerender.mjs` — ブログ各ページの静的HTML・自動アイキャッチ・sitemap.xml・feed.xml・blog/index.json を生成
- `scripts/blog-cover.mjs` — アイキャッチ/OG画像の自動生成（satori + resvg、ブランドテンプレ4種）。フォントは `scripts/fonts/` に同梱
- `scripts/new-post.mjs` — `npm run new-post <slug>` で雛形、`-- --json` で構造化データ(ちびあっきー/Bridge)から原稿を作る。どちらも draft
- `gas/contact/` — フォームの受け口（Google Apps Script）。スプレッドシート「Hau'oli growth お問い合わせ」に紐付き

## ブログの仕組み

```
content/blog/*.md ──(vite plugin: Markdown→HTML)──▶ virtual:blog-data ──▶ src/blog/Blog.jsx
                                                                          │
npm run build = vite build（クライアント）                                  │
              + vite build --ssr（.ssr/entry-server.js）                    │
              + scripts/prerender.mjs ─▶ dist/blog/index.html, dist/blog/<slug>/index.html, dist/blog/<slug>/cover.png, dist/404.html
                                        dist/sitemap.xml, dist/feed.xml, dist/blog/index.json
```

- 記事ページは静的HTMLとして出るので、OGP・JSON-LD（BlogPosting/BreadcrumbList）・本文がJSなしで読める。ブラウザでは `hydrateRoot` で引き継ぐ
- `draft: true` の記事は `npm run dev` と Vercel Preview（main以外のブランチ）で見える。本番ビルドには出ない。公開は小林の「OK」の後に draft を外して push
- カテゴリ・著者は `content/categories.json` `content/authors.json`。不正なidはビルドが落ちる
- 存在しないURLは Vercel が `dist/404.html` を返す（`vercel.json` にrewriteは無い）
- 記事のアイキャッチ/OG画像は frontmatter からビルド時に自動生成（`dist/blog/<slug>/cover.png`）。`cover` 指定があればそれを優先。トップ・一覧ページのOG画像は `public/og-default.jpg`

## 日本語の改行ルール

見出し・リード文は `<Budou as="h2">…</Budou>` で囲む。BudouX（Google製）が文節の切れ目を判定し、そこでしか折り返さない。
画面幅ごとの `<br className="sp-only">` は不要。意味の区切りで確実に改行したい場所だけ `<br />` を書く。
本文・フォームは通常の折り返しのまま。
`vite.config.js` のエイリアスでパーサーと日本語モデルだけを読み込んでいる（`budoux` を直接 import すると4言語分のモデルが全部入って +200KB になる）。

## お問い合わせの流れ

```
フォーム送信 → GAS doPost → シート「お問い合わせ」に1行追加
                          → 通知メール（設定シート「通知先」宛。初期値: 小林・佐川）
                          → 問い合わせ者へ自動返信（返信すると「通知先」に届く）
通知メール内の「対応済みにする」リンク → シートのステータスが「対応済」になる
```

通知先・送信者名・担当者はスプレッドシートの「設定」シートで変更できる（コード変更不要）。

## GAS の更新

```bash
cd gas/contact
clasp push --force   # コード反映（HEADのみ。公開版はまだ変わらない）
clasp deploy --deploymentId AKfycbyb6GMLqIIVmSfnTwBf0YaHwMOKr4yzxHZyDNVYPHmn2LOqXF8EvcsOet_qd7F9mIby --description "..."   # 公開版を更新（URLは変わらない）。push後に必ず実行
```

## 開発

```bash
npm run dev                  # ローカル（下書き記事も見える）
npm run build                # ビルド（静的HTML生成まで）
npm run preview              # dist/ を確認
npm run new-post <slug>      # 記事の雛形
npm run lint
```
