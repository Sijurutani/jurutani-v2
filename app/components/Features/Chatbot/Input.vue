<script setup lang="ts">
  interface Props {
    disabled?: boolean
    placeholder?: string
  }

  defineProps<Props>()

  const emit = defineEmits<{ submit: [message: string] }>()

  const input = ref('')
  const inputRef = ref<HTMLElement | null>(null)

  function handleSubmit() {
    const text = input.value.trim()
    if (!text) return
    input.value = ''
    emit('submit', text)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  defineExpose({
    focus: () => {
      const el = inputRef.value as any
      if (!el) return
      if (typeof el.focus === 'function') {
        el.focus()
        return
      }
      const root = el.$el ?? el
      const inner = root?.querySelector?.(
        'input, textarea',
      ) as HTMLElement | null
      inner?.focus?.()
    },
  })
</script>

<template>
  <div class="w-full space-y-1">
    <div class="flex gap-2 items-end">
      <UTextarea
        ref="inputRef"
        v-model="input"
        :placeholder="placeholder ?? 'Tanya tentang pertanian...'"
        :disabled="disabled"
        :rows="2"
        autoresize
        size="sm"
        class="flex-1 resize-none"
        @keydown="handleKeydown"
      />
      <UButton
        :disabled="!input.trim() || disabled"
        icon="i-lucide-send"
        color="success"
        size="sm"
        class="shrink-0 mb-0.5"
        @click="handleSubmit"
      />
    </div>
    <p class="text-[10px] text-center text-gray-400 dark:text-gray-600">
      Enter kirim · Shift+Enter baris baru
    </p>
  </div>
</template>
