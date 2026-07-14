import { useState, useEffect, useRef } from 'react'
import './App.css'

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
    tags: ['Meta広告運用', '集客設計', 'CV改善', 'LTV最大化'],
    accent: 'green',
  },
  {
    id: 'transform',
    stage: 'TRANSFORM',
    ja: '組織を、変える',
    desc: '最終的に目指すのは"私たちがいなくても回る状態"。ノウハウを組織に根付かせ、事業が自走する形へ。',
    tags: ['マーケ内製化研修', 'チーム育成', '仕組み構築'],
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
      <a href="#top" className="nav-logo">Hau'oli growth</a>
      <button
        className="nav-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニュー"
      >
        <span className={`hamburger${menuOpen ? ' open' : ''}`} />
      </button>
      <ul className="nav-links">
        <li><a href="#concept">ELEVATE</a></li>
        <li><a href="#services">SERVICE</a></li>
        <li><a href="#about">代表</a></li>
        <li><a href="#contact" className="nav-cta">お問い合わせ</a></li>
      </ul>
    </nav>
  )
}

function MobileMenu({ open, onClose }) {
  return (
    <div className={`mobile-menu${open ? ' open' : ''}`}>
      <nav className="mobile-nav">
        <a href="#concept" onClick={onClose}>ELEVATE</a>
        <a href="#services" onClick={onClose}>SERVICE</a>
        <a href="#about" onClick={onClose}>代表</a>
        <a href="#mvv" onClick={onClose}>MVV</a>
        <a href="#contact" onClick={onClose}>お問い合わせ</a>
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
        <h1 className="hero-vision">
          自分にしか描けない<br />人生を、自分らしく。
        </h1>
        <div className="hero-tagline">
          <span className="hero-elevate">Elevate</span>
          <span className="hero-dash">—</span>
          <span className="hero-sub">その熱を、高みへ</span>
        </div>
        <a href="#contact" className="hero-cta">
          お問い合わせ
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
        <p className="concept-bridge">
          Hau'oli growthがすべての事業に問いかける、ひとつの言葉。
        </p>
        <p className="concept-lead">
          その熱を、Elevateする。<br />
          あなたの事業に眠る<em>"熱い思いと志"</em>を、成果と成長へ。<br />
          火をつけ、鍛え、変え、高みへ運ぶ——<br />
          私たちは、その全工程に、伴走します。
        </p>
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

function Services() {
  const [ref, inView] = useInView()
  return (
    <section id="services" className="section services">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Service</p>
        <h2 className="section-heading">Elevateを頂点に、<br />4段階の登山道</h2>
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
          <div className="about-photo-placeholder">
            <span>小林 顕人</span>
          </div>
        </div>
        <div className="about-text">
          <p className="section-label">代表</p>
          <h2 className="about-name">
            小林 顕人
            <span className="about-name-en">Akito Kobayashi</span>
          </h2>
          <p className="about-role">代表取締役 CEO</p>
          <p className="about-bio">
            元海上自衛官（護衛艦勤務）を経て、マーケティングの世界へ。現在はHau'oli growth代表として100社を超えるクライアントの事業成長を支援しながら、Bar Léâme CEOとしても店舗経営に携わる。言葉とマーケティングの力で、正しく報われる努力を増やし続けている。
          </p>
          <blockquote className="about-belief">
            "人は、幸せに向かって成長し、その成長の中にまた新しい幸せを見つけていく。そんな循環が、まわりにも幸せな変化を起こしていく。"
          </blockquote>
        </div>
      </div>
    </section>
  )
}

function MVV() {
  const [ref, inView] = useInView()
  const values = ['信頼', '幸福', '成長', '愚直', '感謝']
  return (
    <section id="mvv" className="section mvv">
      <div className={`section-inner reveal${inView ? ' in-view' : ''}`} ref={ref}>
        <p className="section-label">Mission / Vision / Values</p>
        <div className="mvv-grid">
          <div className="mvv-item">
            <h3 className="mvv-label">Mission</h3>
            <p className="mvv-text">
              挑戦する人々と企業の"熱い思いと志"を成果と成長に変換し、全ての人が正しく報われる幸せな未来を切り拓く。
            </p>
          </div>
          <div className="mvv-item">
            <h3 className="mvv-label">Vision</h3>
            <p className="mvv-text mvv-text--vision">
              自分にしか描けない人生を、自分らしく。
            </p>
          </div>
          <div className="mvv-item">
            <h3 className="mvv-label">Values</h3>
            <div className="mvv-values">
              {values.map(v => (
                <span key={v} className="mvv-value">{v}</span>
              ))}
            </div>
          </div>
          <div className="mvv-item">
            <h3 className="mvv-label">Purpose</h3>
            <p className="mvv-text">
              言葉とマーケティングの力で、"正しく報われる努力"を増やし、人生と社会の可能性を最大化する。
            </p>
          </div>
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
        <h2 className="contact-heading">
          一歩踏み出す準備ができたら、<br />ご連絡ください。
        </h2>
        <p className="contact-sub">紹介・ご相談・お見積もりなど、お気軽にどうぞ。</p>
        <a href="mailto:a.kobayashi@hauoil.com" className="contact-cta">
          メールで問い合わせる
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3.5 9h11M10.5 5.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-logo">Hau'oli growth</p>
      <p className="footer-copy">© 2026 Hau'oli growth. All rights reserved.</p>
    </footer>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 640) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <Concept />
        <Services />
        <About />
        <MVV />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
