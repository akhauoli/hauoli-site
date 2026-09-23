// 本番ビルド: クライアント → SSR(.ssr/) → prerender
// 予約公開の判定時刻(BLOG_NOW)をここで1回だけ決めて全工程に渡す。
// クライアントと SSR は別プロセスで記事を読むので、公開時刻をまたいでビルドすると
// 「HTML はあるのに画面のデータには無い」ズレが起きる。それを防ぐため。
import { spawnSync } from 'node:child_process'

process.env.BLOG_NOW ||= new Date().toISOString()
console.log(`ブログの公開判定時刻: ${process.env.BLOG_NOW}`)

const steps = [
  ['vite', ['build']],
  ['vite', ['build', '--ssr', 'src/entry-server.jsx', '--outDir', '.ssr']],
  ['node', ['scripts/prerender.mjs']],
]
for (const [cmd, args] of steps) {
  const r = spawnSync(cmd === 'vite' ? 'npx' : cmd, cmd === 'vite' ? ['vite', ...args] : args, { stdio: 'inherit', env: process.env })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
