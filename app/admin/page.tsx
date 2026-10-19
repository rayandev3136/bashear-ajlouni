'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Category = { id: string; name: string; slug: string }
type Work = { id: string; title: string; category_id: string | null; created_at: string }

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
        supabase.from('works').select('id, title, category_id, created_at').order('created_at', { ascending: false }),
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
    if (!/^[a-z0-9-]+$/.test(slug)) { setCatError('الـ slug يجب أن يكون أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط'); return }
    const { data, error } = await supabase.from('categories').insert({ name, slug }).select().single()
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

  if (loading) return <div className="py-20 text-center text-warm/70">جارٍ التحميل...</div>

  const catById = new Map(categories.map(c => [c.id, c]))

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl text-gold">لوحة المالك</h2>
          <p className="mt-1 text-sm text-warm/80">مرحباً، {userEmail}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/new" className="nav-btn">+ عمل جديد</Link>
          <button onClick={handleSignOut} className="nav-btn">تسجيل الخروج</button>
        </div>
      </div>

      {/* الأعمال */}
      <section>
        <h3 className="mb-4 font-display text-3xl text-gold">الأعمال ({works.length})</h3>
        {works.length === 0 ? (
          <div className="card-cream p-8 text-center text-ink/75">لا توجد أعمال بعد. أضف أول عمل!</div>
        ) : (
          <ul className="space-y-3">
            {works.map(w => {
              const cat = w.category_id ? catById.get(w.category_id) : null
              return (
                <li key={w.id} className="card-cream flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    {cat && <span className="text-xs tracking-widest text-accent">{cat.name}</span>}
                    <h4 className="font-display text-2xl text-ink">{w.title}</h4>
                    <p className="text-xs text-ink/60">
                      {new Date(w.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/works/${w.id}`} className="rounded border border-ink/25 px-3 py-1 text-sm text-ink hover:bg-ink/10">عرض</Link>
                    <Link href={`/admin/edit/${w.id}`} className="rounded bg-ink px-3 py-1 text-sm text-cream hover:bg-ink-mid">تعديل</Link>
                    <button onClick={() => handleDeleteWork(w.id)} className="rounded bg-accent px-3 py-1 text-sm text-cream hover:opacity-90">حذف</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* الأقسام */}
      <section>
        <h3 className="mb-4 font-display text-3xl text-gold">الأقسام ({categories.length})</h3>
        <div className="card-cream p-6">
          <form onSubmit={handleAddCategory} className="mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text" placeholder="اسم القسم (مثال: قصص قصيرة)"
              value={newCatName} onChange={e => setNewCatName(e.target.value)}
              className="rounded border border-ink/25 bg-white/80 px-3 py-2 text-ink focus:border-gold-dim focus:outline-none"
            />
            <input
              type="text" placeholder="slug (مثال: short-stories)" dir="ltr"
              value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)}
              className="rounded border border-ink/25 bg-white/80 px-3 py-2 text-left text-ink focus:border-gold-dim focus:outline-none"
            />
            <button type="submit" className="rounded bg-ink px-5 py-2 text-cream hover:bg-ink-mid">إضافة</button>
          </form>
          {catError && <p className="mb-4 text-sm text-accent">{catError}</p>}
          <ul className="flex flex-wrap gap-2">
            {categories.map(c => (
              <li key={c.id} className="flex items-center gap-2 rounded-full border border-ink/25 bg-white/60 px-4 py-1.5 text-sm text-ink">
                <span>{c.name}</span>
                <span className="text-xs text-ink/50" dir="ltr">({c.slug})</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-accent hover:opacity-70">✕</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}