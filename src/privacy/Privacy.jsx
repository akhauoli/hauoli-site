import { Link, useTitle } from '../router'
import Budou from '../Budou'
import '../blog/blog.css'

// プライバシーポリシー（2026-10-28 制定）。見た目はブログ記事と同じ部品（blog-head / blog-post-main / blog-body）を使う。
// 中身は問い合わせフォーム（src/ContactForm.jsx）・計測（src/tracking.js）・受け口（admin.hauoil.com の /api/leads と gas/contact）が
// 実際に受け取る項目に合わせている。フォームの項目や計測を変えたら、ここも直す。
// 制定日・保管期間・窓口・受付担当は 2026-10-28 に決定（本番反映の OK と同時）。変える時は制定日と別に改定日を足す。

const FORM_ITEMS = [
  'お名前',
  '会社名・屋号',
  'メールアドレス',
  '電話番号（任意）',
  '会社URL（任意。Webサイト・Instagram・Googleマップなど）',
  '今、一番困っていること',
  '今後どうしていきたいか（任意）',
  '支援形態・ご予算（選択式）',
]

export default function Privacy() {
  useTitle("プライバシーポリシー｜Hau'oli growth")
  return (
    <main>
      <article className="blog-post privacy">
        <header className="blog-head blog-post-head">
          <div className="blog-post-inner">
            <nav className="blog-crumbs" aria-label="パンくず">
              <Link href="/">Home</Link><span>/</span>
              <span aria-current="page">プライバシーポリシー</span>
            </nav>
            <Budou as="h1" className="blog-post-title">プライバシーポリシー</Budou>
            <p className="blog-post-meta">
              <span>制定日 <time dateTime="2026-10-28">2026年10月28日</time></span>
            </p>
          </div>
        </header>

        <div className="blog-post-main">
          <div className="blog-post-inner blog-body">
            <p>
              株式会社Hau'oli growth（以下「当社」）は、当社のWebサイト（hauoil.com）でお預かりする個人情報を、
              個人情報の保護に関する法律その他の法令を守り、以下のとおり取り扱います。
            </p>

            <h2>1. 事業者</h2>
            <ul>
              <li>名称：株式会社Hau'oli growth</li>
              <li>所在地：〒530-0001 大阪府大阪市北区梅田1-2-2 大阪駅前第2ビル12-12</li>
              <li>代表者：代表取締役 小林 顕人</li>
            </ul>

            <h2>2. お預かりする情報</h2>
            <h3>お問い合わせフォームでご入力いただく情報</h3>
            <ul>
              {FORM_ITEMS.map(t => <li key={t}>{t}</li>)}
            </ul>
            <h3>フォームの送信時に自動で添えられる情報</h3>
            <ul>
              <li>受付番号、送信日時</li>
              <li>最初に訪れたページ・送信したページ・直前に読んだブログ記事</li>
              <li>参照元（どのサイトから来たか）、広告のパラメータ（utm、fbclid・gclid など）</li>
              <li>ブラウザの種類（ユーザーエージェント）、訪問ごとの識別番号</li>
            </ul>
            <h3>サイトの閲覧時に集める情報</h3>
            <p>
              閲覧したページ、ボタンを押した記録などを、Cookie やブラウザの保存領域を使って記録します。
              お名前やメールアドレスなど、個人を直接特定する情報はここには含めません。
            </p>

            <h2>3. 利用目的</h2>
            <ul>
              <li>お問い合わせ・ご相談への返信と対応（受付確認メールの送信を含む）</li>
              <li>ご相談内容に応じたご提案・日程の調整</li>
              <li>サイトの改善と、広告の効果の測定（どの記事・広告からお問い合わせにつながったかを把握するため）</li>
            </ul>
            <p>お問い合わせでお預かりした内容は、ご相談への対応以外の目的では使用しません。</p>

            <h2>4. 第三者への提供</h2>
            <p>
              法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。
              ただし、次のとおり、業務に必要なサービスに保管・処理を任せています。
            </p>
            <ul>
              <li>Google LLC（Google Cloud：お問い合わせの保管／Google Workspace：通知メールの送信・控えの表）</li>
              <li>Vercel Inc.（Webサイトの配信）</li>
            </ul>

            <h2>5. アクセス解析と広告の計測</h2>
            <p>当社のサイトでは、次のツールを使っています。これらのツールは Cookie 等を使って閲覧の情報を各社に送ります。</p>
            <ul>
              <li>Google タグマネージャー・Google アナリティクス（Google LLC）</li>
              <li>Meta ピクセル（Meta Platforms, Inc.）</li>
            </ul>
            <p>
              お問い合わせが完了したことは受付番号とともに Meta に送りますが、お名前・メールアドレスなどの入力内容は送りません。
              Cookie はブラウザの設定で無効にできます。各社の取り扱いは、
              <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">Google のポリシー</a>・
              <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta のプライバシーポリシー</a>
              をご覧ください。
            </p>

            <h2>6. 保管と安全管理</h2>
            <ul>
              <li>お問い合わせは Google Cloud（東京リージョン）のデータベースに保管します。</li>
              <li>見られるのは、当社が許可した担当者だけです（Google アカウントでのログインが必要です）。</li>
              <li>保管期間：最後のやり取りから3年間。その後は遅滞なく削除します。</li>
            </ul>

            <h2>7. 開示・訂正・削除などのご請求</h2>
            <p>
              ご本人から、保有する個人情報の開示・訂正・追加・削除・利用停止のご請求があった場合は、
              ご本人であることを確認したうえで、法令に従って対応します。
            </p>
            <ul>
              <li>窓口：<Link href="/#contact">お問い合わせフォーム</Link>からご連絡ください。</li>
              <li>受付担当：代表 小林 顕人</li>
            </ul>

            <h2>8. このポリシーの変更</h2>
            <p>法令の改正や当社の取り扱いの変更に合わせて、このポリシーを変更することがあります。変更後の内容は、このページに載せた時点から効力を持ちます。</p>

            <p>制定日：2026年10月28日<br />株式会社Hau'oli growth</p>
          </div>
        </div>
      </article>
    </main>
  )
}
