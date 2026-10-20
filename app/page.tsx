import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { stripHtml } from '@/lib/html'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ data: works }, { data: categories }] = await Promise.all([
    supabase
      .from('works')
      .select('id, title, description, content, cover_url, content_type, category_id, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('categories').select('id, name, slug'),
  ])

  const catById = new Map((categories ?? []).map(c => [c.id, c]))

  return (
    <>
      {/* مقدمة */}
      <section className="py-10 text-center md:py-14">
        <h2 className="font-display text-4xl leading-tight text-warm md:text-6xl">
          حيث تُكتب <span className="text-gold-bright">الحكايات</span> وتُروى القصائد
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-loose text-warm/85 md:text-xl">
          رواياتٌ، أشعارٌ، خواطرٌ، وإنجازاتٌ أدبية — في مكانٍ واحدٍ يحتفي بالكلمة العربية.
        </p>
      </section>

      {/* أحدث الأعمال */}
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
              const preview = w.description?.trim()
                ? w.description
                : stripHtml(w.content).slice(0, 180)
              return (
                <Link
                  key={w.id}
                  href={`/works/${w.id}`}
                  className="card-cream block overflow-hidden p-0"
                >
                  {/* الغلاف */}
                  {w.cover_url ? (
                    <div className="aspect-[3/4] w-full overflow-hidden bg-ink/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.cover_url}
                        alt={w.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-ink/10 to-ink/5">
                      <span className="font-display text-2xl text-ink/30">بلا غلاف</span>
                    </div>
                  )}

                  {/* المحتوى */}
                  <div className="p-6 md:p-7">
                    {cat && (
                      <p className="mb-2 text-xs font-medium tracking-widest text-accent">
                        {cat.name}
                      </p>
                    )}
                    <h4 className="mb-3 font-display text-3xl leading-tight text-ink">
                      {w.title}
                    </h4>
                    <p className="line-clamp-3 text-base leading-relaxed text-ink/75">
                      {preview || '—'}
                    </p>
                    <div className="mt-4 h-px bg-gradient-to-l from-transparent via-gold-dim to-transparent" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}