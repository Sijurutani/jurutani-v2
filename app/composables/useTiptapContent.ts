import type { EditorSuggestionMenuItem } from '@nuxt/ui'
import type { JSONContent } from '@tiptap/vue-3'

export const NEWS_TIPTAP_SUGGESTION_ITEMS: EditorSuggestionMenuItem[][] = [
  [
    {
      type: 'label',
      label: 'Text',
    },
    {
      kind: 'paragraph',
      label: 'Paragraph',
      description: 'Teks paragraf biasa',
      icon: 'i-lucide-text',
    },
    {
      kind: 'heading',
      level: 1,
      label: 'Heading 1',
      description: 'Judul besar',
      icon: 'i-lucide-heading-1',
    },
    {
      kind: 'heading',
      level: 2,
      label: 'Heading 2',
      description: 'Judul sedang',
      icon: 'i-lucide-heading-2',
    },
    {
      kind: 'heading',
      level: 3,
      label: 'Heading 3',
      description: 'Judul kecil',
      icon: 'i-lucide-heading-3',
    },
  ],
  [
    {
      type: 'label',
      label: 'Lists',
    },
    {
      kind: 'bulletList',
      label: 'Bullet List',
      description: 'Daftar dengan bullet',
      icon: 'i-lucide-list',
    },
    {
      kind: 'orderedList',
      label: 'Numbered List',
      description: 'Daftar dengan nomor',
      icon: 'i-lucide-list-ordered',
    },
  ],
  [
    {
      type: 'label',
      label: 'Insert',
    },
    {
      kind: 'blockquote',
      label: 'Blockquote',
      description: 'Kutipan teks',
      icon: 'i-lucide-text-quote',
    },
    {
      kind: 'codeBlock',
      label: 'Code Block',
      description: 'Blok kode',
      icon: 'i-lucide-square-code',
    },
    {
      kind: 'horizontalRule',
      label: 'Divider',
      description: 'Garis pemisah',
      icon: 'i-lucide-separator-horizontal',
    },
    {
      kind: 'image',
      label: 'Image',
      description: 'Insert gambar',
      icon: 'i-lucide-image',
    },
  ],
]

export const getEmptyTiptapDoc = (): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
})

export const extractTiptapText = (
  content: JSONContent | null | undefined,
): string => {
  if (!content || typeof content !== 'object') return ''

  let text = ''

  function walk(node: any) {
    if (!node || typeof node !== 'object') return

    if (typeof node.text === 'string') {
      text += `${node.text} `
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child: any) => walk(child))
    }
  }

  walk(content)
  return text.trim()
}

export const hasMeaningfulTiptapContent = (
  content: JSONContent | null | undefined,
): boolean => {
  if (!content || typeof content !== 'object') return false
  if (!Array.isArray(content.content)) return false

  const text = extractTiptapText(content)
  return text.length > 0
}
