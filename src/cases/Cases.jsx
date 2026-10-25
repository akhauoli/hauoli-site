import { useEffect } from 'react'
import Budou from '../Budou'
import { Link, hasNavigated, useTitle } from '../router'
import { track } from '../tracking'
import { NotFound } from '../blog/Blog'
import { CASES, STATUS, caseBySlug } from './data'
import '../guide/guide.css'
import './cases.css'

// 事例（/cases 一覧・/cases/<slug> 1件）。Service Guide（考え方と料金）より一段深く、
// 「実際に会社の中で何をしているか」を見せるページ。中身の正本は ./data.js。
const CASES_TITLE = "事例｜Hau'oli growth"
const caseTitle = (c) => `事例｜${c.industry}（${c.scale}）の${c.plan}｜Hau'oli growth`

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Status({ s }) {
  return <span className={`cs-status cs-status--${s}`}>{STATUS[s]}</span>
}

// 直接着地した閲覧だけ Admin に送る（Service Guide と同じ考え方）
function useLanding(path, slug) {
  useEffect(() => {
    if (!hasNavigated()) track('page_view', { path, slug, beaconOnly: true })
  }, [path, slug])
}

// ── 一覧 ──
export function CaseList() {
  useTitle(CASES_TITLE)
  useLanding('/cases', 'cases')
  return (
    <main className="sg cs">
      <section className="sg-cover cs-cover">
        <div className="sg-inner">
          <nav className="sg-crumbs" aria-label="パンくず">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Cases</span>
          </nav>
          <p className="section-label sg-label sg-label--dark">Hau'oli growth — Cases</p>
          <Budou as="h1" className="sg-cover-title">外から入って、<br /><em>会社の中で何をしているか</em>。</Budou>
          <Budou as="p" className="sg-cover-lead">考え方と料金は Service Guide に書いた。ここには、実際に会社の中に入って何をしているかを書く。1社ずつ、深く。</Budou>
        </div>
      </section>

      <section className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <ul className="cs-list">
            {CASES.map(c => (
              <li key={c.slug}>
                <Link href={`/cases/${c.slug}`} className="cs-card">
                  <div className="cs-card-top">
                    <span className="cs-card-no">CASE {c.no}</span>
                    <Status s={c.state} />
                  </div>
                  <p className="cs-card-meta">{c.industry}<span>・</span>{c.scale}<span>・</span>{c.plan}<span>・</span>{c.since}</p>
                  <Budou as="h2" className="cs-card-title">{c.cardTitle}</Budou>
                  <ol className="cs-card-chapters">
                    {c.chapters.map(ch => <li key={ch.id}><span>{ch.no}</span>{ch.label}</li>)}
                  </ol>
                  <span className="cs-card-more">事例を読む<Arrow /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="cs-list-note">
            <Link href="/service-guide">考え方・料金・開始までの流れは Service Guide へ<Arrow /></Link>
          </p>
        </div>
      </section>
    </main>
  )
}

// ── 1件 ──
export function CaseDetail({ slug }) {
  const c = caseBySlug[slug]
  useTitle(c ? caseTitle(c) : null)
  useLanding(`/cases/${slug}`, slug)
  if (!c) return <main><NotFound /></main>
  const [team, flow, finds] = c.chapters

  return (
    <main className="sg cs">
      {/* ── はじめの1画面 ── */}
      <section className="sg-cover cs-cover">
        <div className="sg-inner">
          <nav className="sg-crumbs" aria-label="パンくず">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/cases">Cases</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{c.industry}</span>
          </nav>
          <p className="section-label sg-label sg-label--dark">Case {c.no} — {c.industry}（{c.scale}）</p>
          <Budou as="h1" className="sg-cover-title cs-title">{c.title}</Budou>
          <div className="cs-lead">
            {c.lead.map((t, i) => <Budou as="p" key={i} className={i === 0 ? 'cs-lead-quote' : ''}>{t}</Budou>)}
          </div>
          <div className="cs-stats">
            {c.stats.map(st => (
              <div key={st.label}>
                <span className={`cs-stat-num${st.word ? ' cs-stat-num--word' : ''}`}>{st.num}{st.unit && <small>{st.unit}</small>}</span>
                <span className="cs-stat-label">{st.label}</span>
              </div>
            ))}
          </div>
          <ol className="sg-toc" aria-label="このページの内容">
            <li><a href="#overview"><span>00</span>概要</a></li>
            {c.chapters.map(ch => <li key={ch.id}><a href={`#${ch.id}`}><span>{ch.no}</span>{ch.label}</a></li>)}
            <li><a href="#split"><span>04</span>役割分担</a></li>
          </ol>
        </div>
      </section>

      {/* ── 概要と最初の状態 ── */}
      <section id="overview" className="sg-sec sg-sec--warm">
        <div className="sg-inner cs-overview">
          <div>
            <p className="section-label sg-label sg-label--warm">00 — Overview</p>
            <Budou as="h2" className="sg-title">どんな会社で、いまどこまで</Budou>
            <dl className="cs-facts">
              {c.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <div className="cs-before">
            <p className="cs-before-label">最初の状態</p>
            <ul>{c.before.map(t => <li key={t}><Budou>{t}</Budou></li>)}</ul>
          </div>
        </div>
      </section>

      {/* ── 01 チーム ── */}
      <section id={team.id} className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <ChapterHead ch={team} tone="dark" />
          <div className="cs-roles">
            {team.roles.map(r => (
              <div key={r.who} className={`cs-role${r.ours ? ' cs-role--ours' : ''}`}>
                <p className="cs-role-who">{r.who}</p>
                <p className="cs-role-what">{r.what}</p>
              </div>
            ))}
          </div>
          <div className="cs-study">
            <p className="cs-study-title">{team.study.title}</p>
            <ol>{team.study.steps.map((s, i) => <li key={s}><span>第{i + 1}回</span>{s}</li>)}</ol>
          </div>
        </div>
      </section>

      {/* ── 02 現場の流れ ── */}
      <section id={flow.id} className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <ChapterHead ch={flow} tone="warm" />
          <p className="cs-lost-label">紙と頭の中だと、残らないもの</p>
          <ul className="cs-lost">
            {flow.lost.map((t, i) => (
              <li key={t}><span className="cs-lost-no">{i + 1}</span><Budou>{t}</Budou></li>
            ))}
          </ul>
          <div className="cs-why">
            {flow.after.map((t, i) => <Budou as="p" key={i}>{t}</Budou>)}
          </div>
        </div>
      </section>

      {/* ── 03 当たり前 → 形にしたこと ── */}
      <section id={finds.id} className="sg-sec sg-sec--dark">
        <div className="sg-inner">
          <ChapterHead ch={finds} tone="dark" />
          <p className="cs-note">{finds.note}</p>
          <div className="cs-finds">
            {c.finds.map((f, i) => (
              <article key={i} className={`cs-find cs-find--${f.status}`}>
                <div className="cs-find-top">
                  <span className="cs-find-no">{String(i + 1).padStart(2, '0')}</span>
                  <Status s={f.status} />
                </div>
                <div className="cs-find-was">
                  <p className="cs-find-label">社内の当たり前</p>
                  <Budou as="p">{f.was}</Budou>
                </div>
                <div className="cs-find-arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M5 12l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="cs-find-made">
                  <p className="cs-find-label">形にしたこと</p>
                  <Budou as="p">{f.made}</Budou>
                  {f.funnel && (
                    <ol className="cs-funnel" aria-label="追う流れ">
                      {f.funnel.map(s => <li key={s}>{s}</li>)}
                    </ol>
                  )}
                </div>
                <div className="cs-find-result">
                  {f.stat && (
                    <p className="cs-find-stat">
                      <span className="cs-find-stat-num">{f.stat.num}<small>{f.stat.unit}</small></span>
                      <span className="cs-find-stat-label">{f.stat.label}</span>
                    </p>
                  )}
                  <Budou as="p">{f.result}</Budou>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 役割分担 ── */}
      <section id="split" className="sg-sec sg-sec--warm">
        <div className="sg-inner">
          <div className="sg-head">
            <p className="section-label sg-label sg-label--warm">04 — Who does what</p>
            <Budou as="h2" className="sg-title">こちらがやること、先方がやること</Budou>
          </div>
          <div className="cs-split">
            <SplitCol title="Hau'oli growth" rows={c.split.ours} ours />
            <SplitCol title="先方（整骨院グループ）" rows={c.split.theirs} />
          </div>
        </div>
      </section>

      {/* ── 最後の行き先 ── */}
      <section className="cs-end">
        <div className="sg-inner">
          <Budou as="p" className="cs-end-title">あなたの会社の「当たり前」の中にも、<br />まだ見つかっていない問題が<br />あるかもしれない。</Budou>
          <Budou as="p" className="cs-end-sub">まずは1ヶ月の GROWTH診断から。話を聞いて、現在地と、何から動かすかを整理します。</Budou>
          <div className="cs-end-actions">
            <Link href="/service-guide#pricing" className="sg-btn" onClick={() => track('cta_click', { location: 'case_end_pricing' })}>GROWTH診断を見る<Arrow /></Link>
            <Link href="/#contact" className="cs-btn-ghost" onClick={() => track('cta_click', { location: 'case_end_contact' })}>相談してみる<Arrow /></Link>
          </div>
        </div>
      </section>

      {/* ── よくある質問（行き先の下に置く） ── */}
      <section className="sg-sec sg-sec--dark cs-faq-sec">
        <div className="sg-inner">
          <p className="section-label sg-label sg-label--dark">FAQ</p>
          <h2 className="sg-title cs-faq-title">よくある質問</h2>
          <div className="cs-faq">
            {c.faq.map(f => (
              <details key={f.q}>
                <summary><h3>{f.q}</h3></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="cs-back"><Link href="/cases">事例の一覧へ<Arrow /></Link></p>
        </div>
      </section>
    </main>
  )
}

function ChapterHead({ ch, tone }) {
  return (
    <div className="sg-head">
      <p className={`section-label sg-label sg-label--${tone}`}>{ch.no} — {ch.label}</p>
      <Budou as="h2" className="sg-title">{ch.title}</Budou>
      <div className="cs-body">
        {ch.body.map((t, i) => <Budou as="p" key={i}>{t}</Budou>)}
      </div>
    </div>
  )
}

function SplitCol({ title, rows, ours }) {
  return (
    <div className={`cs-split-col${ours ? ' cs-split-col--ours' : ''}`}>
      <p className="cs-split-title">{title}</p>
      {rows.map(r => (
        <div key={r.who} className="cs-split-row">
          <p className="cs-split-who">{r.who}</p>
          <ul>{r.items.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      ))}
    </div>
  )
}
