<script setup lang="ts">
  interface Props {
    disabled?: boolean
    placeholder?: string
  }

  defineProps<Props>()

  const emit = defineEmits<{ submit: [message: string] }>()

  const input = ref('')
  const inputRef = ref<HTMLElement | null>(null)

  const canSend = computed(() => input.value.trim().length > 0)

  function handleSubmit() {
    const text = input.value.trim()
    if (!text) return
    input.value = ''
    emit('submit', text)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
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
  <div class="w-full">
    <div
      class="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900/70"
      :class="disabled ? 'opacity-75' : ''"
    >
      <UTextarea
        ref="inputRef"
        v-model="input"
        :placeholder="placeholder ?? 'Tanya harga, produk, kursus, atau pakar...'"
        :disabled="disabled"
        :rows="1"
        autoresize
        size="sm"
        class="min-h-10 flex-1 resize-none"
        :ui="{
          base: 'min-h-10 max-h-28 resize-none rounded-xl border-0 bg-transparent px-2.5 py-2 text-sm leading-relaxed shadow-none ring-0 placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-100 dark:bg-transparent',
        }"
        @keydown="handleKeydown"
      />

      <UTooltip text="Kirim" :side="'top'">
        <UButton
          :disabled="!canSend || disabled"
          icon="i-lucide-send-horizontal"
          color="success"
          size="sm"
          aria-label="Kirim pesan"
          class="mb-0.5 grid size-10 shrink-0 place-items-center rounded-xl shadow-sm transition disabled:opacity-40"
          @click="handleSubmit"
        />
      </UTooltip>
    </div>

    <div v-if="disabled" class="mt-2 flex items-center justify-end px-1">
      <p
        class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300"
      >
        Menunggu respons
      </p>
    </div>
  </div>
</template>
