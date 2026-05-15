<script setup lang="ts">
  import type { ChatMessage } from '~/composables/useAI'

  interface Props {
    messages: ChatMessage[]
    isLoading: boolean
  }

  const props = defineProps<Props>()

  const container = ref<HTMLElement | null>(null)

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

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
    last.addEventListener('animationend', () => {
      last.classList.remove('item-appear')
    })
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
    class="chat-scroll h-full overflow-y-auto px-4 py-4 space-y-4 bg-[radial-gradient(ellipse_at_top,_#f0fdf4,_#f8fafc)] dark:bg-[radial-gradient(ellipse_at_top,_#052e16,_#111827)]"
  >
    <!-- Empty state -->
    <div
      v-if="messages.length === 0 && !isLoading"
      class="flex flex-col items-center justify-center h-full gap-4 text-center px-6"
    >
      <div
        class="size-16 rounded-full bg-green-100 dark:bg-green-900/50 ring-4 ring-green-200/60 dark:ring-green-700/40 flex items-center justify-center shadow-inner"
      >
        <NuxtImg src="/jurutani/small-transparent.webp" alt="JuruTani" class="size-9" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Halo! Ada yang bisa saya bantu?
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Tanyakan seputar pertanian,<br />peternakan, atau pembangunan
        </p>
      </div>
    </div>

    <!-- Messages -->
    <template v-else>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="msg-item flex gap-2.5"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- Bot avatar -->
        <div
          v-if="msg.role === 'assistant'"
          class="shrink-0 size-7 rounded-full bg-white dark:bg-gray-800 ring-1 ring-green-200 dark:ring-green-800 shadow-sm flex items-center justify-center mt-1"
        >
          <NuxtImg src="/jurutani/small-transparent.webp" alt="Bot" class="size-4" />
        </div>

        <!-- Bubble + timestamp -->
        <div
          class="flex flex-col gap-1 max-w-[78%]"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'"
        >
          <div
            class="px-3.5 py-2.5 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-green-500/25'
                : msg.error
                  ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-700 text-red-700 dark:text-red-400 rounded-2xl rounded-bl-sm w-full shadow-sm'
                  : 'bg-white dark:bg-gray-800 ring-1 ring-gray-200/80 dark:ring-gray-700/60 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm w-full shadow-sm'
            "
          >
            <p
              v-if="msg.role === 'user'"
              class="whitespace-pre-wrap break-words"
            >
              {{ msg.content }}
            </p>
            <div
              v-else
              class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-green-800 dark:prose-headings:text-green-300 prose-a:text-green-600 dark:prose-a:text-green-400 prose-code:bg-green-50 dark:prose-code:bg-green-900/30 prose-blockquote:border-green-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
              v-html="msg.content"
            >
            </div>
          </div>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 px-1">{{
            formatTime(msg.timestamp)
          }}</span>
        </div>

        <!-- User avatar -->
        <div
          v-if="msg.role === 'user'"
          class="shrink-0 size-7 rounded-full bg-gray-500 dark:bg-gray-600 ring-1 ring-gray-400/30 shadow-sm flex items-center justify-center mt-1"
        >
          <UIcon name="i-lucide-user" class="size-4 text-gray-100" />
        </div>
      </div>
    </template>

    <!-- Loading dots -->
    <div v-if="isLoading" class="msg-item flex gap-2.5 justify-start">
      <div
        class="shrink-0 size-7 rounded-full bg-white dark:bg-gray-800 ring-1 ring-green-200 dark:ring-green-800 shadow-sm flex items-center justify-center mt-1"
      >
        <NuxtImg src="/jurutani/small-transparent.webp" alt="Bot" class="size-4" />
      </div>
      <div
        class="bg-white dark:bg-gray-800 ring-1 ring-gray-200/80 dark:ring-gray-700/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"
      >
        <div class="flex items-center gap-1.5">
          <span
            class="size-2 bg-green-400 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          />
          <span
            class="size-2 bg-green-500 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          />
          <span
            class="size-2 bg-green-600 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          />
          <span class="text-xs text-gray-400 dark:text-gray-500 ml-1"
            >Mengetik...</span
          >
        </div>
      </div>
    </div>

    <div class="h-1" />
  </div>
</template>

<style scoped>
  .chat-scroll {
    scrollbar-width: thin;
    scrollbar-color: #86efac transparent;
  }
  .chat-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .chat-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #86efac, #22c55e);
    border-radius: 4px;
  }
</style>
