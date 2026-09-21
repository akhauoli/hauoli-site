// 雛形から記事ファイルを作る: npm run new-post <slug>
import { copyFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const slug = process.argv[2]
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('使い方: npm run new-post <slug>   （半角英小文字・数字・ハイフン）')
  process.exit(1)
}
const root = fileURLToPath(new URL('../', import.meta.url))
const dest = `${root}content/blog/${slug}.md`
if (existsSync(dest)) { console.error(`${dest} は既にある`); process.exit(1) }

const today = new Date().toISOString().slice(0, 10)
const body = readFileSync(`${root}content/blog/_TEMPLATE.md`, 'utf8')
  .replace('date: 2026-01-01', `date: ${today}`)
  .replaceAll('<slug>', slug)
writeFileSync(dest, body)
mkdirSync(`${root}public/blog/${slug}`, { recursive: true })
console.log(`作成: content/blog/${slug}.md（draft: true）\n画像置き場: public/blog/${slug}/\n確認: npm run dev → http://localhost:5173/blog/${slug}`)
