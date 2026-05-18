<script setup lang="ts">
  import type { EditorToolbarItem } from '@nuxt/ui'

  interface Props {
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Write something...',
    disabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const content = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const toolbarItems: EditorToolbarItem[][] = [
    [
      {
        kind: 'undo',
        icon: 'i-lucide-undo',
      },
      {
        kind: 'redo',
        icon: 'i-lucide-redo',
      },
    ],
    [
      {
        icon: 'i-lucide-heading',
        content: { align: 'start' },
        items: [
          {
            kind: 'heading',
            level: 1,
            icon: 'i-lucide-heading-1',
            label: 'Heading 1',
          },
          {
            kind: 'heading',
            level: 2,
            icon: 'i-lucide-heading-2',
            label: 'Heading 2',
          },
          {
            kind: 'heading',
            level: 3,
            icon: 'i-lucide-heading-3',
            label: 'Heading 3',
          },
        ],
      },
    ],
    [
      {
        kind: 'mark',
        mark: 'bold',
        icon: 'i-lucide-bold',
      },
      {
        kind: 'mark',
        mark: 'italic',
        icon: 'i-lucide-italic',
      },
      {
        kind: 'mark',
        mark: 'underline',
        icon: 'i-lucide-underline',
      },
      {
        kind: 'mark',
        mark: 'strike',
        icon: 'i-lucide-strikethrough',
      },
      {
        kind: 'mark',
        mark: 'code',
        icon: 'i-lucide-code',
      },
    ],
    [
      {
        kind: 'bulletList',
        icon: 'i-lucide-list',
      },
      {
        kind: 'orderedList',
        icon: 'i-lucide-list-ordered',
      },
    ],
    [
      {
        kind: 'link',
        icon: 'i-lucide-link',
      },
      {
        kind: 'blockquote',
        icon: 'i-lucide-quote',
      },
      {
        kind: 'codeBlock',
        icon: 'i-lucide-square-code',
      },
      {
        kind: 'horizontalRule',
        icon: 'i-lucide-minus',
      },
    ],
  ]
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="content"
    content-type="markdown"
    :placeholder="placeholder"
    :editable="!disabled"
    class="min-h-150 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-1 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900"
  >
    <UEditorToolbar
      :editor="editor"
      :items="toolbarItems"
      class="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 m-4 rounded-tl-sm rounded-tr-sm"
    />
  </UEditor>
</template>
