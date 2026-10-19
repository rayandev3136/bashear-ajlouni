import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // تعطيل الميزة التجريبية التي تتعارض مع `export const dynamic`
    cacheComponents: false,
  },
  // لإسكات التحذير الخاص بـ package-lock.json في المجلد الأعلى
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig