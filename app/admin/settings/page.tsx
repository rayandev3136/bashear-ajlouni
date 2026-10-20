'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (data) {
        setTitle(data.site_title ?? '')
        setSubtitle(data.site_subtitle ?? '')
        setDescription(data.site_description ?? '')
      }
      setChecking(false)
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('site_settings').update({
      site_title: title.trim() || 'بشار عجلوني',
      site_subtitle: subtitle.trim() || null,
      site_description: description.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    setSaving(false)
    if (error) { setMessage(`❌ خطأ: ${error.message}`); return }
    setMessage('✅ تم الحفظ بنجاح. سيظهر التغيير في الصفحة الرئيسية بعد إعادة التحميل.')
    router.refresh()
  }

  if (checking) return <div className="py-20 text-center text-warm/70 text-lg">جارٍ التحميل...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl text-gold">إعدادات الموقع</h2>
          <p className="mt-1 text-base text-warm/75">تحكم باسم الموقع ووصفه</p>
        </div>
        <Link href="/admin" className="btn-secondary">← عودة إلى اللوحة</Link>
      </div>

      <form onSubmit={handleSave} className="admin-section-card">
        <div className="admin-field">
          <label className="admin-label">عنوان الموقع (يظهر في أعلى الصفحة)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="admin-input"
            placeholder="بشار عجلوني"
          />
          <span className="admin-hint">هذا النص الكبير الذي يظهر في منتصف الهيدر. يمكن تغييره متى شئت.</span>
        </div>

        <div className="admin-field">
          <label className="admin-label">العنوان الفرعي</label>
          <input
            type="text"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            className="admin-input"
            placeholder="أديبٌ وشاعر"
          />
          <span className="admin-hint">سطر صغير تحت الاسم الرئيسي.</span>
        </div>

        <div className="admin-field">
          <label className="admin-label">وصف الموقع</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="admin-textarea"
            placeholder="وصف قصير للموقع أو للأديب..."
          />
          <span className="admin-hint">يُستخدم أيضاً كوصف في نتائج بحث Google.</span>
        </div>

        {message && (
          <p className="mb-4 rounded-lg border border-ink/15 bg-white/60 px-4 py-3 text-base text-ink">
            {message}
          </p>
        )}

        <div className="admin-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '...جارٍ الحفظ' : 'حفظ الإعدادات'}
          </button>
          <Link href="/admin" className="btn-secondary">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}