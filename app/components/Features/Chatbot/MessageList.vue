<script setup lang="ts">
  import type { ChatMessage } from '~/composables/useAI'

  interface Props {
    messages: ChatMessage[]
    isLoading: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{ 'suggest-prompt': [message: string] }>()

  const container = ref<HTMLElement | null>(null)

  const suggestedPrompts = [
    {
      icon: 'i-lucide-chart-no-axes-combined',
      label: 'Harga cabai hari ini',
      prompt: 'Berapa harga cabai terbaru di JuruTani?',
    },
    {
      icon: 'i-lucide-book-open',
      label: 'Cari kursus',
      prompt: 'Rekomendasikan kursus JuruTani untuk budidaya sayuran.',
    },
    {
      icon: 'i-lucide-user-round-search',
      label: 'Tanya pakar',
      prompt: 'Carikan pakar atau penyuluh untuk konsultasi hama tanaman.',
    },
  ]

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  function scrollToBottom() {
    nextTick(() => {
      container.value?.scrollTo({
        top: container.value.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  function animateLatest() {
    if (!container.value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = container.value.querySelectorAll<HTMLElement>('.msg-item')
    const last = items[items.length - 1]
    if (!last) return
    last.classList.add('item-appear')
    last.addEventListener(
      'animationend',
      () => {
        last.classList.remove('item-appear')
      },
      { once: true },
    )
  }

  watch(
    () => props.messages.length,
    () => {
      scrollToBottom()
      nextTick(animateLatest)
    },
  )

  watch(
    () => props.isLoading,
    () => {
      scrollToBottom()
      nextTick(animateLatest)
    },
  )

  defineExpose({ scrollToBottom })
</script>

<template>
  <div
    ref="container"
    class="chat-scroll h-full overflow-y-auto bg-[linear-gradient(180deg,#f8faf7_0%,#f1f5f0_100%)] px-3 py-4 dark:bg-[linear-gradient(180deg,#020617_0%,#08130f_100%)] sm:px-4"
  >
    <div
      v-if="messages.length === 0 && !isLoading"
      class="flex min-h-full flex-col justify-between gap-8 px-1 py-3"
    >
      <div class="mx-auto mt-4 flex max-w-sm flex-1 flex-col items-center justify-center text-center">
        <div
          class="mb-5 grid size-20 place-items-center rounded-2xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,118,67,0.12)] dark:border-emerald-900 dark:bg-slate-950"
        >
          <NuxtImg
            src="/jurutani/small-transparent.webp"
            alt="JuruTani"
            class="size-12 object-contain"
          />
        </div>
        <p class="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Siap bantu dari data JuruTani
        </p>
        <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Tanya harga pangan, produk marketplace, materi edukasi, atau arahkan
          ke pakar dan penyuluh yang relevan.
        </p>
      </div>

      <div class="grid gap-2">
        <button
          v-for="item in suggestedPrompts"
          :key="item.prompt"
          type="button"
          class="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40"
          @click="emit('suggest-prompt', item.prompt)"
        >
          <span
            class="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition group-hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900"
          >
            <UIcon :name="item.icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {{ item.label }}
            </span>
            <span class="block truncate text-xs text-slate-500 dark:text-slate-400">
              {{ item.prompt }}
            </span>
          </span>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-4 shrink-0 text-slate-300 transition group-hover:text-emerald-600 dark:text-slate-600"
          />
        </button>
      </div>
    </div>

    <template v-else>
      <div class="space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-item flex gap-2.5"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-900 dark:bg-slate-950"
          >
            <NuxtImg
              src="/jurutani/small-transparent.webp"
              alt="JuruTani AI"
              class="size-5 object-contain"
            />
          </div>

          <div
            class="flex max-w-[82%] flex-col gap-1 sm:max-w-[78%]"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div
              class="message-bubble px-3.5 py-2.5 text-sm leading-relaxed shadow-sm"
              :class="
                msg.role === 'user'
                  ? 'rounded-2xl rounded-br-md bg-emerald-700 text-white'
                  : msg.error
                    ? 'w-full rounded-2xl rounded-bl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
                    : 'w-full rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100'
              "
            >
              <p class="whitespace-pre-wrap break-words">
                {{ msg.content }}
              </p>
            </div>
            <span
              class="px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500"
            >
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>

          <div
            v-if="msg.role === 'user'"
            class="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-slate-800 text-white shadow-sm dark:bg-slate-700"
          >
            <UIcon name="i-lucide-user" class="size-4" />
          </div>
        </div>

        <div v-if="isLoading" class="msg-item flex gap-2.5 justify-start">
          <div
            class="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-900 dark:bg-slate-950"
          >
            <NuxtImg
              src="/jurutani/small-transparent.webp"
              alt="JuruTani AI"
              class="size-5 object-contain"
            />
          </div>
          <div
            class="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div class="flex items-center gap-2">
              <span class="typing-dot" />
              <span class="typing-dot [animation-delay:140ms]" />
              <span class="typing-dot [animation-delay:280ms]" />
              <span class="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Menyusun jawaban...
              </span>
            </div>
          </div>
        </div>

        <div class="h-1" />
      </div>
    </template>
  </div>
</template>

<style scoped>
  .chat-scroll {
    scrollbar-width: thin;
    scrollbar-color: #86efac transparent;
  }

  .chat-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .chat-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-scroll::-webkit-scrollbar-thumb {
    background: #86efac;
    border-radius: 999px;
  }

  .message-bubble {
    overflow-wrap: anywhere;
  }

  .typing-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: #10b981;
    animation: typingPulse 0.9s ease-in-out infinite;
  }

  .item-appear {
    animation: messageIn 220ms ease-out both;
  }

  @keyframes typingPulse {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.45;
    }

    40% {
      transform: translateY(-0.22rem);
      opacity: 1;
    }
  }

  @keyframes messageIn {
    from {
      opacity: 0;
      transform: translateY(0.35rem) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
