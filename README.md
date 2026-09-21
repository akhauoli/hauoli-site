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
- `gas/contact/` — 通知メール＋シートバックアップの relay（Google Apps Script）。Admin API からのみ呼ばれる。スプレッドシート「Hau'oli growth お問い合わせ」に紐付き

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

## 計測（Phase1: 2026-09-21）

計測は `src/tracking.js` に集約。dataLayer(GTM→GA4) と Meta Pixel（hauoil.com 用 `1768300734297039`、ビジネス Hau'oli growth 所有、`src/config.js` の `META_PIXEL_ID`）の両方に同じイベントを流す。GTM 内に Pixel は入れない（コードで一元管理）。

### イベント（5種）

| event | いつ | 主なパラメータ | Meta Pixel |
|---|---|---|---|
| `page_view` | SPA 内のページ遷移時（初回表示は GTM / Pixel 初期化が数える） | path | PageView |
| `article_view` | 記事ページ表示 | slug, category, title | ViewContent |
| `cta_click` | 相談ボタン等 | location: hero / situations / nav / mobile_nav / footer / blog_post | CTAClick（カスタム） |
| `form_start` | フォームに最初の入力 | form_page, lead_id | FormStart（カスタム） |
| `form_submit` | フォーム送信成功 ＝ **広告のCV（Lead）** | lead_id, support, budget, blog_slug, utm_source | Lead（`eventID = lead_id`） |

`form_submit` と同時に旧イベント `contact_submit` も push している（GTM の既存トリガー用）。GTM 側を `form_submit` に切り替えたら `tracking.js` から消す。

### 接点（first / last touch）

- `hg_first_touch`（localStorage）: 初めてサイトに来た時の ts / landing / referrer / utm_* / fbclid・gclid 等。以後上書きしない
- `hg_last_touch`（sessionStorage）: この訪問の接点。utm や click id 付きで来直したら更新
- `hg_last_post`（sessionStorage）: 最後に読んだ記事の slug

### lead_id（伝票番号）

フォームに最初の入力があった時点でブラウザが UUID を発行。送信ペイロード（`lead_id` / `event_id`）→ シートの `ID` 列 → Pixel の Lead `eventID` で同じ値。Phase3 でサーバー（CAPI）から同じ Lead を送っても Meta 側で1件に統合される。

### シートに入る列（GAS `HEADERS`、右に追加した Phase1 列）

`リードステータス`（Lead → Qualified → Meeting → Proposal → Won / Lost。今は Lead 固定）/ `着地ページ` `フォームページ` `記事slug` / `utm_source〜utm_term` / `fbclid` `gclid` / `初回接点日時・着地・参照元・utm_source/medium/campaign` / `最終接点日時・…` / `接点JSON`（生データ）。
列は `ensureHeaders()` が送信時に自動追加する。手で先に足すなら `GET <WebApp>?action=migrate`。`dry_run: true` を付けて POST すると書き込み・通知なしで入る予定の行が返る。

## お問い合わせの流れ（Phase2: 2026-09-22〜）

```
フォーム送信 → POST https://admin.hauoil.com/api/leads（hauoli-admin / Cloud Run）
                → Firestore leads/{lead_id} に保存（★正本。Phase1 の全項目を1対1で保持）
                → GAS relay → 通知メール（Admin の Settings「通知先」宛。初期値: 小林・佐川）
                             → 問い合わせ者へ自動返信
                             → スプレッドシート「お問い合わせ」に1行（バックアップ。読む用途のみ）
通知メール内のリンク → admin.hauoil.com の Lead ページ（ステータス・担当・メモ）
計測イベント5種 → 同時に POST /api/events（sendBeacon）→ Firestore events → Admin の Dashboard
```

- Admin（管理画面）: https://admin.hauoil.com — リポジトリ `akhauoli/hauoli-admin`、GCP `hauoli-growth`。Google ログイン＋メンバー照合（Owner / Admin）
- 通知先・担当者は Admin の Settings で変更（設定シートは旧経路用に残っているだけ）
- テスト: サイトに `?hg_test=1` を付けて入ると、その訪問の計測・問い合わせは `test:true`（Dashboard 集計から除外。通知メールには【テスト】が付く）
- 送り先は `src/config.js` の `ADMIN_API_BASE`（env `VITE_ADMIN_API_BASE` で差し替え可。`VITE_EVENTS_ENDPOINT=` 空で計測送信オフ）
- GAS はブラウザから直接叩かれない（`?action=direct_post&secret=…&disabled=1` で停止済み）。relay の認可は Script Properties `RELAY_SECRET`

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
