import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import './globals.css'

const jomhuria = localFont({
  src: './fonts/Jomhuria-Regular.ttf',
  variable: '--font-jomhuria',
  display: 'swap',
})

const scheherazade = localFont({
  src: [{ path: './fonts/ScheherazadeNew-Regular.ttf', weight: '400', style: 'normal' }],
  variable: '--font-scheherazade',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabase
    .from('site_settings')
    .select('site_title, site_description')
    .eq('id', 1)
    .maybeSingle()

  return {
    title: data?.site_title ? `${data.site_title} — أديب وشاعر` : 'بشار عجلوني — أديب وشاعر',
    description: data?.site_description ?? 'الموقع الرسمي للأديب والشاعر بشار عجلوني — روايات، أشعار، خواطر، وإنجازات.',
  }
}

const navItems = [
  { href: '/', label: 'الرئيسية' },
  { href: '/archive?cat=novels', label: 'روايات' },
  { href: '/archive?cat=poetry', label: 'أشعار' },
  { href: '/archive?cat=achievements', label: 'إنجازات' },
  { href: '/archive?cat=thoughts', label: 'خواطر' },
  { href: '/search', label: 'بحث' },
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('site_title, site_subtitle, site_description')
    .eq('id', 1)
    .maybeSingle()

  const siteTitle = settings?.site_title ?? 'بشار عجلوني'
  const siteSubtitle = settings?.site_subtitle ?? 'أديبٌ وشاعر'

  return (
    <html lang="ar" dir="rtl" className={`${jomhuria.variable} ${scheherazade.variable}`}>
      <body className="arabic-bg min-h-screen font-body">
        <header className="border-b border-gold/15">
          <div className="mx-auto max-w-5xl px-6 pt-14 pb-8 text-center">
            <p className="mb-3 text-[11px] tracking-[0.45em] text-gold">✦ الموقع الرسمي ✦</p>
            <h1 className="name-headline">{siteTitle}</h1>
            <div className="ornament-divider mx-auto my-5 max-w-xs text-sm tracking-wide">
              <span>{siteSubtitle}</span>
            </div>
          </div>
          <nav className="border-t border-gold/10 bg-black/20">
            <ul className="nav-list">
              {navItems.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-btn">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-12">{children}</main>

        <footer className="border-t border-gold/15 bg-black/25 py-8 text-center text-sm text-warm/80">
          <div className="ornament-divider mx-auto mb-4 max-w-[150px] text-xs">✦</div>
          <p>© {new Date().getFullYear()} {siteTitle} — جميع الحقوق محفوظة</p>
          <p className="mt-2 text-xs">
            <Link href="/admin" className="text-gold/80 hover:text-gold-bright">دخول المالك</Link>
          </p>
        </footer>
      </body>
    </html>
  )
}