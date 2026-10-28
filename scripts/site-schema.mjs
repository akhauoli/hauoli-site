// 構造化データ(JSON-LD)の会社・代表の定義。トップ・ブログ・事例・Service Guide・プライバシーポリシーで共通に使う。
// ここだけ直せば全ページに反映される（ページごとに書き分けない）。
//
// sameAs に入れるのは「実在を確かめた公式アカウント」だけ（2026-10-28 確認）:
//   会社: Facebook ページ「Hau'oli growth - Elevate その熱を、高みへ」(page_id 1419753384545435。Graph API の link と公開ページの og:title で確認)
//   代表: Instagram @___a.kobayashi___（Graph API で username と website=hauoil.com/blog を確認）
//         Threads @___a.kobayashi___（公開ページの og:title「Akihito Kobayashi」で確認）
//         X @Akki_HighLow（公開ページの title「小林顕人 (@Akki_HighLow)」で確認）
// 新しいアカウントを足す時も、実在を確かめてから足す（推測で URL を作らない）。
import { SITE_URL, SITE_NAME } from './blog-content.mjs'

export const ORG_ID = `${SITE_URL}/#organization`
export const PERSON_ID = `${SITE_URL}/#akihito`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  legalName: "株式会社Hau'oli growth",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: 'マーケティング戦略・ブランディング・仕組み構築を通じて、事業成長を支援するコンサルティング。',
  address: {
    '@type': 'PostalAddress',
    postalCode: '530-0001',
    addressRegion: '大阪府',
    addressLocality: '大阪市北区',
    streetAddress: '梅田1-2-2 大阪駅前第2ビル12-12',
    addressCountry: 'JP',
  },
  founder: { '@id': PERSON_ID },
  contactPoint: { '@type': 'ContactPoint', contactType: 'お問い合わせ', url: `${SITE_URL}/#contact`, availableLanguage: 'ja' },
  sameAs: [
    'https://www.facebook.com/1419753384545435',
  ],
}

export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: '小林 顕人',
  alternateName: ['小林顕人', 'Akihito Kobayashi'],
  jobTitle: '代表取締役 CEO',
  worksFor: { '@id': ORG_ID, '@type': 'Organization', name: SITE_NAME },
  url: `${SITE_URL}/#about`,
  image: `${SITE_URL}/akihito.png`,
  description: '元海上自衛官（護衛艦勤務）を経て、マーケティングの世界へ。累計300店舗超の事業成長を支援。',
  sameAs: [
    'https://www.instagram.com/___a.kobayashi___/',
    'https://www.threads.com/@___a.kobayashi___',
    'https://x.com/Akki_HighLow',
  ],
}

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'ja',
  publisher: { '@id': ORG_ID },
}

// ブログ著者（content/authors.json の1人）を Person にする。代表なら上の PERSON（sameAs 付き）を使う
export function personFor(author) {
  if (author?.id === 'akihito') return PERSON
  return { '@type': 'Person', name: author.name, jobTitle: author.role, url: author.url, worksFor: { '@type': 'Organization', name: author.org } }
}

// ビルドした時刻を JST の ISO 形式（例 2026-10-28T15:04:05+09:00）で返す。トップの dateModified に使う
export function jstIso(date = new Date()) {
  return new Date(date.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 19) + '+09:00'
}
