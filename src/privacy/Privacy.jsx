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
              <span>改定日 <time dateTime="2026-11-18">2026年11月18日</time></span>
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

            <h2 id="google-user-data">9. Google ユーザーデータ（Google 広告アカウントの情報）の取り扱い</h2>
            <p>
              当社は、運用を委託されたクライアントの Google 広告アカウントの情報を、Google の OAuth（認可）で許可された範囲
              （スコープ：<code>https://www.googleapis.com/auth/adwords</code>）で、Google Ads API を通じて取得します。
              以下は、この Google ユーザーデータに限った取り扱いです。
            </p>
            <h3>取得する情報</h3>
            <ul>
              <li>アクセスできる Google 広告アカウントの一覧（アカウント名・ID・状態）</li>
              <li>キャンペーンの名前・配信状態・予算</li>
              <li>費用・表示回数・クリック数・コンバージョンなどの成果の数字</li>
              <li>連携のための認可トークン（更新トークン）</li>
            </ul>
            <h3>使い方</h3>
            <ul>
              <li>クライアントへの運用報告と、運用の判断（どの店舗・どの広告が計画どおりか）のためだけに使います。</li>
              <li>出店前・検索広告の開始前に行うキーワードの調査（検索数・入札単価の目安の確認）にも使います。</li>
              <li>現在は読み取りだけです。広告の作成・変更・停止はこの連携では行いません。</li>
              <li>使うのは当社の限られた担当者だけです。当社のサービスの利用者や外部の方に、この連携を提供することはありません。</li>
            </ul>
            <h3>保存</h3>
            <ul>
              <li>数字は、質問のたびに Google から取得します。当社のシステムのメモリに最長1時間だけ一時的に置き、データベースには保存しません。</li>
              <li>認可トークンは、Google Cloud のデータベース（Firestore。保存時に暗号化されます）に保管し、許可された担当者のシステムだけが読めます。</li>
              <li>連携を解除すると、保管したトークンを削除します。</li>
            </ul>
            <h3>共有・販売・学習への利用をしないこと</h3>
            <ul>
              <li>Google ユーザーデータを、販売・貸与・第三者への提供はしません（法令に基づく場合を除きます）。</li>
              <li>広告の表示、ユーザーの属性にもとづく広告配信（リターゲティング・興味関心にもとづく広告）には使いません。</li>
              <li>AI・機械学習モデルの学習や改善には使いません。</li>
              <li>人が内容を読むのは、報告・運用の判断・不具合の調査に必要な場合と、法令で求められる場合だけです。</li>
            </ul>
            <h3>Google API サービスのユーザーデータに関するポリシー</h3>
            <p>
              当社による、Google API から受け取った情報の利用と、その情報の他のアプリへの移転は、
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API サービスのユーザーデータに関するポリシー</a>
              （限定利用の要件を含みます）に従います。
            </p>
            <h3>削除のご請求・お問い合わせ</h3>
            <p>
              Google ユーザーデータの削除や、取り扱いについてのお問い合わせは、<a href="mailto:a.kobayashi@hauoil.com">a.kobayashi@hauoil.com</a> までご連絡ください。
              Google アカウントの設定（<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">アカウントへのアクセス権</a>）から、当社への許可をいつでも取り消せます。
            </p>
            <h3 lang="en">Google user data (English summary)</h3>
            <p lang="en">
              Hau'oli growth Co., Ltd. uses Google user data obtained through the Google Ads API (OAuth scope
              https://www.googleapis.com/auth/adwords) only to provide reporting and campaign operations for the advertisers that have
              contracted us, and for pre-launch keyword research. The current use is read-only. Data is fetched on demand and cached in
              memory for at most one hour; the OAuth refresh token is stored in Google Cloud Firestore (encrypted at rest) and deleted when the
              connection is revoked. We do not sell, share or transfer this data to third parties, do not use it for advertising, and do not use it
              to develop, improve or train AI or machine-learning models. Our use and transfer to any other app of information received from
              Google APIs will adhere to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>,
              including the Limited Use requirements. To request deletion or ask a question, contact a.kobayashi@hauoil.com.
            </p>

            <p>制定日：2026年10月28日<br />改定日：2026年11月18日<br />株式会社Hau'oli growth</p>
          </div>
        </div>
      </article>
    </main>
  )
}
