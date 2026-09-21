import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadBlog } from './scripts/blog-content.mjs'
import { renderCover, coverInputFor } from './scripts/blog-cover.mjs'

// budoux は index から4言語分のモデルを全部束ねてしまう(+200KB)ので、
// パーサー本体と日本語モデルだけを直接読む
const budoux = (p) => fileURLToPath(new URL(`./node_modules/budoux/module/${p}`, import.meta.url))

const CONTENT_DIR = fileURLToPath(new URL('./content/', import.meta.url))

// content/ の Markdown をビルド時に読み、`virtual:blog-data` として配る。
// dev では draft も含める（下書きの確認用）。build では draft を落とす。
function blogPlugin() {
  const id = 'virtual:blog-data'
  const resolved = '\0' + id
  let isDev = false
  return {
    name: 'hauoli-blog',
    configResolved(config) { isDev = config.command === 'serve' },
    resolveId(source) { if (source === id) return resolved },
    load(source) {
      if (source !== resolved) return
      const data = loadBlog({ includeDrafts: isDev })
      return `export default ${JSON.stringify(data)}`
    },
    configureServer(server) {
      // dev では /blog/<slug>/cover.png をその場で生成して返す（本番はビルド時に静的ファイルになる）
      server.middlewares.use(async (req, res, next) => {
        const m = req.url?.match(/^\/blog\/([a-z0-9-]+)\/cover\.png$/)
        if (!m) return next()
        try {
          const { posts, categories, authors } = loadBlog({ includeDrafts: true })
          const post = posts.find(p => p.slug === m[1])
          if (!post || post.coverCustom) return next()
          const png = await renderCover(coverInputFor(post, categories.find(c => c.id === post.category), authors.find(a => a.id === post.author), categories))
          res.setHeader('Content-Type', 'image/png')
          res.end(png)
        } catch (e) { next(e) }
      })
      server.watcher.add(CONTENT_DIR)
      server.watcher.on('all', (_e, file) => {
        if (!file.startsWith(CONTENT_DIR)) return
        const mod = server.moduleGraph.getModuleById(resolved)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), blogPlugin()],
  // SSR中間ビルド(.ssr/)には public/ の画像を複製しない
  build: { copyPublicDir: !isSsrBuild },
  resolve: {
    alias: {
      'budoux/parser': budoux('parser.js'),
      'budoux/model-ja': budoux('data/models/ja.js'),
    },
  },
}))
