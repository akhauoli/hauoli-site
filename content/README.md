# ブログ記事の技術仕様（置き場・frontmatter・公開手順）

hauoil.com/blog の正本はこのディレクトリ。CMSは無い。ファイルを置いて `git push` すれば Vercel が自動で公開する。
**何を・どう書くか（目的・Voice・NG・構造・改行/見出しルール・役割分担・フロー）は [BLOG_WRITING_GUIDE.md](BLOG_WRITING_GUIDE.md)。** ここは仕組みの話だけ。

## ファイル

| パス | 役割 |
|---|---|
| `blog/<slug>.md` | 記事1本。ファイル名がそのままURL（`/blog/<slug>`）。半角英小文字・数字・ハイフンのみ |
| `blog/_TEMPLATE.md` | 雛形。`npm run new-post <slug>` でコピーされる（`_` 始まりは記事として読まれない） |
| `categories.json` | カテゴリ一覧（id / name / label(英語表記、アイキャッチに出る) / description / template(アイキャッチのテンプレ A〜D)） |
| `authors.json` | 著者一覧（id / name / role / org / bio / image / url）。表示名はここで決まる |
| `../public/blog/<slug>/` | その記事の画像置き場。Markdownからは `/blog/<slug>/xxx.jpg` で参照。**`cover.png` という名前は自動生成が使うので避ける** |

## frontmatter

| キー | 必須 | 意味 |
|---|---|---|
| `title` | ✔ | 記事タイトル（H1、OGP、一覧、自動アイキャッチ） |
| `description` | ✔ | 要約120字前後。meta description / OGP / 一覧の概要に共通 |
| `date` | ✔ | 公開日 `YYYY-MM-DD` |
| `category` | ✔ | `categories.json` の id。存在しないidはビルドが落ちる |
| `author` | ✔ | `authors.json` の id。同上 |
| `updated` | | 更新日。記事ページとsitemapの lastmod に反映 |
| `cover`（または `image`） | | 独自アイキャッチを使う時だけ（1200×630推奨）。無ければ自動生成 |
| `related` | | 関連記事のslug配列。無ければ同カテゴリの最新3本を自動で出す |
| `sources` | | 出典メモの配列。表示されない。`blog/index.json` にも出ない |
| `metaTitle` | | `<title>` を別にしたい時だけ |
| `slug` | | ファイル名と違うURLにしたい時だけ |
| `draft` | | `true` の間は dev と Vercel Preview でだけ見える。本番ビルド・sitemap・RSS には出ない |

## Markdown の変換仕様

- GFM（表・取り消し線・自動リンク）
- **1行改行は `<br>` になる**（`breaks: true`。ブログ本文のレンダラーだけの設定）
- 見出しには自動でidが付く（ページ内リンク可）
- 外部リンクは自動で `target="_blank" rel="noopener"`
- 画像は `<figure>` で包まれ、`![alt](src "title")` の title が図のキャプションになる。遅延読み込み
- HTML化は `scripts/blog-content.mjs`（Vite plugin と prerender が共用）

## 記事の追加

```bash
npm run new-post <slug>                   # 雛形から空の原稿（draft: true）
npm run new-post -- --json article.json   # 構造化データから完成原稿（draft: true）。ちびあっきー / Bridge 用
cat article.json | npm run new-post -- --json
```

`--json` の形（`body` 以外は frontmatter になる。未知のキーは無視。`custom_cover`→`cover`、`source_notes`→`sources`、`excerpt`→`description` の別名も受ける）:

```json
{ "title": "...", "description": "...", "slug": "my-post", "category": "marketing", "author": "akihito",
  "date": "2026-01-01", "body": "## 見出し\n\n本文…", "source_notes": ["brain-hub ent_…"], "custom_cover": null }
```

置いた直後に検証が走り、category/author の id 違い・必須欠け・本文に H1 があれば作らずにエラーを返す。

## 確認と公開

```bash
npm run dev        # http://localhost:5173/blog/<slug>  draft も見える。/blog/<slug>/cover.png もその場で生成
npm run build      # 静的HTML・アイキャッチ・sitemap・RSS・blog/index.json を dist/ に生成。draft は除外
npm run preview    # dist/ を http://localhost:4173 で確認
```

- **Vercel Preview**: main 以外のブランチを push すると Preview URL が出る。Preview では draft も表示される（Vercel が noindex を付ける）。スマホでの確認に使う
- **公開**: frontmatter の `draft: true` を外す → `git push origin main` → Vercel が自動デプロイ → `https://hauoil.com/blog/<slug>` と `/sitemap.xml` `/feed.xml` を確認

## アイキャッチの仕組み

`scripts/blog-cover.mjs`（satori + resvg、ブラウザ・AI API 不使用）。frontmatter の title / category / author を `categories.json` の `template` が指すブランドテンプレに流し込み、ビルド時に `dist/blog/<slug>/cover.png`（1200×630）を1回だけ生成。一覧と OGP で共用。`cover` 指定があれば生成せずそれを使う。
デザインの変更は `scripts/blog-cover.mjs` のみ。フォントは `scripts/fonts/` に同梱。

## 公開後に機械が読める場所

- `https://hauoil.com/blog/index.json` — 全記事のメタ情報（カテゴリ・著者含む）
- `https://hauoil.com/feed.xml` — RSS（本文HTML込み）
- `https://hauoil.com/sitemap.xml`
