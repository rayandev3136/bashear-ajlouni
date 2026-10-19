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
    .select('id, title, content, category_id, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!work) notFound()

  let categoryName: string | null = null
  if (work.category_id) {
    const { data: cat } = await supabase
      .from('categories').select('name').eq('id', work.category_id).maybeSingle()
    categoryName = cat?.name ?? null
  }

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
        <div className="ornament-divider mx-auto my-5 max-w-[150px] text-xs">✦</div>
        <p className="text-sm text-warm/70">
          {new Date(work.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div
        className="card-cream prose-ar px-6 py-12 md:px-14 md:py-16"
        dangerouslySetInnerHTML={{ __html: work.content ?? '<p>لا يوجد محتوى.</p>' }}
      />
    </article>
  )
}