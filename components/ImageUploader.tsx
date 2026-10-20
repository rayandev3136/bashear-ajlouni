'use client'

import { useState } from 'react'
import { uploadFile } from '@/lib/storage'

interface Props {
  currentUrl: string | null
  onUploaded: (url: string | null) => void
  label?: string
}

export default function ImageUploader({ currentUrl, onUploaded, label = 'صورة الغلاف (اختياري)' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const { url, error } = await uploadFile('covers', file)
    setUploading(false)
    if (error) { setError(error); return }
    onUploaded(url)
  }

  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex flex-wrap items-start gap-5">
        {currentUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUrl} alt="غلاف" className="h-48 w-32 rounded-lg border-2 border-ink/20 object-cover shadow-lg" />
            <button
              type="button"
              onClick={() => onUploaded(null)}
              className="absolute -left-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-cream shadow-md hover:opacity-90"
              title="حذف الغلاف"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex h-48 w-32 items-center justify-center rounded-lg border-2 border-dashed border-ink/30 bg-white/30 text-sm text-ink/50">
            لا يوجد غلاف
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={uploading}
            className="block w-full text-base text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-5 file:py-3 file:text-base file:font-semibold file:text-cream hover:file:bg-ink-mid file:cursor-pointer"
          />
          {uploading && <p className="mt-2 text-base text-ink/70">...جارٍ الرفع</p>}
          {error && <p className="mt-2 text-base text-accent">{error}</p>}
          <p className="mt-2 text-sm text-ink/60">JPG / PNG / WebP — حتى 5MB</p>
        </div>
      </div>
    </div>
  )
}