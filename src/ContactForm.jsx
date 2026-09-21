import { useState } from 'react'
import { CONTACT_ENDPOINT, SOURCE_STORAGE_KEY } from './config'

const SUPPORT_OPTIONS = ['継続的な支援を検討している', 'まずは相談したい']
const BUDGET_OPTIONS = ['月20〜30万円程度', '月30〜50万円程度', '月50万円以上', '内容を見て相談したい']

const INITIAL = {
  name: '', company: '', url: '', email: '', phone: '',
  problem: '', goal: '', support: '', budget: '',
  website: '', // ハニーポット（人間には見えない）
}

function readSource() {
  try { return JSON.parse(sessionStorage.getItem(SOURCE_STORAGE_KEY) || '{}') } catch { return {} }
}

function Field({ label, required, children, hint }) {
  return (
    <label className="cf-field">
      <span className="cf-label">
        {label}
        {required ? <span className="cf-req">必須</span> : <span className="cf-opt">任意</span>}
      </span>
      {children}
      {hint && <span className="cf-hint">{hint}</span>}
    </label>
  )
}

function Choice({ label, required, name, options, value, onChange }) {
  return (
    <div className="cf-field" role="radiogroup" aria-label={label}>
      <span className="cf-label">
        {label}
        {required ? <span className="cf-req">必須</span> : <span className="cf-opt">任意</span>}
      </span>
      <div className="cf-choices">
        {options.map(opt => (
          <button
            type="button"
            key={opt}
            role="radio"
            aria-checked={value === opt}
            className={`cf-choice${value === opt ? ' is-selected' : ''}`}
            onClick={() => onChange({ target: { name, value: opt } })}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const missing = () => {
    if (!form.name.trim()) return 'お名前を入力してください。'
    if (!form.company.trim()) return '会社名（屋号）を入力してください。'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'メールアドレスを正しく入力してください。'
    if (!form.problem.trim()) return '今、一番困っていることを入力してください。'
    if (!form.support) return '支援形態を選択してください。'
    if (!form.budget) return 'ご予算を選択してください。'
    return ''
  }

  const onSubmit = async e => {
    e.preventDefault()
    const m = missing()
    if (m) { setError(m); return }
    setError('')
    setStatus('sending')
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        // text/plain にするとブラウザの事前確認(preflight)が走らず GAS に届く
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...form, ...readSource() }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'server')
      setStatus('done')
      window.dataLayer?.push({ event: 'contact_submit', support: form.support, budget: form.budget })
    } catch (err) {
      console.log('問い合わせ送信に失敗:', err)
      setError(err.message && err.message !== 'server' && err.message !== 'Failed to fetch'
        ? err.message
        : '送信できませんでした。お手数ですが、時間をおいて再度お試しください。')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="cf-done">
        <p className="cf-done-title">お問い合わせを受け付けました。</p>
        <p className="cf-done-text">
          ご入力いただいたメールアドレスに、受付確認をお送りしています。<br />
          内容を確認のうえ、担当よりご連絡いたします。
        </p>
      </div>
    )
  }

  return (
    <form className="cf" onSubmit={onSubmit} noValidate>
      <div className="cf-grid">
        <Field label="お名前" required>
          <input name="name" value={form.name} onChange={onChange} autoComplete="name" />
        </Field>
        <Field label="会社名・屋号" required>
          <input name="company" value={form.company} onChange={onChange} autoComplete="organization" />
        </Field>
        <Field label="メールアドレス" required>
          <input name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="電話番号">
          <input name="phone" type="tel" value={form.phone} onChange={onChange} autoComplete="tel" inputMode="tel" />
        </Field>
        <Field label="会社URL" hint="Webサイト、Instagram、Googleマップなど、事業がわかるものであれば構いません。">
          <input name="url" type="url" value={form.url} onChange={onChange} placeholder="https://" inputMode="url" />
        </Field>
      </div>

      <Field label="今、一番困っていること" required hint="箇条書きでも、まとまっていない状態でも構いません。">
        <textarea name="problem" value={form.problem} onChange={onChange} rows={5} />
      </Field>
      <Field label="今後どうしていきたいか" hint="まだ言葉になっていなければ、空欄のままで大丈夫です。">
        <textarea name="goal" value={form.goal} onChange={onChange} rows={4} />
      </Field>

      <Choice label="支援形態" required name="support" options={SUPPORT_OPTIONS} value={form.support} onChange={onChange} />
      <Choice
        label="ご予算"
        required
        name="budget"
        options={BUDGET_OPTIONS}
        value={form.budget}
        onChange={onChange}
      />
      <p className="cf-note">今回の支援について、現時点で想定しているご予算をお選びください。内容を伺ったうえで、あらためてご相談します。</p>

      {/* ハニーポット: bot 対策。人間には表示されない */}
      <input
        name="website"
        value={form.website}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="cf-hp"
      />

      {error && <p className="cf-error" role="alert">{error}</p>}

      <div className="cf-actions">
        <button type="submit" className="contact-cta" disabled={status === 'sending'}>
          {status === 'sending' ? '送信しています…' : '相談してみる'}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3.5 9h11M10.5 5.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="cf-privacy">いただいた内容は、ご相談への対応以外の目的では使用しません。</p>
      </div>
    </form>
  )
}
