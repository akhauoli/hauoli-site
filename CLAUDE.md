# hauoli-site（hauoil.com）— 作業ルール

> このリポジトリの決めごとは本ファイルと台帳（下の「決めたこと（台帳）」節）が正本。どの経路で起動した Claude もここに従う。

## 何のためか
株式会社Hau'oli growth のコーポレートサイト（トップ1ページ＋ブログ /blog）。問い合わせ・広告計測・ブログ→SNS配信の入口。構成は README、ブログ原稿は `content/`。

## 技術と本番
- React 19 + Vite。本番は Vercel（GitHub `main` を自動デプロイ、`hauoil.com` が no-www のプライマリ）。GTM-NVGMHHWZ
- 問い合わせの正本は Firestore（`~/code/hauoli-admin`、admin.hauoil.com）。ここの `gas/contact/` は通知メールとシートバックアップの中継だけ
- ブログ記事の正本は `content/blog/*.md`。書き方の正本は `content/BLOG_WRITING_GUIDE.md`、技術仕様は `content/README.md`（二重管理しない）

## 決めたこと（台帳）

書式 `- [YYYY-MM-DD] 決めたこと（理由）(出典)`。食い違ったら古い行を取り消し線にして残す。

- [2026-09-21] ブログの役割分担: 小林＝発信源＋最終判断＋「OK」のみ／ちびあっきー(ChatGPT)＝編集長・ライター（本文を完成状態まで）／Claude Code＝制作・技術・公開。Claude は思想・主張・Voice を独自判断で書き換えない（直したい所は理由を示して確認）。流れは 原稿→draft:true→チェックリスト確認→OK→公開(出典: project_hauoli_site)
- [2026-09-21] contact@hauoil.com グループは作らない。通知は個人アドレス直送（自分がメンバーのグループ宛に自分が送ると Gmail 受信箱に出ない罠があるため）。受信者管理は Admin 側(出典: project_hauoli_site)
- [2026-09-21] 見出し・リード文は BudouX（`src/Budou.jsx`）で文節単位に改行する。Hero の見出しは句読点なしで統一(出典: project_hauoli_site)
- [2026-09-21] やらないこと: note連携 / Reel→記事の自動生成 / 自動公開 / 大量SEO記事（SNS自動投稿は 9/23 に別基盤 Content Distribution として開始）(出典: project_hauoli_site)
- [2026-09-22] 問い合わせのシートバックアップは GAS の自動追記のまま恒久運用。Admin に CSV エクスポートは作らない（人が押す前提のバックアップは忘れたら空になる）。Phase3（CAPI・AI自動化）はやらない(出典: project_hauoli_site)
- [2026-09-23] 実績表記はサイト全体で「代表・小林顕人の累計300店舗超」に統一。「200社」「150店舗」等の旧表記は使わない。新しいページ・記事・資料でも数字はこれに揃える(出典: project_hauoli_site)
- [2026-09-24] ブログは Instagram の続きではなく「Hau'oli growth の知識と積み重ねの保管庫」。読者が考え方・書き手の人となりを知り、一緒に成長したいと思える場。Reel 由来の記事も話したままでなくリライトする(出典: project_hauoli_site)
- [2026-09-25] 会社名は「株式会社Hau'oli growth」（g 小文字）で統一。英文社名「Inc」等は使わない。所在地は大阪市北区梅田1-2-2 大阪駅前第2ビル12-12(出典: project_hauoli_site, reference_hauoli_growth)
- [2026-09-25] SNS（IG・X・Threads）に出す記事はブログの公開日が古い順。最初の本番確認も一番古い記事から。手元の下書きから適当に選ばない(出典: feedback_sns_post_order)
- [2026-09-25] アイキャッチ/OG画像は AI 画像生成ではなくビルド時の静的生成（テンプレに記事情報を流し込む。`scripts/blog-cover.mjs`）(出典: project_hauoli_site)
