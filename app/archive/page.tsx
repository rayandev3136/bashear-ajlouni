import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { stripHtml } from '@/lib/html'

export const dynamic = 'force-dynamic'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams

  const [{ data: categories }, { data: works }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('created_at'),
    supabase
      .from('works')
      .select('id, title, description, content, cover_url, content_type, category_id, created_at')
      .order('created_at', { ascending: false }),
  ])

  const catById = new Map((categories ?? []).map(c => [c.id, c]))
  const activeCat = cat ? (categories ?? []).find(c => c.slug === cat) : null
  const filtered = activeCat
    ? (works ?? []).filter(w => w.category_id === activeCat.id)
    : (works ?? [])

  return (
    <>
      <h2 className="mb-6 font-display text-5xl text-gold">
        {activeCat ? activeCat.name : 'الأرشيف الكامل'}
      </h2>

      {/* فلاتر الأقسام */}
      <div className="mb-10 flex flex-wrap gap-2 text-sm">
        <FilterPill href="/archive" active={!activeCat}>الكل</FilterPill>
        {(categories ?? []).map(c => (
          <FilterPill
            key={c.id}
            href={`/archive?cat=${c.slug}`}
            active={activeCat?.id === c.id}
          >
            {c.name}
          </FilterPill>
        ))}
      </div>

      {/* قائمة الأعمال */}
      {filtered.length === 0 ? (
        <div className="card-cream p-12 text-center">
          <p className="text-ink/75">لا توجد أعمال في هذا القسم بعد.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map(w => {
            const c = w.category_id ? catById.get(w.category_id) : null
            const preview = w.description?.trim()
              ? w.description
              : stripHtml(w.content).slice(0, 200)

            return (
              <li key={w.id}>
                <Link href={`/works/${w.id}`} className="card-cream flex gap-4 p-4 md:p-5">
                  {/* الغلاف */}
                  <div className="h-40 w-28 shrink-0 overflow-hidden rounded border border-ink/15 bg-ink/5">
                    {w.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.cover_url}
                        alt={w.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                        بلا غلاف
                      </div>
                    )}
                  </div>

                  {/* المحتوى */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {c && <span className="text-xs tracking-widest text-accent">{c.name}</span>}
                      </div>
                      <h3 className="mt-1 font-display text-2xl text-ink">{w.title}</h3>
                      <p className="mt-1 line-clamp-3 text-sm text-ink/75">
                        {preview || '—'}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-ink/55">
                      {new Date(w.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 transition-all ${
        active
          ? 'border-gold bg-gold text-ink shadow-lg'
          : 'border-gold/40 text-warm/85 hover:border-gold hover:text-gold-bright'
      }`}
    >
      {children}
    </Link>
  )
}