'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Category = { id: string; name: string; slug: string }
type Work = {
  id: string
  title: string
  category_id: string | null
  cover_url: string | null
  content_type: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [works, setWorks] = useState<Work[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [catError, setCatError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserEmail(user.email ?? '')
      const [{ data: w }, { data: c }] = await Promise.all([
        supabase
          .from('works')
          .select('id, title, category_id, cover_url, content_type, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, slug').order('created_at'),
      ])
      setWorks(w ?? [])
      setCategories(c ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleDeleteWork(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العمل نهائياً؟')) return
    await supabase.from('works').delete().eq('id', id)
    setWorks(works.filter(w => w.id !== id))
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    setCatError('')
    const name = newCatName.trim()
    const slug = newCatSlug.trim()
    if (!name || !slug) { setCatError('الاسم والـ slug مطلوبان'); return }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setCatError('الـ slug يجب أن يكون أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط')
      return
    }
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug })
      .select()
      .single()
    if (error) { setCatError(error.message); return }
    setCategories([...categories, data as Category])
    setNewCatName('')
    setNewCatSlug('')
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('حذف هذا القسم؟ الأعمال المرتبطة به ستصبح بدون قسم.')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <div className="py-20 text-center text-warm/70 text-lg">جارٍ التحميل...</div>

  const catById = new Map(categories.map(c => [c.id, c]))
  const contentTypeLabels: Record<string, string> = {
    text: 'نص',
    images: 'صور',
    pdf: 'PDF',
    video: 'فيديو',
    mixed: 'نص + وسائط',
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl text-gold">لوحة المالك</h2>
          <p className="mt-2 text-base text-warm/80">مرحباً، {userEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/new" className="btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '1.2rem' }}>
            + عمل جديد
          </Link>
          <Link href="/admin/settings" className="btn-secondary">إعدادات الموقع</Link>
          <button onClick={handleSignOut} className="btn-secondary">تسجيل الخروج</button>
        </div>
      </div>

      {/* الأعمال */}
      <section>
        <h3 className="mb-5 font-display text-3xl text-gold">الأعمال ({works.length})</h3>
        {works.length === 0 ? (
          <div className="admin-section-card text-center">
            <p className="text-lg text-ink/75">لا توجد أعمال بعد. اضغط "+ عمل جديد" للبدء.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {works.map(w => {
              const cat = w.category_id ? catById.get(w.category_id) : null
              return (
                <li key={w.id} className="admin-section-card flex flex-wrap items-center gap-4" style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded border-2 border-ink/15 bg-ink/5">
                    {w.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.cover_url} alt={w.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">بلا غلاف</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {cat && <span className="text-sm font-semibold tracking-wide text-accent">{cat.name}</span>}
                      <span className="rounded bg-ink/10 px-2 py-0.5 text-xs text-ink/70">
                        {contentTypeLabels[w.content_type] ?? w.content_type}
                      </span>
                    </div>
                    <h4 className="mt-1 truncate font-display text-2xl text-ink">{w.title}</h4>
                    <p className="text-sm text-ink/60">
                      {new Date(w.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/works/${w.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>
                      عرض
                    </Link>
                    <Link href={`/admin/edit/${w.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '1.1rem' }}>
                      تعديل
                    </Link>
                    <button onClick={() => handleDeleteWork(w.id)} className="btn-danger">حذف</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* الأقسام */}
      <section>
        <h3 className="mb-5 font-display text-3xl text-gold">الأقسام ({categories.length})</h3>
        <div className="admin-section-card">
          <form onSubmit={handleAddCategory} className="mb-6">
            <div className="admin-form-grid cols-2">
              <div className="admin-field">
                <label className="admin-label">اسم القسم</label>
                <input
                  type="text"
                  placeholder="مثال: قصص قصيرة"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">المعرّف (slug)</label>
                <input
                  type="text"
                  placeholder="short-stories"
                  dir="ltr"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  className="admin-input"
                />
                <span className="admin-hint">أحرف إنجليزية صغيرة وأرقام وشرطات فقط.</span>
              </div>
            </div>
            {catError && (
              <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-base text-accent">
                {catError}
              </p>
            )}
            <button type="submit" className="btn-primary">+ إضافة قسم</button>
          </form>

          <div className="h-px bg-gradient-to-l from-transparent via-ink/20 to-transparent my-6" />

          <ul className="flex flex-wrap gap-2">
            {categories.map(c => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border-2 border-ink/20 bg-white/70 px-4 py-2.5 text-base text-ink">
                <span className="font-semibold">{c.name}</span>
                <span className="text-sm text-ink/50" dir="ltr">({c.slug})</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-accent text-lg hover:opacity-70" title="حذف القسم">✕</button>
              </li>
            ))}
          </ul>
          {categories.length === 0 && <p className="text-base text-ink/60">لا توجد أقسام بعد.</p>}
        </div>
      </section>
    </div>
  )
}