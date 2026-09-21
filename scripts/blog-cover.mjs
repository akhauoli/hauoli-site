// 記事のアイキャッチ兼OG画像(1200x630)を frontmatter から生成する。
// satori(HTML風の木 → SVG) + resvg(SVG → PNG)。ブラウザもAI画像APIも使わない。
// ビルド時に1回だけ作って静的ファイルにするので、公開後のコストはゼロ。
// フォントは scripts/fonts/ に同梱（Vercelのビルド環境に日本語フォントは無い）。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { loadDefaultJapaneseParser } from 'budoux'

export const COVER_WIDTH = 1200
export const COVER_HEIGHT = 630

const font = (name) => readFileSync(fileURLToPath(new URL(`./fonts/${name}`, import.meta.url)))
const FONTS = [
  { name: 'Noto Sans JP', data: font('NotoSansJP-Bold.otf'), weight: 700, style: 'normal' },
  { name: 'Inter', data: font('Inter-Medium.woff'), weight: 500, style: 'normal' },
  { name: 'Cormorant Garamond', data: font('CormorantGaramond-SemiBoldItalic.woff'), weight: 600, style: 'italic' },
]
const budoux = loadDefaultJapaneseParser()

// サイトのデザイントークン（src/index.css と同じ値）
const DARK = { bg: 'linear-gradient(160deg, #242119 0%, #131211 70%)', text: '#EDE7DA', dim: '#8A8070', mark: 'rgba(255,255,255,0.04)', line: 'rgba(255,255,255,0.10)' }
const LIGHT = { bg: 'linear-gradient(160deg, #F8F5EF 0%, #EDE9E0 100%)', text: '#1A1916', dim: '#55514A', mark: 'rgba(0,0,0,0.045)', line: 'rgba(0,0,0,0.10)' }
const ACCENT = '#C98A3A'
const glow = (a) => `radial-gradient(circle at center, rgba(201,138,58,${a}) 0%, rgba(201,138,58,${a / 2}) 30%, rgba(201,138,58,0) 65%)`

// ブランド内のレイアウト4種。カテゴリごとに使い分けて一覧が単調にならないようにする。
// どれもトップページの黒・白・ゴールドの範囲内。
export const TEMPLATES = {
  A: { palette: DARK,  glow: { top: -280, right: -220 }, align: 'left',   watermark: 'ELEVATE' },              // 黒 + 右上の光
  B: { palette: LIGHT, glow: null,                       align: 'left',   watermark: 'ELEVATE', rule: true },  // 白（温かみのある紙色）
  C: { palette: DARK,  glow: { bottom: -320, left: -260 }, align: 'left', frame: true },                       // 黒 + 細いゴールドの枠
  D: { palette: DARK,  glow: { top: -120, left: 150 },   align: 'center', quote: true },                       // 黒 + 中央寄せ（考え方・言葉向け）
}
const TEMPLATE_KEYS = Object.keys(TEMPLATES)

// タイトルの長さで文字サイズを決める（3行以内に収まる目安）
function titleSize(title) {
  const n = [...title].length
  if (n <= 16) return 72
  if (n <= 24) return 64
  if (n <= 34) return 56
  return 48
}

const h = (type, style, children) => ({ type, props: { style, children } })

export function coverTree({ title, categoryLabel, categoryName, authorName, authorNote, template = 'A' }) {
  const t = TEMPLATES[template] || TEMPLATES.A
  const P = t.palette
  const center = t.align === 'center'
  const size = titleSize(title)
  // 文節ごとに1つの箱にして、文節の途中では折り返さない（サイト本体の BudouX ルールと同じ）
  const phrases = budoux.parse(title).map(p => h('div', { display: 'flex' }, p))
  const pad = t.frame ? 112 : 88

  return h('div', {
    width: COVER_WIDTH, height: COVER_HEIGHT, display: 'flex', flexDirection: 'column',
    position: 'relative', color: P.text, fontFamily: 'Noto Sans JP', background: P.bg,
  }, [
    t.glow && h('div', { position: 'absolute', width: 900, height: 900, display: 'flex', background: glow(0.26), ...t.glow }),
    t.watermark && h('div', {
      position: 'absolute', right: -24, bottom: -78, display: 'flex',
      fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 280, fontWeight: 600, color: P.mark, letterSpacing: 4,
    }, t.watermark),
    t.quote && h('div', {
      position: 'absolute', left: 70, top: 130, display: 'flex',
      fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 420, lineHeight: 1, color: P.mark,
    }, '“'),
    t.frame && h('div', { position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, display: 'flex', border: `1px solid rgba(201,138,58,0.45)` }),

    // 上段: ラベル（カテゴリ英語 + 日本語）
    h('div', { display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start', padding: `${t.frame ? 84 : 76}px ${pad}px 0` }, [
      h('div', { width: 48, height: 2, background: ACCENT, display: 'flex' }),
      h('div', { display: 'flex', alignItems: 'center', marginTop: 22, gap: 18 }, [
        h('div', { display: 'flex', fontFamily: 'Inter', fontSize: 20, letterSpacing: 5, color: ACCENT }, categoryLabel.toUpperCase()),
        h('div', { display: 'flex', fontSize: 20, color: P.dim }, categoryName),
      ]),
    ]),

    // 中段: タイトル
    h('div', { display: 'flex', flex: 1, alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', padding: `0 ${pad}px` }, [
      h('div', {
        display: 'flex', flexWrap: 'wrap', justifyContent: center ? 'center' : 'flex-start', maxWidth: center ? 940 : 1000,
        fontSize: size, fontWeight: 700, lineHeight: 1.35, color: P.text, textAlign: center ? 'center' : 'left',
      }, phrases),
    ]),

    // 下段: 著者とロゴ
    h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: `0 ${pad}px ${t.frame ? 72 : 64}px`, borderTop: t.rule ? `1px solid ${P.line}` : 'none', marginLeft: t.rule ? pad : 0, marginRight: t.rule ? pad : 0, paddingLeft: t.rule ? 0 : pad, paddingRight: t.rule ? 0 : pad, paddingTop: t.rule ? 28 : 0 }, [
      h('div', { display: 'flex', flexDirection: 'column', gap: 6 }, [
        h('div', { display: 'flex', fontSize: 24, color: P.text }, authorName),
        h('div', { display: 'flex', fontSize: 18, color: P.dim }, authorNote),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }, [
        h('div', { display: 'flex', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 44, fontWeight: 600, color: P.text }, "Hau'oli growth"),
        h('div', { display: 'flex', fontFamily: 'Inter', fontSize: 16, letterSpacing: 3, color: P.dim }, 'hauoil.com'),
      ]),
    ]),
  ].filter(Boolean))
}

export async function renderCover(input) {
  const svg = await satori(coverTree(input), { width: COVER_WIDTH, height: COVER_HEIGHT, fonts: FONTS })
  return new Resvg(svg, { fitTo: { mode: 'width', value: COVER_WIDTH } }).render().asPng()
}

// カテゴリ → テンプレ。categories.json の template を優先、無ければ並び順で A〜D を回す
export function templateFor(category, categories) {
  if (category.template && TEMPLATES[category.template]) return category.template
  const i = Math.max(0, categories.findIndex(c => c.id === category.id))
  return TEMPLATE_KEYS[i % TEMPLATE_KEYS.length]
}

// 記事オブジェクト(loadBlog の posts 要素)＋カテゴリ・著者から入力を組む
export function coverInputFor(post, category, author, categories) {
  return {
    title: post.title,
    categoryLabel: category.label || category.name,
    categoryName: category.name,
    authorName: author.name,
    authorNote: [author.org, author.role].filter(Boolean).join(' '),
    template: templateFor(category, categories),
  }
}
