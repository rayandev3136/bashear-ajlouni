'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useEffect, useRef } from 'react'
import { uploadFile } from '@/lib/storage'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'اكتب هنا...' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false, allowBase64: false })],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: { dir: 'rtl', 'data-placeholder': placeholder },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const { url, error } = await uploadFile('work-images', file)
    if (error) { alert(`فشل رفع الصورة: ${error}`); return }
    if (url) editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ''
  }

  if (!editor) {
    return <div className="rounded border-2 border-[#a88c50] bg-[#fffefa] p-4 text-[#0a0600]">جارٍ تحميل المحرر...</div>
  }

  const btn = (active: boolean) =>
    `rounded px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? 'bg-[#2a1a10] text-[#f5edd8] shadow-sm'
        : 'bg-[#d4c9ab] text-[#0a0600] hover:bg-[#c4b899]'
    }`

  return (
    <div className="tiptap-shell">
      <div className="flex flex-wrap gap-1 border-b-2 border-[#a88c50]/40 bg-[#e8dcc4] p-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
          <strong>غامق</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
          <em>مائل</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive('heading', { level: 1 }))}>
          عنوان ١
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}>
          عنوان ٢
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}>
          عنوان ٣
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>
          • قائمة
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>
          ١. مرقمة
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}>
          اقتباس
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={btn(false)}>
          🖼️ صورة
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>
          تراجع
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>
          إعادة
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      <EditorContent editor={editor} />
    </div>
  )
}