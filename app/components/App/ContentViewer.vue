<script setup lang="ts">
  import { generateHTML } from '@tiptap/html'
  import StarterKit from '@tiptap/starter-kit'
  import Link from '@tiptap/extension-link'
  import Image from '@tiptap/extension-image'
  import TableRow from '@tiptap/extension-table-row'
  import TableCell from '@tiptap/extension-table-cell'
  import TableHeader from '@tiptap/extension-table-header'
  import TaskList from '@tiptap/extension-task-list'
  import TaskItem from '@tiptap/extension-task-item'
  import Highlight from '@tiptap/extension-highlight'
  import Underline from '@tiptap/extension-underline'
  import TextAlign from '@tiptap/extension-text-align'
  import type { JSONContent } from '@tiptap/vue-3'

  interface Props {
    content: JSONContent | string | null | undefined
    prose?: 'sm' | 'base' | 'lg' | 'xl'
    hideEmpty?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    prose: 'base',
    hideEmpty: false,
  })

  const extensions = [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    Image.configure({
      HTMLAttributes: { class: 'rtv-img' },
    }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ]

  const html = computed(() => {
    const raw = props.content
    if (!raw) return ''

    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (!trimmed) return ''
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === 'object') {
          return generateHTML(parsed as JSONContent, extensions)
        }
      } catch {
        return trimmed.startsWith('<') ? trimmed : `<p>${trimmed}</p>`
      }
    }

    if (typeof raw === 'object') {
      try {
        return generateHTML(raw as JSONContent, extensions)
      } catch {
        return ''
      }
    }

    return ''
  })

  const sizeClass = computed(() => {
    const map: Record<string, string> = {
      sm: 'prose-sm',
      base: '',
      lg: 'prose-lg',
      xl: 'prose-xl',
    }
    return map[props.prose] ?? ''
  })
</script>

<template>
  <div
    v-if="html"
    class="rtv prose max-w-none dark:prose-invert"
    :class="sizeClass"
    v-html="html"
  />
  <p
    v-else-if="!hideEmpty"
    class="text-gray-400 dark:text-gray-500 italic text-sm"
  >
    Tidak ada konten.
  </p>
</template>

<!--
  Gunakan style NON-scoped agar :deep dan selector dark mode bekerja
  dengan benar di semua kondisi SSR/CSR Nuxt.
  Semua selector di-prefix .rtv untuk mencegah global leak.
-->
<style>
  /* ─── CSS Variables — light mode ─────────────────────────────────────────── */
  .rtv {
    --rtv-text: rgb(55 65 81); /* gray-700  */
    --rtv-heading: rgb(17 24 39); /* gray-900  */
    --rtv-strong: rgb(17 24 39);
    --rtv-muted: rgb(107 114 128); /* gray-500  */
    --rtv-link: rgb(5 150 105); /* emerald-600 */
    --rtv-link-hover: rgb(4 120 87); /* emerald-700 */
    --rtv-link-deco: rgb(167 243 208); /* emerald-200 */
    --rtv-link-deco-h: rgb(52 211 153); /* emerald-400 */
    --rtv-bq-bg: rgb(236 253 245); /* emerald-50  */
    --rtv-bq-border: rgb(16 185 129); /* emerald-500 */
    --rtv-bq-text: rgb(6 78 59); /* emerald-900 */
    --rtv-code-bg: rgb(243 244 246); /* gray-100  */
    --rtv-code-text: rgb(220 38 38); /* red-600   */
    --rtv-pre-bg: rgb(17 24 39); /* gray-900  */
    --rtv-pre-text: rgb(243 244 246); /* gray-100  */
    --rtv-pre-border: rgb(55 65 81); /* gray-700  */
    --rtv-mark-bg: rgb(254 240 138); /* yellow-200 */
    --rtv-mark-text: rgb(78 52 0);
    --rtv-hr: rgb(209 250 229); /* emerald-100 */
    --rtv-th-bg: rgb(236 253 245); /* emerald-50  */
    --rtv-th-text: rgb(6 78 59); /* emerald-900 */
    --rtv-th-border: rgb(167 243 208); /* emerald-200 */
    --rtv-td-text: rgb(55 65 81);
    --rtv-td-border: rgb(209 250 229); /* emerald-100 */
    --rtv-table-border: rgb(209 250 229);
    --rtv-row-even: rgb(240 253 244 / 0.6);
    --rtv-u-deco: rgb(16 185 129); /* emerald-500 */

    line-height: 1.8;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  /* ─── CSS Variables — dark mode ──────────────────────────────────────────── */
  .dark .rtv {
    --rtv-text: rgb(229 231 235); /* gray-200  */
    --rtv-heading: rgb(255 255 255);
    --rtv-strong: rgb(255 255 255);
    --rtv-muted: rgb(156 163 175); /* gray-400  */
    --rtv-link: rgb(52 211 153); /* emerald-400 */
    --rtv-link-hover: rgb(110 231 183); /* emerald-300 */
    --rtv-link-deco: rgb(6 78 59); /* emerald-900 */
    --rtv-link-deco-h: rgb(16 185 129); /* emerald-500 */
    --rtv-bq-bg: rgb(6 78 59 / 0.2);
    --rtv-bq-border: rgb(52 211 153); /* emerald-400 */
    --rtv-bq-text: rgb(167 243 208); /* emerald-200 */
    --rtv-code-bg: rgb(31 41 55); /* gray-800  */
    --rtv-code-text: rgb(252 165 165); /* red-300   */
    --rtv-pre-bg: rgb(3 7 18);
    --rtv-pre-text: rgb(243 244 246);
    --rtv-pre-border: rgb(75 85 99); /* gray-600  */
    --rtv-mark-bg: rgb(161 98 7 / 0.4); /* amber-700/40 */
    --rtv-mark-text: rgb(253 230 138); /* yellow-200 */
    --rtv-hr: rgb(6 78 59 / 0.4);
    --rtv-th-bg: rgb(6 78 59 / 0.25);
    --rtv-th-text: rgb(167 243 208); /* emerald-200 */
    --rtv-th-border: rgb(6 78 59 / 0.6);
    --rtv-td-text: rgb(229 231 235); /* gray-200  */
    --rtv-td-border: rgb(6 78 59 / 0.3);
    --rtv-table-border: rgb(6 78 59 / 0.4);
    --rtv-row-even: rgb(6 78 59 / 0.1);
    --rtv-u-deco: rgb(52 211 153);
  }

  /* ─── Headings ───────────────────────────────────────────────────────────── */
  .rtv h1,
  .rtv h2,
  .rtv h3,
  .rtv h4,
  .rtv h5,
  .rtv h6 {
    color: var(--rtv-heading);
    font-weight: 700;
    scroll-margin-top: 5rem;
    line-height: 1.3;
  }
  .rtv h1 {
    font-size: 1.75rem;
    margin: 2rem 0 1rem;
  }
  .rtv h2 {
    font-size: 1.4rem;
    margin: 1.75rem 0 0.75rem;
  }
  .rtv h3 {
    font-size: 1.2rem;
    margin: 1.5rem 0 0.5rem;
  }
  .rtv h4 {
    font-size: 1.05rem;
    margin: 1.25rem 0 0.5rem;
  }
  .rtv h5,
  .rtv h6 {
    font-size: 1rem;
    margin: 1rem 0 0.4rem;
  }

  /* ─── Paragraph ──────────────────────────────────────────────────────────── */
  .rtv p {
    color: var(--rtv-text);
    margin: 0.75rem 0;
  }

  /* ─── Inline formatting ──────────────────────────────────────────────────── */
  .rtv strong,
  .rtv b {
    color: var(--rtv-strong);
    font-weight: 700;
  }
  .rtv em,
  .rtv i {
    color: var(--rtv-text);
    font-style: italic;
  }
  .rtv u {
    text-decoration: underline;
    text-decoration-color: var(--rtv-u-deco);
    text-underline-offset: 3px;
  }
  .rtv s {
    color: var(--rtv-muted);
  }

  /* ─── Links ──────────────────────────────────────────────────────────────── */
  .rtv a {
    color: var(--rtv-link);
    text-decoration: underline;
    text-decoration-color: var(--rtv-link-deco);
    text-underline-offset: 3px;
    transition:
      color 0.15s,
      text-decoration-color 0.15s;
  }
  .rtv a:hover {
    color: var(--rtv-link-hover);
    text-decoration-color: var(--rtv-link-deco-h);
  }

  /* ─── Lists ──────────────────────────────────────────────────────────────── */
  .rtv ul,
  .rtv ol {
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }
  .rtv ul {
    list-style-type: disc;
  }
  .rtv ol {
    list-style-type: decimal;
  }
  .rtv li {
    color: var(--rtv-text);
    margin: 0.35rem 0;
    line-height: 1.7;
  }
  .rtv li > p {
    margin: 0;
  }

  /* Nested list indentation */
  .rtv li > ul,
  .rtv li > ol {
    margin: 0.25rem 0;
  }

  /* ─── Task list ──────────────────────────────────────────────────────────── */
  .rtv ul[data-type='taskList'] {
    list-style: none;
    padding-left: 0.25rem;
  }
  .rtv ul[data-type='taskList'] li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
  }
  .rtv ul[data-type='taskList'] li > label {
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  .rtv ul[data-type='taskList'] input[type='checkbox'] {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    accent-color: rgb(16 185 129);
    cursor: default;
    pointer-events: none;
  }

  /* ─── Blockquote ─────────────────────────────────────────────────────────── */
  .rtv blockquote {
    border-left: 4px solid var(--rtv-bq-border);
    padding: 0.75rem 1rem 0.75rem 1.25rem;
    margin: 1.25rem 0;
    background-color: var(--rtv-bq-bg);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  .rtv blockquote p {
    color: var(--rtv-bq-text);
    font-style: italic;
    margin: 0;
  }

  /* ─── Inline code ────────────────────────────────────────────────────────── */
  .rtv code:not(pre code) {
    background-color: var(--rtv-code-bg);
    color: var(--rtv-code-text);
    padding: 0.15em 0.4em;
    border-radius: 0.3rem;
    font-size: 0.875em;
    font-family:
      ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  }

  /* ─── Code block ─────────────────────────────────────────────────────────── */
  .rtv pre {
    background-color: var(--rtv-pre-bg);
    color: var(--rtv-pre-text);
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 1.25rem 0;
    font-size: 0.875rem;
    line-height: 1.7;
    font-family:
      ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
    border: 1px solid var(--rtv-pre-border);
  }
  .rtv pre code {
    background: none;
    color: inherit;
    padding: 0;
    font-size: inherit;
    border-radius: 0;
  }

  /* ─── Highlight / mark ───────────────────────────────────────────────────── */
  .rtv mark {
    background-color: var(--rtv-mark-bg);
    color: var(--rtv-mark-text);
    padding: 0.1em 0.25em;
    border-radius: 0.2rem;
  }

  /* ─── Horizontal rule ────────────────────────────────────────────────────── */
  .rtv hr {
    border: none;
    border-top: 2px solid var(--rtv-hr);
    margin: 2rem 0;
  }

  /* ─── Image ──────────────────────────────────────────────────────────────── */
  .rtv img,
  .rtv .rtv-img {
    border-radius: 0.75rem;
    max-width: 100%;
    height: auto;
    margin: 1rem auto;
    display: block;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  /* ─── Table ──────────────────────────────────────────────────────────────── */
  .rtv table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.9rem;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--rtv-table-border);
  }
  .rtv th {
    background-color: var(--rtv-th-bg);
    color: var(--rtv-th-text);
    font-weight: 600;
    text-align: left;
    padding: 0.65rem 0.9rem;
    border-bottom: 2px solid var(--rtv-th-border);
  }
  .rtv td {
    padding: 0.6rem 0.9rem;
    border-bottom: 1px solid var(--rtv-td-border);
    color: var(--rtv-td-text);
    vertical-align: top;
  }
  .rtv tr:last-child td {
    border-bottom: none;
  }
  .rtv tr:nth-child(even) td {
    background-color: var(--rtv-row-even);
  }

  /* ─── Text align (dari TextAlign extension) ──────────────────────────────── */
  .rtv [style*='text-align: center'] {
    text-align: center;
  }
  .rtv [style*='text-align: right'] {
    text-align: right;
  }
  .rtv [style*='text-align: justify'] {
    text-align: justify;
  }
</style>
