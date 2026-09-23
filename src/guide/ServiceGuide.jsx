import { useEffect } from 'react'
import Budou from '../Budou'
import ContactForm from '../ContactForm'
import { Link, hasNavigated, useTitle } from '../router'
import { track } from '../tracking'
import './guide.css'

// Service Guide（/service-guide）。商談後にURLを送る・サイト訪問者がサービスを理解するための正本。
// 元は Artifact「Hau'oli growth — 月次CMOパッケージ」(10ページ)。構成はそのまま、表現と実績の主体を修正して昇格。
// 実績数字は「代表・小林顕人の累計実績」。根拠を確認できない数字（平均継続期間・累計広告運用額）は載せない。

export const GUIDE_TITLE = "Service Guide｜月次CMO参画｜Hau'oli growth"

const SECTIONS = [
  ['problem', 'Problem'],
  ['concept', 'Concept'],
  ['stages', 'Service'],
  ['changes', 'What Changes'],
  ['record', 'Track Record'],
  ['for-whom', 'For Whom'],
  ['pricing', 'Pricing'],
  ['process', 'Process'],
  ['company', 'About'],
]

const PROBLEMS = [
  { title: '戦略が一本の軸になっていない', text: '広告・SNS・販促はそれぞれ動いていても、「なぜ今これをやるのか」を束ねる判断がない。施策同士がつながらず、成果に対して力が分散する。', tag: '経営 × マーケティング' },
  { title: '広告費の判断が止まっている', text: '広告費は毎月出ていくのに、CPAやCVRの変化を「次に何を変えるか」まで落とし込む役割がない。運用は回っていても、投資の判断がされていない。', tag: '広告' },
  { title: '検証が回らない', text: '施策を打った後に、良し悪しを判定して次に活かす場がない。結果が組織に蓄積されず、同じ判断を毎回ゼロからやり直す。', tag: '現場 × PDCA' },
  { title: '責任者を採用するハードルが高い', text: 'マーケティング責任者を正社員で採用すると年収800万円〜が目安。採用できても、事業と組織を理解して判断できるようになるまで時間がかかる。', tag: '組織・採用' },
  { title: '発信の軸が定まらない', text: 'SNSは続けているが、誰に何を伝えるかが決まっていない。フォロワーが増えても、問い合わせや来店につながらない。', tag: 'SNS・コンテンツ' },
  { title: '既存顧客の設計が後回し', text: '新規集客に追われ、リピートや紹介の設計が手つかずのまま。獲得した顧客が静かに離れていく。', tag: 'LTV' },
]

const CYCLE = ['課題発見', '構造化', '意思決定', '実行', '検証', '仕組み化']

const COMPARE = [
  ['コスト', '年収800万円〜', '月20万円〜'],
  ['立ち上がり', '採用後、事業理解と育成から', '契約後、最短1週間で着手'],
  ['知見', '個人の経験に依存', '代表の300店舗超の支援知見'],
  ['継続', '退職リスクあり', '契約ベース'],
  ['残るもの', '担当者個人に蓄積', '判断基準・仕組みとして社内に蓄積'],
]

const STAGES = [
  { id: 'IGNITE', num: '01', name: '火をつける', text: '現状診断と戦略立案。どこに課題があり、何から手をつけるべきかを数値とデータで明確にする。', items: ['市場・競合分析', 'ターゲット再定義', 'KPI設計・優先課題特定'] },
  { id: 'FORGE', num: '02', name: '鍛え上げる', text: 'ブランドと訴求を鍛え直す。強みを言語化し、全施策の精度を底上げする一貫したメッセージをつくる。', items: ['ブランドポジション確立', 'コアメッセージ・コピー開発', 'クリエイティブ戦略'] },
  { id: 'CONVERT', num: '03', name: '転換する', text: '集客から成約までの流れを設計。広告・SNS・SEOを統合した獲得戦略を、数値で管理しながら実行する。', items: ['広告運用最適化（別途）', 'SNS戦略・LPO・MEO', 'CPA・LTVの継続改善'] },
  { id: 'TRANSFORM', num: '04', name: '変革する', text: '判断基準とワークフローを社内に移し、外に頼り続けなくても回る状態をつくる。', items: ['インハウス移行支援', 'チーム構築・育成計画', 'グロース・スケール設計'] },
]

const REMAINS = ['判断基準', 'KPI', 'ワークフロー', 'マーケティングの知見', '自走できる人', '意思決定のスピード', 'AI・システム']

const BEFORE = [
  '施策ごとに判断がばらばらで、全体の優先順位が決まらない',
  'CPA・CVR・LTVの数字はあっても、次の打ち手につながらない',
  'SNSの発信軸が定まらず、ブランドの印象が揃わない',
  '施策の結果が検証されず、学びが残らない',
  '月末に、投資に対して何が返ってきたかを説明できない',
  '新規集客に追われ、リピート設計が後回しになる',
]
const AFTER = [
  '月次MTGで優先課題を決め、全施策が一本の軸に揃う',
  'KPIの意味と変化を毎月のレポートで共有し、判断に使える形になる',
  '発信軸・トーン・コンテンツ計画が決まり、ブランドが揃う',
  '週次または隔週のチェックで検証が回り、改善が積み上がる',
  '月末レポートで、投資対効果と翌月の計画が見える',
  'LTV・リピートの設計が、戦略の中心に組み込まれる',
]

const RECORDS = [
  { num: '300', unit: '+', label: '累計支援店舗数', text: '整骨院・サロン・飲食・サービス業など、代表・小林顕人がこれまで支援してきた累計店舗数。マーケティング会社のCOO・複数社のCMOとしての支援を含む' },
  { num: '多', unit: '業種', label: '支援してきた業種', text: '整骨院・美容サロン・飲食・EC・SaaS・バー・コンサルなど' },
]

const TARGETS = [
  { title: '多店舗展開を狙うオーナー', tag: '10店舗以上 / 多店舗展開中', text: '10店舗以上を経営、または10店舗超を目指すフェーズ。現場は回っているがマーケ戦略が追いついていない。広告費は使っているのに成果との因果が見えず、次の一手を議論する相手がいない。' },
  { title: 'スケールを狙う事業者', tag: 'SaaS / EC / サービス業', text: 'PMF後の成長フェーズ。広告・コンテンツ・PRの優先順位を判断する役割が社内になく、採用するにはコストと時間がかかる。' },
  { title: '施策に限界を感じている企業', tag: '年商1億〜10億円規模', text: '広告費を使っているのに結果が出ない。代理店任せで中身が見えない。マーケティングの判断を自社に取り戻し、数字を経営が直接見られるようにしたい。' },
]

const PLANS = [
  {
    key: 'starter', tier: 'STARTER', name: 'CMO診断',
    kind: '初期診断・戦略設計を1ヶ月で行う単発パッケージ',
    price: '¥30', unit: '万〜', per: '1回',
    notes: ['月額契約ではありません', '初期費用なし・1ヶ月で完結'],
    listLabel: '何が届くか',
    items: ['現状診断・課題の優先順位整理', '3〜6ヶ月の施策ロードマップ', 'KPI設計・数値目標の設定', '戦略提案MTG（2回）'],
  },
  {
    key: 'standard', tier: 'STANDARD', name: '月次CMO参画', featured: true,
    kind: '月額継続 · 最低1年',
    price: '¥20', unit: '万〜', per: '月',
    notes: ['初期費用：月額の50%（¥10万〜）', '広告運用は別途 ¥10万〜/月'],
    listLabel: '毎月届くもの',
    items: ['週次または隔週の戦略MTG', '施策実行・広告/SNSの改善', '月次KPIレポート＋翌月計画', 'Chatwork / LINE での常時サポート', 'クリエイティブ改善提案'],
  },
  {
    key: 'enterprise', tier: 'ENTERPRISE', name: 'CMO + 組織構築',
    kind: 'カスタム · 要相談',
    price: '応相談', unit: '', per: '',
    notes: ['事業規模・対応範囲に応じて設計'],
    listLabel: '何が届くか',
    items: ['全ステージ（IGNITE〜TRANSFORM）', 'インハウス移行＋採用・育成', 'グロース戦略・スケール設計', '経営会議への参加', '優先レスポンス対応'],
  },
]

const STEPS = [
  { title: '無料相談', text: '現状・課題・目標をお聞きし、合うプランをご提案します。', time: '60分 / 無料' },
  { title: '診断・提案書', text: '課題を分析し、施策ロードマップと費用感をお出しします。', time: '3〜5営業日' },
  { title: '契約締結', text: 'プラン確認・契約書締結・初期費用のお支払い。', time: '最短1日' },
  { title: 'キックオフMTG', text: '目標・KPI・月次サイクルを確定し、共有ツールを準備します。', time: '90分' },
  { title: '月次CMO稼働', text: '戦略立案・施策実行・レポートの月次サイクルを回し始めます。', time: '月次継続' },
]

const COMPANY = [
  ['社名', "株式会社Hau'oli growth"],
  ['代表取締役', '小林 顕人'],
  ['設立', '2024年6月26日'],
  ['所在地', '大阪市北区梅田1-2-2 大阪駅前第2ビル12-12'],
  ['事業内容', '月次CMO参画・マーケティング戦略支援'],
  ['Web', 'hauoil.com'],
]

function Head({ label, title, lead, tone }) {
  return (
    <div className="sg-head">
      <p className={`section-label sg-label sg-label--${tone}`}>{label}</p>
      <Budou as="h2" className="sg-title">{title}</Budou>
      {lead && <Budou as="p" className="sg-lead">{lead}</Budou>}
    </div>
  )
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Mark({ ok }) {
  return ok ? (
    <svg className="sg-mark sg-mark--ok" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg className="sg-mark" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  )
}

export default function ServiceGuide() {
  useTitle(GUIDE_TITLE)
  // 商談後にURLで直接開かれるのが主な使われ方。直接着地した閲覧は Admin にだけ送る（GTM/Pixel は初回表示を自前で数える）
  useEffect(() => {
    if (!hasNavigated()) track('page_view', { path: '/service-guide', slug: 'service-guide', beaconOnly: true })
  }, [])

  return (
    <main className="sg">
      {/* ── Cover ── */}
      <section className="sg-cover">
        <div className="sg-inner">
          <nav className="sg-crumbs" aria-label="パンくず">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Service Guide</span>
          </nav>
          <p className="section-label sg-label sg-label--dark">Hau'oli growth — Service Guide</p>
          <Budou as="h1" className="sg-cover-title">月次CMO参画で、<br /><em>事業の打ち手</em>を変える。</Budou>
          <Budou as="p" className="sg-cover-lead">採用でも、ツールでもなく。全体を見て判断するマーケティング責任者を、月額で迎え入れる。そして最後は、その判断の仕組みを社内に残す。</Budou>
          <div className="sg-cover-stat">
            <span className="sg-cover-num">300<small>+</small></span>
            <span className="sg-cover-num-label">代表・小林顕人<br />累計支援店舗数</span>
          </div>
          <ol className="sg-toc" aria-label="このページの内容">
            {SECTIONS.map(([id, name], i) => (
              <li key={id}><a href={`#${id}`}><span>{String(i + 1).padStart(2, '0')}</span>{name}</a></li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 01 Problem ── */}
      <section id="problem" className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <Head tone="warm" label="01 — The Problem"
            title="施策を動かす人はいても、全体を見て優先順位を決める機能が不足している。"
            lead="広告、SNS、現場、採用。それぞれに動いている人はいる。足りないのは、経営・マーケティング・現場・組織を横断して「今どこに力を入れるか」を決める役割です。" />
          <div className="sg-problems">
            {PROBLEMS.map(p => (
              <article key={p.title} className="sg-problem">
                <p className="sg-problem-tag">{p.tag}</p>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 Concept ── */}
      <section id="concept" className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <Head tone="dark" label="02 — Concept"
            title="判断する機能を外から入れ、社内に残す。"
            lead="必要なのは、作業の手を増やすことだけではありません。課題を見つけて構造にし、優先順位を決め、実行し、検証して、仕組みにする。このサイクルを月次で回し、最終的には判断基準と仕組みを社内に残します。" />
          <ol className="sg-cycle" aria-label="支援のサイクル">
            {CYCLE.map((c, i) => <li key={c}><span>{i + 1}</span>{c}</li>)}
          </ol>
          <div className="sg-compare" role="table" aria-label="正社員採用との比較">
            <div className="sg-compare-row sg-compare-row--head" role="row">
              <span role="columnheader">比較軸</span>
              <span role="columnheader">正社員採用</span>
              <span role="columnheader">Hau'oli growth</span>
            </div>
            {COMPARE.map(([axis, hire, us]) => (
              <div key={axis} className="sg-compare-row" role="row">
                <span role="rowheader" className="sg-compare-axis">{axis}</span>
                <span role="cell" className="sg-compare-hire"><em>正社員採用</em>{hire}</span>
                <span role="cell" className="sg-compare-us"><em>Hau'oli growth</em>{us}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 中盤CTA ── */}
      <aside className="sg-midcta">
        <div className="sg-inner sg-midcta-inner">
          <Budou as="p" className="sg-midcta-text">まだ、何が問題か整理できていなくても大丈夫です。<br />現在地を整理するところから、一緒に考えます。</Budou>
          <a href="#contact" className="sg-btn" onClick={() => track('cta_click', { location: 'service_guide_mid' })}>
            相談してみる<Arrow />
          </a>
        </div>
      </aside>

      {/* ── 03 Service / 4 Stage ── */}
      <section id="stages" className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <Head tone="warm" label="03 — Service" title={<><span className="num">4</span>つのステージで、事業の成長を設計する</>}
            lead="手段（広告・SNS・研修…）ではなく、「何を変えるか」で整理しています。" />
          <div className="sg-stages">
            {STAGES.map(s => (
              <article key={s.id} className={`sg-stage${s.id === 'TRANSFORM' ? ' sg-stage--last' : ''}`}>
                <p className="sg-stage-num">STAGE {s.num}</p>
                <h3 className="sg-stage-id">{s.id}</h3>
                <p className="sg-stage-name">{s.name}</p>
                <p className="sg-stage-text">{s.text}</p>
                <ul>{s.items.map(it => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="sg-remains">
            <p className="sg-remains-label">最終的に、社内に残すもの</p>
            <ul>{REMAINS.map(r => <li key={r}>{r}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* ── 04 What Changes ── */}
      <section id="changes" className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <Head tone="dark" label="04 — What Changes" title="参画後、経営のマーケティングがこう変わる" />
          <div className="sg-ba">
            <div className="sg-ba-col">
              <p className="sg-ba-label">Before — 判断役が不在のとき</p>
              <ul>{BEFORE.map(t => <li key={t}><Mark />{t}</li>)}</ul>
            </div>
            <div className="sg-ba-col sg-ba-col--after">
              <p className="sg-ba-label">After — 参画後</p>
              <ul>{AFTER.map(t => <li key={t}><Mark ok />{t}</li>)}</ul>
            </div>
          </div>
          <Budou as="p" className="sg-ba-close">そして最後は、判断基準・KPI・ワークフローが社内に残り、自分たちで回せる状態になる。</Budou>
        </div>
      </section>

      {/* ── 05 Track Record ── */}
      <section id="record" className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <Head tone="warm" label="05 — Track Record" title="代表・小林顕人の累計支援実績" />
          <p className="sg-record-note">以下は、2024年6月の株式会社Hau'oli growth設立以前を含む、代表・小林顕人個人の累計実績です。</p>
          <div className="sg-records">
            {RECORDS.map(r => (
              <div key={r.label} className="sg-record">
                <p className="sg-record-num">{r.num}<small>{r.unit}</small></p>
                <p className="sg-record-label">{r.label}</p>
                <p className="sg-record-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 For Whom ── */}
      <section id="for-whom" className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <Head tone="dark" label="06 — For Whom" title="こんな経営者・事業責任者に" />
          <div className="sg-targets">
            {TARGETS.map(t => (
              <article key={t.title} className="sg-target">
                <p className="sg-target-tag">{t.tag}</p>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 Pricing ── */}
      <section id="pricing" className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <Head tone="warm" label="07 — Pricing" title={<><span className="num">3</span>つの関わり方</>}
            lead="中心は月次CMO参画です。まず現状を整理したい場合は、1ヶ月の初期診断から始められます。" />
          <div className="sg-plans">
            {PLANS.map(p => (
              <article key={p.key} className={`sg-plan sg-plan--${p.key}${p.featured ? ' sg-plan--featured' : ''}`}>
                {p.featured && <p className="sg-plan-badge">基本プラン</p>}
                <p className="sg-plan-tier">{p.tier}</p>
                <h3 className="sg-plan-name">{p.name}</h3>
                <p className="sg-plan-kind">{p.kind}</p>
                <p className="sg-plan-price">
                  {p.price}{p.unit && <small>{p.unit}</small>}{p.per && <span className="sg-plan-per"> / {p.per}</span>}
                </p>
                <ul className="sg-plan-notes">{p.notes.map(n => <li key={n}>{n}</li>)}</ul>
                <p className="sg-plan-list-label">{p.listLabel}</p>
                <ul className="sg-plan-items">{p.items.map(it => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 08 Process ── */}
      <section id="process" className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <Head tone="dark" label="08 — Process" title={<>開始まで、<span className="num">5</span>つのステップ</>} />
          <ol className="sg-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="sg-step">
                <span className="sg-step-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="sg-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <p className="sg-step-time">{s.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 09 About ── */}
      <section id="company" className="sg-sec sg-sec--warm">
        <div className="sg-inner sg-about">
          <div>
            <Head tone="warm" label="09 — About" title="会社概要" />
            <dl className="sg-company">
              {COMPANY.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="sg-rep">
            <p className="section-label sg-label sg-label--warm">Representative</p>
            <p className="sg-rep-name">小林 顕人<span>Akihito Kobayashi</span></p>
            <p className="sg-rep-role">Hau'oli growth CEO / Léâme CEO</p>
            <p className="sg-rep-bio">海上自衛隊・護衛艦勤務を経て、マーケティングの世界へ。これまで300店舗超・多業種の支援に、CMOの目線で関わってきた。広告運用から戦略設計・組織構築まで一気通貫で支援する。「マーケは数字の話ではなく、人の話だ」を信条にしている。</p>
            <Link href="/#about" className="sg-rep-link">代表プロフィールを見る<Arrow /></Link>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section contact">
        <div className="section-inner">
          <p className="section-label">Contact</p>
          <Budou as="h2" className="contact-heading">まだ、何が問題か整理できていなくても、<br />大丈夫です。</Budou>
          <Budou as="p" className="contact-sub">現在地を整理するところから、一緒に考えます。<br className="pc-only" />プランが決まっていなくても、そのままご相談ください。</Budou>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
