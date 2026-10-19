import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { stripHtml } from '@/lib/html'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  let results: Array<{ id: string; title: string; content: string | null; created_at: string }> = []
  if (query) {
    const { data } = await supabase
      .from('works')
      .select('id, title, content, created_at')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)
    results = data ?? []
  }

  return (
    <>
      <h2 className="mb-8 font-display text-5xl text-gold">ابحث في الأعمال</h2>

      <form action="/search" className="mb-10 flex gap-3">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="عنوان، بيت شعر، كلمة..."
          className="flex-1 rounded border border-gold/35 bg-ink/55 px-5 py-3 text-warm placeholder:text-warm/50 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          className="rounded border border-gold bg-gold px-8 py-3 font-display text-xl text-ink transition hover:bg-gold-bright"
        >
          ابحث
        </button>
      </form>

      {query && (
        <div>
          <p className="mb-4 text-sm text-warm/80">
            نتائج البحث عن: <span className="text-gold-bright">{query}</span> — {results.length} نتيجة
          </p>
          {results.length === 0 ? (
            <div className="card-cream p-10 text-center text-ink/75">لا نتائج مطابقة.</div>
          ) : (
            <ul className="space-y-4">
              {results.map(w => (
                <li key={w.id}>
                  <Link href={`/works/${w.id}`} className="card-cream block p-6">
                    <h3 className="font-display text-2xl text-ink">{w.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/75">
                      {stripHtml(w.content).slice(0, 200)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}