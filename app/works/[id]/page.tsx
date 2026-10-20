import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: work } = await supabase
    .from('works')
    .select('id, title, description, content, content_type, cover_url, pdf_url, images, video_url, category_id, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!work) notFound()

  let categoryName: string | null = null
  if (work.category_id) {
    const { data: cat } = await supabase
      .from('categories').select('name').eq('id', work.category_id).maybeSingle()
    categoryName = cat?.name ?? null
  }

  const images: string[] = Array.isArray(work.images) ? work.images : []

  return (
    <article>
      <Link href="/archive" className="nav-btn mb-8 inline-block text-sm">← عودة إلى الأرشيف</Link>

      <header className="mb-8 text-center">
        {categoryName && (
          <p className="mb-3 text-xs tracking-[0.3em] text-gold">{categoryName}</p>
        )}
        <h1 className="font-display text-6xl leading-tight text-warm md:text-7xl">
          {work.title}
        </h1>
        {work.description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-warm/80">{work.description}</p>
        )}
        <div className="ornament-divider mx-auto my-5 max-w-[150px] text-xs">✦</div>
        <p className="text-sm text-warm/70">
          {new Date(work.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {work.cover_url && (
        <div className="mx-auto mb-10 max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={work.cover_url} alt={work.title} className="w-full rounded-lg border border-gold/30 shadow-2xl" />
        </div>
      )}

      {/* النص */}
      {(work.content_type === 'text' || work.content_type === 'mixed') && work.content && (
        <div
          className="card-cream prose-ar px-6 py-12 md:px-14 md:py-16"
          dangerouslySetInnerHTML={{ __html: work.content }}
        />
      )}

      {/* الصور */}
      {work.content_type === 'images' && images.length > 0 && (
        <div className="space-y-6">
          {images.map((url, i) => (
            <div key={url} className="card-cream overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${work.title} — صفحة ${i + 1}`} className="w-full" />
              <p className="bg-ink/5 py-2 text-center text-xs text-ink/60">صفحة {i + 1}</p>
            </div>
          ))}
        </div>
      )}

      {/* PDF */}
      {work.content_type === 'pdf' && work.pdf_url && (
        <div className="card-cream overflow-hidden p-0">
          <iframe src={work.pdf_url} className="h-[80vh] w-full" title={work.title} />
          <div className="border-t border-ink/15 p-3 text-center">
            <a href={work.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
              فتح الملف في تبويب جديد
            </a>
          </div>
        </div>
      )}

      {/* الفيديو */}
      {work.content_type === 'video' && work.video_url && (
        <div className="card-cream overflow-hidden p-0">
          {work.video_url.includes('youtube.com') || work.video_url.includes('youtu.be') ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(work.video_url)}`}
                className="h-full w-full"
                allowFullScreen
                title={work.title}
              />
            </div>
          ) : work.video_url.includes('vimeo.com') ? (
            <div className="aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${extractVimeoId(work.video_url)}`}
                className="h-full w-full"
                allowFullScreen
                title={work.title}
              />
            </div>
          ) : (
            <video src={work.video_url} controls className="w-full" />
          )}
        </div>
      )}

      {/* في حالة النوع mixed: عرض الصور أو PDF أيضاً إن وُجدت */}
      {work.content_type === 'mixed' && images.length > 0 && (
        <div className="mt-8 space-y-6">
          {images.map((url, i) => (
            <div key={url} className="card-cream overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${work.title} — صورة ${i + 1}`} className="w-full" />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?\s]+)/)
  return m ? m[1] : ''
}

function extractVimeoId(url: string): string {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : ''
}