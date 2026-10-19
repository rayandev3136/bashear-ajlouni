'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TiptapEditor from '@/components/TiptapEditor'

type Category = { id: string; name: string }

export default function EditWorkPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const workId = params.id

  const [checking, setChecking] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const [{ data: cats }, { data: work }] = await Promise.all([
        supabase.from('categories').select('id, name').order('created_at'),
        supabase.from('works').select('title, content, category_id').eq('id', workId).maybeSingle(),
      ])
      if (!work) { router.replace('/admin'); return }
      setCategories(cats ?? [])
      setTitle(work.title)
      setContent(work.content ?? '')
      setCategoryId(work.category_id ?? '')
      setChecking(false)
    }
    load()
  }, [router, workId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('العنوان مطلوب'); return }
    setSaving(true)
    const { error } = await supabase.from('works').update({
      title: title.trim(),
      content,
      category_id: categoryId || null,
      updated_at: new Date().toISOString(),
    }).eq('id', workId)
    setSaving(false)
    if (error) { setError(error.message); return }
    router.push('/admin')
    router.refresh()
  }

  if (checking) return <div className="py-20 text-center text-warm/70">جارٍ التحميل...</div>

  return (
    <div className="space-y-6">
      <h2 className="font-display text-5xl text-gold">تعديل العمل</h2>
      <form onSubmit={handleSubmit} className="card-cream space-y-6 p-6 md:p-8">
        <div>
          <label className="mb-1 block text-sm text-ink/85">العنوان</label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded border border-ink/25 bg-white/85 px-3 py-2 text-ink focus:border-gold-dim focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/85">القسم</label>
          <select
            value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded border border-ink/25 bg-white/85 px-3 py-2 text-ink focus:border-gold-dim focus:outline-none"
          >
            <option value="">— بدون قسم —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink/85">المحتوى</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded bg-ink px-6 py-2.5 font-display text-lg text-cream hover:bg-ink-mid disabled:opacity-60">
            {saving ? '...جارٍ الحفظ' : 'حفظ التعديلات'}
          </button>
          <button type="button" onClick={() => router.push('/admin')} className="rounded border border-ink/30 px-6 py-2.5 text-ink hover:bg-ink/10">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}