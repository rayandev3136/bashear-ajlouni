'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import TiptapEditor from '@/components/TiptapEditor'
import ImageUploader from '@/components/ImageUploader'
import MultiImageUploader from '@/components/MultiImageUploader'
import FileUploader from '@/components/FileUploader'

type Category = { id: string; name: string }
type ContentType = 'text' | 'images' | 'pdf' | 'video' | 'mixed'

export default function EditWorkPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const workId = params.id

  const [checking, setChecking] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const [{ data: cats }, { data: work }] = await Promise.all([
        supabase.from('categories').select('id, name').order('created_at'),
        supabase.from('works').select('*').eq('id', workId).maybeSingle(),
      ])
      if (!work) { router.replace('/admin'); return }
      setCategories(cats ?? [])
      setTitle(work.title)
      setDescription(work.description ?? '')
      setCategoryId(work.category_id ?? '')
      setContentType((work.content_type as ContentType) ?? 'text')
      setCoverUrl(work.cover_url ?? null)
      setContent(work.content ?? '')
      setPdfUrl(work.pdf_url ?? null)
      setImageUrls(Array.isArray(work.images) ? work.images : [])
      setVideoUrl(work.video_url ?? null)
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
      description: description.trim() || null,
      category_id: categoryId || null,
      content_type: contentType,
      cover_url: coverUrl,
      content: (contentType === 'text' || contentType === 'mixed') ? content : null,
      pdf_url: (contentType === 'pdf') ? pdfUrl : null,
      images: (contentType === 'images') ? imageUrls : [],
      video_url: (contentType === 'video') ? videoUrl : null,
      updated_at: new Date().toISOString(),
    }).eq('id', workId)
    setSaving(false)
    if (error) { setError(error.message); return }
    router.push('/admin')
    router.refresh()
  }

  if (checking) return <div className="py-20 text-center text-warm/70 text-lg">جارٍ التحميل...</div>

  const contentTypeOptions: { value: ContentType; label: string }[] = [
    { value: 'text', label: 'نص مكتوب' },
    { value: 'images', label: 'صور (كل صورة صفحة)' },
    { value: 'pdf', label: 'ملف PDF' },
    { value: 'video', label: 'فيديو (رابط أو ملف)' },
    { value: 'mixed', label: 'نص + وسائط' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl text-gold">تعديل العمل</h2>
          <p className="mt-1 text-base text-warm/75">{title || '...'}</p>
        </div>
        <Link href="/admin" className="btn-secondary">← عودة إلى اللوحة</Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-section-card">
        <div className="admin-form-grid cols-2">
          <div className="admin-field">
            <label className="admin-label">العنوان *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">القسم</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="admin-select"
            >
              <option value="">— بدون قسم —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">وصف قصير (اختياري)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="admin-textarea"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">نوع المحتوى</label>
          <select
            value={contentType}
            onChange={e => setContentType(e.target.value as ContentType)}
            className="admin-select"
          >
            {contentTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <ImageUploader currentUrl={coverUrl} onUploaded={setCoverUrl} />
        </div>

        {(contentType === 'text' || contentType === 'mixed') && (
          <div className="admin-field">
            <label className="admin-label">النص</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        )}

        {contentType === 'images' && (
          <div className="admin-field">
            <MultiImageUploader urls={imageUrls} onChange={setImageUrls} />
          </div>
        )}

        {contentType === 'pdf' && (
          <div className="admin-field">
            <FileUploader
              bucket="work-pdfs"
              accept="application/pdf"
              currentUrl={pdfUrl}
              onUploaded={setPdfUrl}
              label="ملف PDF"
              hint="حتى 50MB"
            />
          </div>
        )}

        {contentType === 'video' && (
          <div className="admin-field">
            <FileUploader
              bucket="work-videos"
              accept="video/mp4,video/webm"
              currentUrl={videoUrl}
              onUploaded={setVideoUrl}
              label="ملف فيديو (اختياري)"
              hint="MP4 / WebM — حتى 100MB"
            />
            <label className="admin-label mt-4">أو رابط فيديو (يوتيوب / فيميو)</label>
            <input
              type="url"
              dir="ltr"
              value={videoUrl ?? ''}
              onChange={e => setVideoUrl(e.target.value || null)}
              className="admin-input"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-base text-accent">
            {error}
          </p>
        )}

        <div className="admin-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '...جارٍ الحفظ' : 'حفظ التعديلات'}
          </button>
          <Link href="/admin" className="btn-secondary">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}