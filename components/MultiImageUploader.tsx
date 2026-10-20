'use client'

import { useState } from 'react'
import { uploadMultiple } from '@/lib/storage'

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
}

export default function MultiImageUploader({ urls, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError('')
    setUploading(true)
    const { urls: newUrls, errors } = await uploadMultiple('work-images', files)
    setUploading(false)
    if (errors.length) setError(errors.join(' | '))
    onChange([...urls, ...newUrls])
    e.target.value = ''
  }

  function removeAt(i: number) {
    onChange(urls.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="mb-2 block text-sm text-ink/85">صور الصفحات (كل صورة صفحة)</label>
      {urls.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 md:grid-cols-5">
          {urls.map((u, i) => (
            <div key={u} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`صفحة ${i + 1}`} className="h-32 w-full rounded border border-ink/20 object-cover" />
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">{i + 1}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -left-2 -top-2 rounded-full bg-accent px-2 py-0.5 text-xs text-cream"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-sm text-ink file:mr-3 file:rounded file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-cream hover:file:bg-ink-mid"
      />
      {uploading && <p className="mt-2 text-xs text-ink/60">...جارٍ رفع الصور</p>}
      {error && <p className="mt-2 text-xs text-accent">{error}</p>}
    </div>
  )
}