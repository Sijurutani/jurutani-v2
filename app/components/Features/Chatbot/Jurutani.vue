<script setup lang="ts">
  const chatbot = useClientChatbot()

  const isModalOpen = ref(false)
  const messageListRef = ref<{ scrollToBottom: () => void } | null>(null)
  const inputRef = ref<{ focus: () => void } | null>(null)
  const isHistoryOpen = ref(false)

  const showTeaser = ref(false)
  const hasDismissedTeaser = ref(false)
  let teaserTimer: ReturnType<typeof setTimeout> | undefined

  const activeTitle = computed(
    () => chatbot.activeSession.value?.title || 'Percakapan baru',
  )

  const sessionCount = computed(() => chatbot.sessions.value.length)

  const providerLabel = computed(() => {
    const provider = chatbot.provider.value
    if (provider === 'groq') return 'Groq'
    if (provider === 'openrouter') return 'OpenRouter'
    return 'Gemini'
  })

  function hideTeaser() {
    showTeaser.value = false
    hasDismissedTeaser.value = true
    if (teaserTimer) {
      clearTimeout(teaserTimer)
      teaserTimer = undefined
    }
  }

  function openChat() {
    chatbot.startChat()
    isModalOpen.value = true
    hideTeaser()
    nextTick(() => inputRef.value?.focus())
  }

  function closeChat() {
    isModalOpen.value = false
    isHistoryOpen.value = false
  }

  function loadHistorySession(sessionId: string) {
    chatbot.loadSession(sessionId)
    isHistoryOpen.value = false
    nextTick(() => messageListRef.value?.scrollToBottom())
  }

  async function handleSend(text: string) {
    await chatbot.sendMessage(text)
    nextTick(() => messageListRef.value?.scrollToBottom())
  }

  async function handleSuggestedPrompt(text: string) {
    await handleSend(text)
  }

  function createNewChat() {
    chatbot.newChat()
    isHistoryOpen.value = false
    nextTick(() => inputRef.value?.focus())
  }

  function formatSessionDate(date: string) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(date))
  }

  onMounted(() => {
    teaserTimer = setTimeout(() => {
      if (!isModalOpen.value && !hasDismissedTeaser.value) {
        showTeaser.value = true
      }
    }, 3000)
  })

  onUnmounted(() => {
    if (teaserTimer) clearTimeout(teaserTimer)
  })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showTeaser && !isModalOpen"
        class="fixed bottom-24 right-4 z-[70] w-[min(20rem,calc(100vw-2rem))] sm:right-24 sm:bottom-8"
      >
        <button
          type="button"
          aria-label="Tutup"
          class="absolute -left-2 -top-2 z-10 grid size-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-200"
          @click.stop="hideTeaser"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>

        <button
          type="button"
          class="group relative w-full overflow-hidden rounded-xl border border-emerald-200/80 bg-white px-4 py-3 text-left shadow-[0_16px_44px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_18px_48px_rgba(21,128,61,0.18)] dark:border-emerald-800/60 dark:bg-slate-950"
          @click="openChat"
        >
          <span
            class="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300"
          >
            <span class="size-1.5 rounded-full bg-emerald-500" />
            JuruTani AI
          </span>
          <span
            class="block text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100"
          >
            Butuh data harga, produk, atau saran budidaya?
          </span>
          <span
            aria-hidden="true"
            class="absolute -right-1 top-1/2 size-3 -translate-y-1/2 rotate-45 border-r border-t border-emerald-200 bg-white dark:border-emerald-800 dark:bg-slate-950"
          />
        </button>
      </div>
    </Transition>

    <button
      type="button"
      aria-label="Buka JuruTani AI"
      class="fixed bottom-5 right-5 z-[70] grid size-16 place-items-center rounded-2xl border border-emerald-200 bg-white shadow-[0_18px_46px_rgba(15,118,67,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,118,67,0.28)] active:translate-y-0 active:scale-95 dark:border-emerald-800/70 dark:bg-slate-950 sm:bottom-6 sm:right-6"
      @click="openChat"
    >
      <span
        class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950"
      >
        <span class="size-1.5 rounded-full bg-white" />
      </span>
      <span
        class="grid size-11 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:ring-emerald-800"
      >
        <NuxtImg
          src="/jurutani/small-transparent.webp"
          alt="JuruTani AI"
          class="size-8 object-contain"
        />
      </span>
    </button>

    <UModal
      v-model:open="isModalOpen"
      :ui="{
        content:
          'chatbot-modal-content w-[calc(100vw-1rem)] sm:w-[min(92vw,31rem)] h-[calc(100dvh-1rem)] sm:h-[min(46rem,calc(100dvh-3rem))] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden p-0! gap-0 bg-white dark:bg-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.26)] ring-1 ring-slate-900/10 dark:ring-white/10',
        overlay: 'backdrop-blur-sm bg-slate-950/32',
        header: 'hidden',
        body: 'p-0! flex h-full min-h-0 flex-col overflow-hidden',
        footer: 'hidden',
      }"
    >
      <template #body>
        <section class="flex h-full min-h-0 flex-col bg-[#f8faf7] dark:bg-slate-950">
          <header
            class="relative shrink-0 border-b border-emerald-900/10 bg-white/95 px-4 py-3 text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-950/95 dark:text-white"
          >
            <div class="flex items-center gap-3">
              <div
                class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:ring-emerald-800"
              >
                <NuxtImg
                  src="/jurutani/small-transparent.webp"
                  alt="JuruTani"
                  class="size-8 object-contain"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-bold tracking-tight">
                    JuruTani AI
                  </p>
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800"
                  >
                    <span class="size-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>
                <p class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  Penyuluh digital - {{ providerLabel }}
                </p>
              </div>

              <div class="flex items-center gap-1">
                <UTooltip text="Riwayat" :side="'bottom'">
                  <UButton
                    icon="i-lucide-history"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    aria-label="Riwayat percakapan"
                    class="rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    :class="
                      isHistoryOpen
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : ''
                    "
                    @click="isHistoryOpen = !isHistoryOpen"
                  />
                </UTooltip>
                <UTooltip text="Chat baru" :side="'bottom'">
                  <UButton
                    icon="i-lucide-square-pen"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    aria-label="Chat baru"
                    class="rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    @click="createNewChat"
                  />
                </UTooltip>
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  aria-label="Tutup chatbot"
                  class="rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  @click="closeChat"
                />
              </div>
            </div>

            <div
              class="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 dark:border-emerald-900/70 dark:bg-emerald-950/40"
            >
              <div class="min-w-0">
                <p class="truncate text-[11px] font-semibold text-emerald-900 dark:text-emerald-100">
                  {{ activeTitle }}
                </p>
                <p class="text-[10px] text-emerald-700/70 dark:text-emerald-300/70">
                  {{ sessionCount }} sesi konsultasi
                </p>
              </div>
              <UIcon
                name="i-lucide-shield-check"
                class="size-4 shrink-0 text-emerald-600 dark:text-emerald-300"
              />
            </div>
          </header>

          <div class="relative min-h-0 flex-1 overflow-hidden">
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <button
                v-if="isHistoryOpen"
                type="button"
                aria-label="Tutup riwayat"
                class="absolute inset-0 z-20 bg-slate-950/20 backdrop-blur-[1px]"
                @click="isHistoryOpen = false"
              />
            </Transition>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-x-full opacity-0"
              enter-to-class="translate-x-0 opacity-100"
              leave-active-class="transition duration-180 ease-in"
              leave-from-class="translate-x-0 opacity-100"
              leave-to-class="-translate-x-full opacity-0"
            >
              <aside
                v-if="isHistoryOpen"
                class="absolute inset-y-0 left-0 z-30 flex w-[min(21rem,86vw)] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      Riwayat
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Sesi konsultasi terbaru
                    </p>
                  </div>
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    aria-label="Tutup riwayat"
                    class="rounded-lg"
                    @click="isHistoryOpen = false"
                  />
                </div>

                <div
                  v-if="chatbot.sessions.value.length === 0"
                  class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
                >
                  <span
                    class="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500"
                  >
                    <UIcon name="i-lucide-message-circle" class="size-6" />
                  </span>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Belum ada riwayat
                  </p>
                  <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Mulai chat baru untuk menyimpan percakapan.
                  </p>
                </div>

                <div v-else class="flex-1 overflow-y-auto p-2">
                  <div
                    v-for="sess in chatbot.sessions.value"
                    :key="sess.id"
                    class="group grid grid-cols-[1fr_auto] gap-1 rounded-xl transition"
                    :class="
                      sess.id === chatbot.activeSessionId.value
                        ? 'bg-emerald-50 dark:bg-emerald-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                    "
                  >
                    <button
                      type="button"
                      class="min-w-0 px-3 py-3 text-left"
                      @click="loadHistorySession(sess.id)"
                    >
                      <span class="flex min-w-0 items-start gap-2">
                        <UIcon
                          name="i-lucide-message-square"
                          class="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                        />
                        <span class="min-w-0 flex-1">
                          <span
                            class="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100"
                          >
                            {{ sess.title }}
                          </span>
                          <span class="mt-1 block text-[10px] text-slate-500">
                            {{ formatSessionDate(sess.date) }}
                          </span>
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-label="Hapus sesi"
                      class="mr-2 mt-2 grid size-8 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/40"
                      @click.stop="chatbot.deleteSession(sess.id)"
                    >
                      <UIcon name="i-lucide-trash-2" class="size-4" />
                    </button>
                  </div>
                </div>

                <div class="border-t border-slate-100 p-3 dark:border-slate-800">
                  <UButton
                    icon="i-lucide-trash-2"
                    label="Hapus semua riwayat"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    block
                    class="justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    @click="chatbot.clearAllSessions()"
                  />
                </div>
              </aside>
            </Transition>

            <FeaturesChatbotMessageList
              ref="messageListRef"
              :messages="chatbot.messages.value"
              :is-loading="chatbot.isLoading.value"
              @suggest-prompt="handleSuggestedPrompt"
            />
          </div>

          <footer
            class="shrink-0 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
          >
            <FeaturesChatbotInput
              ref="inputRef"
              :disabled="chatbot.isLoading.value"
              @submit="handleSend"
            />
          </footer>
        </section>
      </template>
    </UModal>
  </Teleport>
</template>
