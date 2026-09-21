# ブログ記事の書き方（人間・AI共通）

hauoil.com/blog の正本はこのディレクトリ。CMSは無い。ファイルを置いて `git push` すれば Vercel が自動で公開する。

## ファイル

| パス | 役割 |
|---|---|
| `blog/<slug>.md` | 記事1本。ファイル名がそのままURL（`/blog/<slug>`）。半角英数とハイフンのみ |
| `blog/_TEMPLATE.md` | 雛形。`npm run new-post <slug>` でコピーされる（`_` 始まりは記事として読まれない） |
| `categories.json` | カテゴリ一覧（id / name / label(英語表記、生成カバーに出る) / description）。追加・改名はここだけ |
| `authors.json` | 著者一覧（id / name / role / org / bio / image / url） |
| `../public/blog/<slug>/` | その記事の画像置き場。Markdownからは `/blog/<slug>/xxx.jpg` で参照。**`cover.png` という名前は自動生成が使うので避ける** |

## frontmatter

| キー | 必須 | 意味 |
|---|---|---|
| `title` | ✔ | 記事タイトル（H1、OGP、一覧） |
| `description` | ✔ | 要約120字前後。meta description / OGP / 一覧の概要に共通 |
| `date` | ✔ | 公開日 `YYYY-MM-DD` |
| `category` | ✔ | `categories.json` の id。存在しないidはビルドが落ちる |
| `author` | ✔ | `authors.json` の id。同上 |
| `updated` | | 更新日。記事ページとsitemapの lastmod に反映 |
| `cover`（または `image`） | | **独自アイキャッチを使う時だけ**。無ければビルド時にブランドテンプレから自動生成される（下記） |
| `related` | | 関連記事のslug配列。無ければ同カテゴリの最新3本を自動で出す |
| `metaTitle` | | `<title>` を別にしたい時だけ |
| `slug` | | ファイル名と違うURLにしたい時だけ |
| `draft` | | `true` の間は `npm run dev` でだけ見える（一覧・sitemap・本番ビルドには出ない） |

## アイキャッチ（2段階）

**通常記事: 何もしなくていい。** ビルド時に frontmatter（title / category / author）からブランドテンプレで 1200×630 の PNG を生成し、`/blog/<slug>/cover.png` として一覧のアイキャッチと OGP 画像の両方に使う。AI画像APIは使わないので費用ゼロ、公開後の生成もゼロ（静的ファイル）。

テンプレはカテゴリごとに4種（`categories.json` の `template`: A 黒+右上の光 / B 白 / C 黒+ゴールドの枠 / D 黒+中央寄せ）。全てトップページの黒・白・ゴールドの範囲内。デザインの変更は `scripts/blog-cover.mjs`。

**力を入れたい記事だけ**: 別で作った画像を `public/blog/<slug>/` に置き、frontmatter に `cover: /blog/<slug>/xxx.jpg` と書く。自動生成より優先され、記事冒頭にも表示される（1200×630 推奨）。

dev サーバーでも `/blog/<slug>/cover.png` はその場で生成されるので、公開前に見た目を確認できる。

## 本文で使えるもの

H2/H3、太字、引用、箇条書き、番号付きリスト、リンク（外部リンクは自動で別タブ）、画像、表、コード。
見出しには自動でidが付く（ページ内リンク可）。H1は使わない（タイトルがH1）。

## 公開までの流れ

```
npm run new-post my-first-post   # 雛形を作る（draft: true の状態）
# 本文を書く
npm run dev                      # http://localhost:5173/blog/my-first-post で確認
# frontmatter の draft を外す
npm run build                    # 静的HTML・sitemap・RSS・blog/index.json を生成、エラーが出たら直す
git add content public && git commit && git push   # Vercel が自動デプロイ
```

## AIから更新する時の約束

- 記事本文はここ以外に書かない（コンポーネントに直書き禁止）
- 新規記事は必ず `draft: true` で作る。公開判断は人間がする
- 既存記事の修正は `updated` を今日の日付にする
- 事実・数値は出典のあるものだけ。無いものは書かない
- アイキャッチは作らない（自動生成に任せる）。特別な画像は人間が判断して `cover` で指定する
- 生成物の目録は公開後 `https://hauoil.com/blog/index.json`（全記事のメタ情報）と `https://hauoil.com/feed.xml`（RSS）で読める
