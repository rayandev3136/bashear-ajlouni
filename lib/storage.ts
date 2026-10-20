import { supabase } from './supabase'

export type UploadBucket = 'covers' | 'work-images' | 'work-pdfs' | 'work-videos'

export async function uploadFile(
  bucket: UploadBucket,
  file: File,
  folder = ''
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop() || 'bin'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
  const path = folder ? `${folder}/${safeName}` : safeName

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) return { url: null, error: error.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export async function deleteFileByUrl(url: string | null | undefined) {
  if (!url) return
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!match) return
  const [, bucket, path] = match
  await supabase.storage.from(bucket).remove([path])
}

export async function uploadMultiple(
  bucket: UploadBucket,
  files: File[],
  folder = ''
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []
  for (const file of files) {
    const { url, error } = await uploadFile(bucket, file, folder)
    if (url) urls.push(url)
    if (error) errors.push(`${file.name}: ${error}`)
  }
  return { urls, errors }
}