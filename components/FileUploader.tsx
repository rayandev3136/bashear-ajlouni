'use client'

import { useState } from 'react'
import { uploadFile, type UploadBucket } from '@/lib/storage'

interface Props {
  bucket: UploadBucket
  accept: string
  currentUrl: string | null
  onUploaded: (url: string | null) => void
  label: string
  hint?: string
}

export default function FileUploader({ bucket, accept, currentUrl, onUploaded, label, hint }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const { url, error } = await uploadFile(bucket, file)
    setUploading(false)
    if (error) { setError(error); return }
    onUploaded(url)
  }

  return (
    <div>
      <label className="mb-2 block text-sm text-ink/85">{label}</label>
      {currentUrl ? (
        <div className="mb-2 flex items-center gap-3 rounded border border-ink/20 bg-white/60 px-3 py-2">
          <span className="truncate text-sm text-ink/80" dir="ltr">{currentUrl.split('/').pop()}</span>
          <button
            type="button"
            onClick={() => onUploaded(null)}
            className="rounded bg-accent px-2 py-0.5 text-xs text-cream"
          >
            حذف
          </button>
        </div>
      ) : null}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-sm text-ink file:mr-3 file:rounded file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-cream hover:file:bg-ink-mid"
      />
      {uploading && <p className="mt-2 text-xs text-ink/60">...جارٍ الرفع</p>}
      {error && <p className="mt-2 text-xs text-accent">{error}</p>}
      {hint && <p className="mt-2 text-xs text-ink/50">{hint}</p>}
    </div>
  )
}