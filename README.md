# hauoli-site（hauoil.com）

Hau'oli growth コーポレートサイト。React 19 + Vite、1ページ構成。Vercel が `main` を自動デプロイ。

## 構成

- `src/App.jsx` — 全セクション（Hero / What we do / Concept / Services / Situations / Strengths / About / MVV / Contact）
- `src/ContactForm.jsx` — サイト内お問い合わせフォーム
- `src/config.js` — フォーム送信先URL・流入元記録
- `src/Budou.jsx` — 日本語の改行ルール（下記）
- `src/index.css` — デザイントークンと全スタイル
- `gas/contact/` — フォームの受け口（Google Apps Script）。スプレッドシート「Hau'oli growth お問い合わせ」に紐付き

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
npm run dev      # ローカル
npm run build    # ビルド
npm run lint
```
