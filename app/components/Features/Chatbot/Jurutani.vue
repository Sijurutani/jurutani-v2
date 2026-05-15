<script setup lang="ts">
  const chatbot = useClientChatbot()

  const isModalOpen = ref(false)
  const messageListRef = ref<{ scrollToBottom: () => void } | null>(null)
  const inputRef = ref<{ focus: () => void } | null>(null)
  const isHistoryOpen = ref(false)

  // ── Teaser bubble (seperti UIButtonCreate) ─────────────────────────────────────
  const showTeaser = ref(false)
  const hasDismissedTeaser = ref(false)
  let teaserTimer: ReturnType<typeof setTimeout> | undefined

  function hideTeaser() {
    showTeaser.value = false
    hasDismissedTeaser.value = true
    if (teaserTimer) {
      clearTimeout(teaserTimer)
      teaserTimer = undefined
    }
  }

  onMounted(() => {
    teaserTimer = setTimeout(() => {
      if (!isModalOpen.value && !hasDismissedTeaser.value)
        showTeaser.value = true
    }, 3000)
  })

  onUnmounted(() => {
    if (teaserTimer) clearTimeout(teaserTimer)
  })

  // ── Handlers ─────────────────────────────────────────────────────────────────

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
  }

  async function handleSend(text: string) {
    await chatbot.sendMessage(text)
    nextTick(() => messageListRef.value?.scrollToBottom())
  }
</script>

<template>
  <Teleport to="body">
    <!-- ── Teaser Bubble ──────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-4 translate-y-1"
      enter-to-class="opacity-100 translate-x-0 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0 translate-y-0"
      leave-to-class="opacity-0 translate-x-4 translate-y-1"
    >
      <div
        v-if="showTeaser && !isModalOpen"
        class="fixed right-24 bottom-8 z-[70] w-56"
      >
        <!-- Close X -->
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          aria-label="Tutup"
          class="absolute -top-2.5 -left-2.5 z-10 size-7 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
          @click.stop="hideTeaser"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </UButton>

        <!-- Bubble card -->
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          class="relative w-full text-left px-4 py-3 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:-translate-y-0.5 transition-all duration-200"
          @click="openChat"
        >
          <p
            class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug"
          >
            Ada pertanyaan tentang pertanian? 🌱
          </p>
          <span
            aria-hidden="true"
            class="absolute top-1/2 -right-1.5 -translate-y-1/2 size-3.5 rotate-45 bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 [clip-path:polygon(0_0,100%_0,100%_100%)]"
          />
        </UButton>
      </div>
    </Transition>

    <!-- ── FAB ───────────────────────────────────────────────────────────── -->
    <UButton
      color="neutral"
      variant="ghost"
      type="button"
      aria-label="Buka JuruTani AI"
      class="fixed right-6 bottom-6 z-[70] size-16 rounded-full flex items-center justify-center bg-white ring-2 ring-green-200 shadow-[0_12px_32px_rgba(22,163,74,0.18),0_4px_12px_rgba(22,163,74,0.12)] dark:[background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_38%),linear-gradient(135deg,#14532d_0%,#166534_100%)] dark:ring-green-700/50 dark:shadow-[0_24px_48px_rgba(22,163,74,0.35),0_8px_18px_rgba(22,163,74,0.25)] hover:shadow-[0_16px_40px_rgba(22,163,74,0.25),0_6px_16px_rgba(22,163,74,0.18)] dark:hover:shadow-[0_28px_54px_rgba(22,163,74,0.45),0_10px_20px_rgba(22,163,74,0.32)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400/50"
      @click="openChat"
    >
      <NuxtImg
        src="/jurutani/small-transparent.webp"
        alt="JuruTani AI"
        class="size-10 object-cover rounded-full"
      />
    </UButton>

    <!-- ── Modal ───────────────────────────────────────────────────────── -->
    <UModal
      v-model:open="isModalOpen"
      :ui="{
        content:
          'max-w-md w-full h-[600px] rounded-3xl overflow-hidden flex flex-col p-0! gap-0 shadow-2xl shadow-green-900/20 ring-1 ring-green-900/10 dark:ring-white/10',
        overlay: 'backdrop-blur-md bg-black/20',
        header: 'hidden',
        body: 'p-0! flex-1 flex flex-col overflow-hidden min-h-0',
        footer: 'hidden',
      }"
    >
      <template #body>
        <!-- Header -->
        <div
          class="relative flex items-center gap-3 px-4 py-3 shrink-0 overflow-hidden bg-gradient-to-r from-green-800 via-green-600 to-green-500 text-white"
        >
          <!-- Decorative blur orb -->
          <div
            class="absolute -top-4 -right-4 size-24 rounded-full bg-green-300/20 blur-2xl pointer-events-none"
          />

          <div
            class="size-9 rounded-full bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0 backdrop-blur-sm"
          >
            <NuxtImg src="/jurutani/small-transparent.webp" alt="JuruTani" class="size-6" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-tight tracking-tight">
              JuruTani AI
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span
                class="size-1.5 bg-green-300 rounded-full animate-pulse shadow-[0_0_4px_rgba(134,239,172,0.8)]"
              />
              <span class="text-[11px] text-green-100/90 font-medium"
                >Penyuluh JuruTani</span
              >
            </div>
          </div>
          <div class="flex items-center gap-0.5">
            <UTooltip text="Riwayat" :side="'bottom'">
              <UButton
                icon="i-lucide-history"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-white/90 hover:text-white hover:bg-white/15 rounded-lg"
                :class="isHistoryOpen ? 'bg-white/15' : ''"
                @click="isHistoryOpen = !isHistoryOpen"
              />
            </UTooltip>
            <UTooltip text="Chat baru" :side="'bottom'">
              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-white/90 hover:text-white hover:bg-white/15 rounded-lg"
                @click="chatbot.newChat()"
              />
            </UTooltip>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="text-white/90 hover:text-white hover:bg-white/15 rounded-lg"
              @click="closeChat"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <!-- History Sidebar -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="-translate-x-full opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="-translate-x-full opacity-0"
          >
            <div
              v-if="isHistoryOpen"
              class="absolute inset-y-0 left-0 w-56 z-20 flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200/80 dark:border-gray-700/60 shadow-xl"
            >
              <div
                class="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800"
              >
                <span
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >Riwayat</span
                >
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="isHistoryOpen = false"
                />
              </div>

              <div
                v-if="chatbot.sessions.value.length === 0"
                class="flex-1 flex flex-col items-center justify-center p-4 gap-2 text-center"
              >
                <UIcon
                  name="i-lucide-message-circle"
                  class="size-8 text-gray-300 dark:text-gray-600"
                />
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  Belum ada riwayat.
                </p>
              </div>

              <div v-else class="flex-1 overflow-y-auto">
                <div
                  v-for="sess in chatbot.sessions.value"
                  :key="sess.id"
                  class="group flex items-start gap-1 border-b border-gray-50 dark:border-gray-800/60 transition-colors duration-150 hover:bg-green-50 dark:hover:bg-green-900/20"
                  :class="
                    sess.id === chatbot.activeSessionId.value
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  "
                >
                  <UButton
                    color="neutral"
                    variant="ghost"
                    type="button"
                    class="min-w-0 flex-1 justify-start rounded-none px-3 py-2.5 text-left hover:bg-transparent dark:hover:bg-transparent"
                    @click="loadHistorySession(sess.id)"
                  >
                    <div class="flex min-w-0 items-start gap-2">
                      <UIcon
                        name="i-lucide-message-square"
                        class="mt-0.5 size-3.5 shrink-0 text-green-500"
                      />
                      <div class="min-w-0 flex-1">
                        <p
                          class="truncate text-xs font-medium leading-snug text-gray-700 dark:text-gray-200"
                        >
                          {{ sess.title }}
                        </p>
                        <p class="mt-0.5 text-[10px] text-gray-400">
                          {{
                            new Date(sess.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })
                          }}
                        </p>
                      </div>
                    </div>
                  </UButton>
                  <div class="pr-1 pt-2.5">
                    <UButton
                      icon="i-lucide-trash-2"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      class="shrink-0 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                      @click.stop="chatbot.deleteSession(sess.id)"
                    />
                  </div>
                </div>
              </div>

              <div class="p-2 border-t border-gray-100 dark:border-gray-800">
                <UButton
                  icon="i-lucide-trash-2"
                  label="Hapus semua"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  block
                  class="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  @click="chatbot.clearAllSessions()"
                />
              </div>
            </div>
          </Transition>

          <!-- Messages -->
          <FeaturesChatbotMessageList
            ref="messageListRef"
            :messages="chatbot.messages.value"
            :is-loading="chatbot.isLoading.value"
          />
        </div>

        <!-- Input Bar -->
        <div
          class="shrink-0 px-3 py-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800"
        >
          <FeaturesChatbotInput
            ref="inputRef"
            :disabled="chatbot.isLoading.value"
            @submit="handleSend"
          />
        </div>
      </template>
    </UModal>
  </Teleport>
</template>
