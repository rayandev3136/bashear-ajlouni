'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('بيانات الدخول غير صحيحة. تحقق من البريد وكلمة المرور.')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card-cream p-8 md:p-10">
        <h2 className="mb-2 text-center font-display text-4xl text-ink">دخول المالك</h2>
        <div className="ornament-divider mx-auto mb-8 max-w-[150px] text-xs text-ink/60">
          <span>لوحة التحكم</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink/85">البريد الإلكتروني</label>
            <input
              type="email" required dir="ltr"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded border border-ink/25 bg-white/80 px-3 py-2 text-left text-ink focus:border-gold-dim focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/85">كلمة المرور</label>
            <input
              type="password" required dir="ltr"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded border border-ink/25 bg-white/80 px-3 py-2 text-left text-ink focus:border-gold-dim focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full rounded bg-ink px-4 py-3 font-display text-xl text-cream transition hover:bg-ink-mid disabled:opacity-60"
          >
            {loading ? '...جارٍ الدخول' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}