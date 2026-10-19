import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { stripHtml } from '@/lib/html'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ data: works }, { data: categories }] = await Promise.all([
    supabase
      .from('works')
      .select('id, title, content, category_id, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('categories').select('id, name, slug'),
  ])

  const catById = new Map((categories ?? []).map(c => [c.id, c]))

  return (
    <>
      <section className="py-10 text-center md:py-14">
        <h2 className="font-display text-4xl leading-tight text-warm md:text-6xl">
          حيث تُكتب <span className="text-gold-bright">الحكايات</span> وتُروى القصائد
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-loose text-warm/85 md:text-xl">
          رواياتٌ، أشعارٌ، خواطرٌ، وإنجازاتٌ أدبية — في مكانٍ واحدٍ يحتفي بالكلمة العربية.
        </p>
      </section>

      <section className="mt-6">
        <div className="mb-8 flex items-baseline justify-between">
          <h3 className="font-display text-4xl text-gold">أحدث الأعمال</h3>
          <Link href="/archive" className="nav-btn text-sm">الأرشيف الكامل ←</Link>
        </div>

        {!works || works.length === 0 ? (
          <div className="card-cream p-12 text-center">
            <p className="font-display text-3xl text-ink">الصفحات ما زالت بيضاء</p>
            <p className="mt-3 text-ink/75">لم يُنشَر بعدُ شيء. عُد قريباً.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {works.map(w => {
              const cat = w.category_id ? catById.get(w.category_id) : null
              const preview = stripHtml(w.content).slice(0, 180)
              return (
                <Link key={w.id} href={`/works/${w.id}`} className="card-cream block p-7">
                  {cat && (
                    <p className="mb-3 text-xs font-medium tracking-widest text-accent">{cat.name}</p>
                  )}
                  <h4 className="mb-3 font-display text-3xl leading-tight text-ink">{w.title}</h4>
                  <p className="line-clamp-3 text-base leading-relaxed text-ink/80">
                    {preview || '—'}
                  </p>
                  <div className="mt-4 h-px bg-gradient-to-l from-transparent via-gold-dim to-transparent" />
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}