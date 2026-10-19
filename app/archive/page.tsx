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
      .select('id, title, content, category_id, created_at')
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

      <div className="mb-10 flex flex-wrap gap-2 text-sm">
        <FilterPill href="/archive" active={!activeCat}>الكل</FilterPill>
        {(categories ?? []).map(c => (
          <FilterPill key={c.id} href={`/archive?cat=${c.slug}`} active={activeCat?.id === c.id}>
            {c.name}
          </FilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-cream p-12 text-center">
          <p className="text-ink/75">لا توجد أعمال في هذا القسم بعد.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map(w => {
            const c = w.category_id ? catById.get(w.category_id) : null
            return (
              <li key={w.id}>
                <Link href={`/works/${w.id}`} className="card-cream block p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      {c && <span className="text-xs tracking-widest text-accent">{c.name}</span>}
                      <h3 className="font-display text-2xl text-ink">{w.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/75">
                        {stripHtml(w.content).slice(0, 160)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink/55">
                      {new Date(w.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                    </span>
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

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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