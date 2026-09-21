import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// budoux は index から4言語分のモデルを全部束ねてしまう(+200KB)ので、
// パーサー本体と日本語モデルだけを直接読む
const budoux = (p) => fileURLToPath(new URL(`./node_modules/budoux/module/${p}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'budoux/parser': budoux('parser.js'),
      'budoux/model-ja': budoux('data/models/ja.js'),
    },
  },
})
