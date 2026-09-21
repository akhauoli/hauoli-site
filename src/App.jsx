import { useState, useEffect, useRef } from 'react'
import './App.css'
import ContactForm from './ContactForm'
import Budou from './Budou'
import { rememberTouch, initPixel, track } from './tracking'
import { RouterProvider, Link, useRoute, useTitle } from './router'
import { BlogList, BlogPost, NotFound } from './blog/Blog'

// 上昇パーティクル（決定論的配置）
const PARTICLES = [
  { left:  5, delay: 0.0, dur: 5.2, size: 2 },
  { left: 10, delay: 2.8, dur: 7.0, size: 5 },
  { left: 15, delay: 1.3, dur: 4.8, size: 3 },
  { left: 20, delay: 4.2, dur: 5.5, size: 2 },
  { left: 23, delay: 2.1, dur: 6.0, size: 4 },
  { left: 28, delay: 0.5, dur: 5.5, size: 2 },
  { left: 33, delay: 5.5, dur: 6.8, size: 6 },
  { left: 38, delay: 3.2, dur: 4.5, size: 3 },
  { left: 43, delay: 1.0, dur: 7.2, size: 2 },
  { left: 48, delay: 1.8, dur: 5.8, size: 5 },
  { left: 53, delay: 4.7, dur: 4.2, size: 2 },
  { left: 58, delay: 0.9, dur: 6.2, size: 4 },
  { left: 62, delay: 3.5, dur: 5.0, size: 2 },
  { left: 67, delay: 2.7, dur: 4.7, size: 6 },
  { left: 72, delay: 6.0, dur: 5.3, size: 2 },
  { left: 77, delay: 1.5, dur: 5.7, size: 3 },
  { left: 82, delay: 4.0, dur: 6.5, size: 5 },
  { left: 86, delay: 3.6, dur: 4.9, size: 2 },
  { left: 90, delay: 0.3, dur: 7.5, size: 4 },
  { left: 94, delay: 2.2, dur: 5.4, size: 2 },
  { left: 12, delay: 5.8, dur: 5.1, size: 3 },
  { left: 37, delay: 1.9, dur: 6.3, size: 2 },
  { left: 55, delay: 0.7, dur: 4.6, size: 5 },
  { left: 70, delay: 3.3, dur: 5.8, size: 2 },
  { left: 85, delay: 5.1, dur: 6.0, size: 3 },
  { left: 25, delay: 4.5, dur: 4.4, size: 4 },
  { left: 46, delay: 2.6, dur: 5.9, size: 2 },
  { left: 79, delay: 1.2, dur: 7.1, size: 6 },
]

// 何をする会社か（ファーストビュー直下）
const DOMAINS = ['集客', '広告', '経営課題', '組織', '人材育成', 'AI活用', '業務設計', '仕組み化']

// こんな状態からご相談いただけます
const SITUATIONS = [
  '集客が落ちているが、広告が原因なのか分からない',
  '売上を伸ばしたいが、何から変えるべきか整理できていない',
  '人や店舗が増え、これまでのやり方では回らなくなってきた',
  'AIを活用したいが、何をAIに任せるべきか分からない',
  '目標はあるが、今の延長線では届かない気がする',
  '施策は色々やっているが、結局何が問題なのか分からない',
  'そもそも、課題自体がまだ整理できていない',
]

const VALUES = [
  {
    name: '信頼',
    desc: '実績と誠実さで積み上げる、全ての関係の土台。期待を超え続けることでしか育まれない。',
  },
  {
    name: '幸福',
    desc: 'クライアントが幸せになることが、自分たちの喜びになる。最終的な目的地はここにある。',
  },
  {
    name: '成長',
    desc: '昨日より今日。学び続け、進化し続ける姿勢を手放さない。止まった瞬間に価値は消える。',
  },
  {
    name: '愚直',
    desc: '近道も派手さも要らない。正攻法で、泥臭く、手を抜かない。それが唯一の正しい道。',
  },
  {
    name: '感謝',
    desc: '全ての出会いと機会に感謝し、謙虚に向き合い続ける。おかげさまで、が原動力になる。',
  },
]

const STRENGTHS = [
  {
    num: '01',
    title: 'ゴールから逆算する、戦略設計',
    paragraphs: [
      '目の前の課題に、対処法を出すのは簡単です。私たちがやるのは、その先。',
      '「本当は、どうなりたいのか」から逆算して、そこへ至る道筋ごと、設計します。',
      '施策単体ではなく、事業全体の絵を描いてから、手を打つ。だから、打ち手がブレません。',
    ],
  },
  {
    num: '02',
    title: '人と組織を、見抜く目',
    paragraphs: [
      'マーケティングは、最後は、人がやります。',
      '誰に、どの役割を、どう任せるか——そこを外すと、どんな戦略も、回りません。',
      '私たちは、事業だけでなく、そこにいる人の適性と関係性まで見た上で、実行できる形に、落とし込みます。',
    ],
  },
  {
    num: '03',
    title: '企画から実装まで、完結する速さ',
    paragraphs: [
      '戦略を描く人と、手を動かす人が分かれていると、必ず、伝達ロスが生まれます。',
      '私たちは、構想・設計・制作・実装まで、同じ頭で、走り抜けます。',
      '会議で決めたことが、そのままの熱量で、形になる。この速さが、最大の武器です。',
    ],
  },
  {
    num: '04',
    title: '泥臭く、正攻法で',
    paragraphs: [
      '派手な手法や、近道には、頼りません。',
      '数字を見て、仮説を立て、検証し、また直す。その地味な反復こそが、成果を生む唯一の道だと知っています。',
      '愚直であることを、私たちは、誇りにしています。',
    ],
  },
  {
    num: '05',
    title: '最後は、いなくなる',
    paragraphs: [
      '私たちのゴールは、契約を続けることではありません。あなたの組織が、自走することです。',
      'ノウハウを囲い込まず、渡し、根付かせる。',
      '「もう大丈夫です」と言われる日を目指して、伴走します。',
    ],
  },
]

const SERVICES = [
  {
    id: 'ignite',
    stage: 'IGNITE',
    ja: '見つけ、火をつける',
    desc: '眠っている強みは本人が一番気づいていない。事業の奥の"本当の価値"と"熱"を掘り起こし、進むべき方向を共に定める。',
    tags: ['戦略設計', 'CMO参画', '市場分析', 'USP発掘'],
    accent: 'amber',
  },
  {
    id: 'forge',
    stage: 'FORGE',
    ja: '鍛え、かたちにする',
    desc: '良い想いも伝わる形にならなければ届かない。派手さや近道に頼らず、成果の出る"かたち"を泥臭く正攻法で作り込む。',
    tags: ['クリエイティブ制作', 'コピーライティング', 'ブランディング', 'SNS設計'],
    accent: 'green',
  },
  {
    id: 'convert',
    stage: 'CONVERT',
    ja: '成果に、変える',
    desc: '届けるだけでは伸びない。"選ばれ買われる"ところまで。磨いた価値を確かな数字へ変換。',
    tags: ['広告運用', '集客設計', 'CV改善', 'LTV最大化'],
    accent: 'green',
  },
  {
    id: 'transform',
    stage: 'TRANSFORM',
    ja: '組織を、変える',
    desc: '最終的に目指すのは"私たちがいなくても回る状態"。ノウハウを組織に根付かせ、事業が自走する形へ。',
    tags: ['マーケ内製化支援', 'チーム育成', '仕組み構築', '社内インフラ整備'],
    accent: 'featured',
  },
]

// スクロール表示フック
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <Link href="/#top" className="nav-logo">Hau'oli growth</Link>
      <button
        className="nav-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニュー"
      >
        <span className={`hamburger${menuOpen ? ' open' : ''}`} />
      </button>
      <ul className="nav-links">
        <li><Link href="/#concept">ELEVATE</Link></li>
        <li><Link href="/#services">SERVICE</Link></li>
        <li><Link href="/#strengths">強み</Link></li>
        <li><Link href="/#about">代表</Link></li>
        <li><Link href="/blog">BLOG</Link></li>
        <li><Link href="/#contact" className="nav-cta" onClick={() => track('cta_click', { location: 'nav' })}>お問い合わせ</Link></li>
      </ul>
    </nav>
  )
}

function MobileMenu({ open, onClose }) {
  return (
    <div className={`mobile-menu${open ? ' open' : ''}`}>
      <nav className="mobile-nav">
        <Link href="/#concept" onClick={onClose}>ELEVATE</Link>
        <Link href="/#services" onClick={onClose}>SERVICE</Link>
        <Link href="/#strengths" onClick={onClose}>強み</Link>
        <Link href="/#about" onClick={onClose}>代表</Link>
        <Link href="/#mvv" onClick={onClose}>MVV</Link>
        <Link href="/blog" onClick={onClose}>BLOG</Link>
        <Link href="/#contact" onClick={() => { track('cta_click', { location: 'mobile_nav' }); onClose() }}>お問い合わせ</Link>
      </nav>
    </div>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-watermark" aria-hidden="true">ELEVATE</div>
      <div className="particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="hero-content">
        <p className="hero-eyebrow">Hau'oli growth</p>
        <Budou as="h1" className="hero-vision">
          自分にしか描けない<br />人生を自分らしく
        </Budou>
        <div className="hero-tagline">
          <span className="hero-elevate">Elevate</span>
          <span className="hero-dash">—</span>
          <Budou className="hero-sub">その熱を、高みへ</Budou>
        </div>
        <a href="#contact" className="hero-cta" onClick={() => track('cta_click', { location: 'hero' })}>
          相談してみる
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>scroll</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  )
}

function WhatWeDo() {
  const [ref, inView] = useInView()
  return (
    <section id="what" className="section whatwedo">
      <div className={`section-inner whatwedo-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <div className="whatwedo-head">
          <p className="section-label">What we do</p>
          <Budou as="h2" className="whatwedo-heading">
            マーケティングを入口に、<br />
            会社の課題を整理し、成長する仕組みをつくる。
          </Budou>
        </div>
        <div className="whatwedo-body">
          <Budou as="p">集客や広告だけではなく、組織、人材、AI、業務設計まで。</Budou>
          <Budou as="p">目標と現在地を整理し、本当に解くべき課題を見つけ、次にやることを一緒に考えます。</Budou>
          <Budou as="p">施策を実行するだけではなく、最終的にはクライアント自身が、考え、判断し、改善できる状態を目指します。</Budou>
          <div className="whatwedo-domains">
            {DOMAINS.map(d => <span key={d} className="service-tag">{d}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}

function SituationItem({ text, index }) {
  const [ref, inView] = useInView(0.1)
  return (
    <li
      ref={ref}
      className={`situation-item reveal${inView ? ' in-view' : ''}`}
      style={{ transitionDelay: `${index * 0.06}s` }}
    >
      <Budou>{text}</Budou>
    </li>
  )
}

function Situations() {
  const [ref, inView] = useInView()
  return (
    <section id="situations" className="section situations">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Cases</p>
        <Budou as="h2" className="section-heading">こんな状態から、ご相談いただけます。</Budou>
      </div>
      <ul className="situations-list section-inner">
        {SITUATIONS.map((t, i) => <SituationItem key={t} text={t} index={i} />)}
      </ul>
      <div className="section-inner situations-close">
        <Budou as="p" className="situations-lead">
          課題を、きれいに整理してからご相談いただく必要はありません。<br />
          「何が問題なのか」<br />
          を整理するところから、一緒に始めます。
        </Budou>
        <a href="#contact" className="situations-cta" onClick={() => track('cta_click', { location: 'situations' })}>
          相談してみる
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  )
}

function Concept() {
  const [ref, inView] = useInView()
  return (
    <section id="concept" className="section concept">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Our Concept</p>
        <h2 className="concept-headline">
          {'ELEVATE'.split('').map((ch, i) => (
            <span key={i} style={{ transitionDelay: `${i * 0.045}s` }}>{ch}</span>
          ))}
        </h2>
        <p className="concept-definition">
          el·e·vate ── 〔動〕高める。引き上げる。昇華させる。
        </p>
        <Budou as="p" className="concept-bridge">
          Hau'oli growthがすべての事業に問いかける、ひとつの言葉。
        </Budou>
        <Budou as="p" className="concept-lead">
          その熱を、Elevateする。<br />
          あなたの事業に眠る<em>"熱い思いと志"</em>を、成果と成長へ。<br />
          火をつけ、鍛え、変え、高みへ運ぶ——<br />
          私たちは、その全工程に、伴走します。
        </Budou>
      </div>
    </section>
  )
}

function ServiceCard({ service, index }) {
  const [ref, inView] = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`service-card service-card--${service.accent} reveal${inView ? ' in-view' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="service-card-header">
        <span className="service-stage">{service.stage}</span>
        {service.accent === 'featured' && (
          <span className="service-badge">差別化の核</span>
        )}
      </div>
      <h3 className="service-ja">{service.ja}</h3>
      <p className="service-desc">{service.desc}</p>
      <div className="service-tags">
        {service.tags.map(tag => (
          <span key={tag} className="service-tag">{tag}</span>
        ))}
      </div>
    </div>
  )
}

function StrengthItem({ item, index }) {
  const [ref, inView] = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`strength-item reveal${inView ? ' in-view' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <span className="strength-num">{item.num}</span>
      <div className="strength-content">
        <h3 className="strength-title">{item.title}</h3>
        <div className="strength-body">
          {item.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </div>
  )
}

function Strengths() {
  const [ref, inView] = useInView()
  return (
    <section id="strengths" className="section strengths">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Our Strengths</p>
        <Budou as="h2" className="section-heading">私たちの強み</Budou>
      </div>
      <div className="strengths-list section-inner">
        {STRENGTHS.map((item, i) => (
          <StrengthItem key={item.num} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}

function Services() {
  const [ref, inView] = useInView()
  return (
    <section id="services" className="section services">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Service</p>
        <Budou as="h2" className="section-heading">Elevateを頂点に、<br /><span className="num">4</span>段階の登山道</Budou>
        <p className="services-sub">
          手段ではなく、<strong>"何を変えるか"</strong>で整理したHau'oliのサービス構成。
        </p>
      </div>
      <div className="services-grid">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.id} service={s} index={i} />
        ))}
      </div>
    </section>
  )
}

function About() {
  const [ref, inView] = useInView()
  return (
    <section id="about" className="section about">
      <div className={`about-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <div className="about-photo">
          <img src="/akihito.png" alt="小林 顕人" className="about-photo-img" />
        </div>
        <div className="about-text">
          <p className="section-label">代表</p>
          <h2 className="about-name">
            小林 顕人
            <span className="about-name-en">Akihito Kobayashi</span>
          </h2>
          <p className="about-role">代表取締役 CEO</p>
          <p className="about-bio">
            元海上自衛官（護衛艦勤務）を経て、マーケティングの世界へ。マーケティング会社のCOO・複数社のCMOとして事業成長の最前線に立ち、Hau'oli growth代表として200を超えるクライアントの事業成長を支援。株式会社LeameのCEOとしても店舗経営に携わりながら、言葉とマーケティングに加えて仕組みの力で、正しく報われる努力を増やし続けている。
          </p>
          <p className="about-why">
            絵に描いた餅のコンサルは、終わる。「やったことないくせに」——その言葉が、一番嫌だった。だから先に、自分の事業で成功させた。その仕組みを、ご提供している。
          </p>
          <ul className="about-traits">
            <li>諦めが悪い</li>
            <li>話を聞いたら、ゴールが見える</li>
            <li>業種が変わっても、本質はいつも同じに聞こえる</li>
          </ul>
          <blockquote className="about-belief">
            "人は、幸せに向かって成長し、その成長の中にまた新しい幸せを見つけていく。そんな循環が、まわりにも幸せな変化を起こしていく。"
          </blockquote>
        </div>
      </div>
    </section>
  )
}

function MVV() {
  const [refTop, inViewTop] = useInView()
  const [refMission, inViewMission] = useInView()
  const [refValues, inViewValues] = useInView()
  const [refPurpose, inViewPurpose] = useInView()
  return (
    <section id="mvv" className="mvv">
      {/* Vision */}
      <div className="mvv-vision-section">
        <div className={`section-inner reveal${inViewTop ? ' in-view' : ''}`} ref={refTop}>
          <p className="section-label">Mission / Vision / Values / Purpose</p>
          <p className="mvv-vision-label">Vision</p>
          <blockquote className="mvv-vision">
            自分にしか描けない人生を自分らしく
          </blockquote>
        </div>
      </div>

      {/* Mission */}
      <div className="mvv-block mvv-block--mission">
        <div className={`section-inner reveal${inViewMission ? ' in-view' : ''}`} ref={refMission}>
          <p className="mvv-block-label">Mission</p>
          <p className="mvv-block-text">
            挑戦する人々と企業の<em>"熱い思いと志"</em>を成果と成長に変換し、<br />
            全ての人が正しく報われる幸せな未来を切り拓く。
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mvv-block mvv-block--values">
        <div className={`section-inner reveal${inViewValues ? ' in-view' : ''}`} ref={refValues}>
          <p className="mvv-block-label">Values</p>
          <div className="mvv-values-grid">
            {VALUES.map(v => (
              <div key={v.name} className="mvv-value-card">
                <h3 className="mvv-value-name">{v.name}</h3>
                <p className="mvv-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div className="mvv-block mvv-block--purpose">
        <div className={`section-inner reveal${inViewPurpose ? ' in-view' : ''}`} ref={refPurpose}>
          <p className="mvv-block-label">Purpose</p>
          <p className="mvv-block-text">
            言葉・マーケティング・仕組みの力で、<br />
            <em>"正しく報われる努力"</em>を増やし、<br />
            人生と社会の可能性を最大化する。
          </p>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [ref, inView] = useInView()
  return (
    <section id="contact" className="section contact">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Contact</p>
        <Budou as="h2" className="contact-heading">
          まだ、何が問題か整理できていなくても、<br />大丈夫です。
        </Budou>
        <Budou as="p" className="contact-sub">
          「なんとなく上手くいっていない」「このままでいいのか分からない」<br className="pc-only" />
          そんな状態からでも、現在地を整理するところから一緒に考えます。
        </Budou>
        <ContactForm />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-logo">Hau'oli growth</p>
      <nav className="footer-links" aria-label="フッター">
        <Link href="/blog">Blog</Link>
        <Link href="/#contact" onClick={() => track('cta_click', { location: 'footer' })}>お問い合わせ</Link>
      </nav>
      <p className="footer-copy">© 2026 Hau'oli growth. All rights reserved.</p>
    </footer>
  )
}

function Home() {
  useTitle("Hau'oli growth")
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <Concept />
      <Services />
      <Situations />
      <Strengths />
      <About />
      <MVV />
      <Contact />
    </main>
  )
}

// パスに応じてページを切り替える。/ はトップ、/blog 配下はブログ、それ以外は404
function Page() {
  const { path } = useRoute()
  if (path === '/') return <Home />
  if (path === '/blog') return <main><BlogList /></main>
  const m = path.match(/^\/blog\/([^/]+)$/)
  if (m) return <main><BlogPost slug={m[1]} /></main>
  return <main><NotFound /></main>
}

export default function App({ url = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    rememberTouch()
    initPixel()
    const onResize = () => { if (window.innerWidth > 640) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <RouterProvider initialPath={url}>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Page />
      <Footer />
    </RouterProvider>
  )
}
