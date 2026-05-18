<script setup lang="ts">
  import { format, isToday, isYesterday, isSameDay } from 'date-fns'
  import { id as idLocale } from 'date-fns/locale'
  import type { Database } from '~/types/database.types'
  import type { MessageRow, MessageWithSender } from '~/composables/useMessages'

  type ProfileLite = Pick<
    Database['public']['Tables']['profiles']['Row'],
    'id' | 'full_name' | 'username' | 'avatar_url' | 'role'
  >

  const props = defineProps<{
    conversationId: string
    otherUser: ProfileLite
    myId: string
  }>()

  const emit = defineEmits<{
    back: []
    refreshList: []
  }>()

  const supabase = useSupabaseClient<Database>()
  const toast = useToast()
  const { fetchMessages, uploadChatFile, sendMessage } = useMessages()

  const messages = ref<MessageWithSender[]>([])
  const loadingMessages = ref(true)

  async function loadMessages() {
    loadingMessages.value = true
    try {
      messages.value = await fetchMessages(props.conversationId, 200)
    } finally {
      loadingMessages.value = false
    }
  }

  async function markRead() {
    const unreadFromOther = messages.value.filter(
      (m) => m.sender_id === props.otherUser.id && !m.is_read,
    )
    if (!unreadFromOther.length) return

    messages.value.forEach((m) => {
      if (m.sender_id === props.otherUser.id && !m.is_read) m.is_read = true
    })

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', props.conversationId)
      .eq('sender_id', props.otherUser.id)
      .eq('is_read', false)

    if (error) {
      const failed = new Set(unreadFromOther.map((m) => m.id))
      messages.value.forEach((m) => {
        if (failed.has(m.id)) m.is_read = false
      })
      return
    }
    emit('refreshList')
  }

  let pollInterval: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    if (import.meta.server) return
    pollInterval = setInterval(async () => {
      const newMessages = await fetchMessages(props.conversationId, 200)
      if (newMessages.length !== messages.value.length) {
        messages.value = newMessages
        await markRead()
        if (isNearBottom.value) scrollToBottom()
        else newMessageCount.value++
        emit('refreshList')
      } else {
        messages.value = newMessages
      }
    }, 5000)
  }

  const scrollEl = ref<HTMLElement | null>(null)
  const isNearBottom = ref(true)
  const newMessageCount = ref(0)

  function onScroll() {
    if (!scrollEl.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollEl.value
    isNearBottom.value = scrollHeight - scrollTop - clientHeight < 80
    if (isNearBottom.value) newMessageCount.value = 0
  }

  function scrollToBottom(smooth = true) {
    nextTick(() => {
      if (!scrollEl.value) return
      scrollEl.value.scrollTo({
        top: scrollEl.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      })
    })
  }

  const text = ref('')
  const sending = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const pendingFiles = ref<
    { file: File; preview: string | null; type: 'image' | 'file' }[]
  >([])

  function isImageFile(file: File) {
    return file.type.startsWith('image/')
  }

  function onFilePick(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? [])
    for (const file of files) {
      const preview = isImageFile(file) ? URL.createObjectURL(file) : null
      pendingFiles.value.push({
        file,
        preview,
        type: isImageFile(file) ? 'image' : 'file',
      })
    }
    if (fileInput.value) fileInput.value.value = ''
  }

  function removePendingFile(idx: number) {
    const f = pendingFiles.value[idx]
    if (f?.preview) URL.revokeObjectURL(f.preview)
    pendingFiles.value.splice(idx, 1)
  }

  async function doSend() {
    const content = text.value.trim()
    if (!content && pendingFiles.value.length === 0) return
    sending.value = true
    try {
      // Jika ada 1 file dan ada teks, kirim sebagai satu pesan (content + image)
      if (pendingFiles.value.length === 1 && content) {
        const pf = pendingFiles.value[0]!
        const url = await uploadChatFile(props.conversationId, pf.file)
        await sendMessage({
          conversationId: props.conversationId,
          content,
          imageUrl: url,
        })
        text.value = ''
        pendingFiles.value = []
      } else if (pendingFiles.value.length > 0) {
        for (const pf of pendingFiles.value) {
          const url = await uploadChatFile(props.conversationId, pf.file)
          await sendMessage({
            conversationId: props.conversationId,
            content:
              pf.type === 'image' ? pf.file.name || 'Foto' : pf.file.name,
            imageUrl: url,
          })
        }
        pendingFiles.value = []
      }
      // Jika hanya teks (tanpa file) kirim pesan teks biasa
      if (content && pendingFiles.value.length === 0) {
        await sendMessage({ conversationId: props.conversationId, content })
        text.value = ''
      }
      scrollToBottom()
      emit('refreshList')
    } catch (err: any) {
      toast.add({
        title: 'Gagal mengirim',
        description: err?.message,
        color: 'error',
      })
    } finally {
      sending.value = false
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      doSend()
    }
  }

  function formatDateSeparator(d: Date) {
    if (isToday(d)) return 'Hari ini'
    if (isYesterday(d)) return 'Kemarin'
    return format(d, 'EEEE, d MMMM yyyy', { locale: idLocale })
  }

  function showDateSeparator(idx: number) {
    if (idx === 0) return true
    const prev = messages.value[idx - 1]!
    const curr = messages.value[idx]!
    return !isSameDay(
      new Date(prev.created_at ?? 0),
      new Date(curr.created_at ?? 0),
    )
  }

  function formatMsgTime(t: string | null) {
    if (!t) return ''
    return format(new Date(t), 'HH:mm')
  }

  const previewImageUrl = ref<string | null>(null)
  const previewOpen = ref(false)
  function openImagePreview(url: string) {
    previewImageUrl.value = url
    previewOpen.value = true
  }

  function jumpToLatest() {
    newMessageCount.value = 0
    scrollToBottom()
  }

  // Edit & delete
  const editingMsgId = ref<string | null>(null)
  const editText = ref('')
  const savingEdit = ref(false)
  const hoveredMsgId = ref<string | null>(null)
  const deletingMsgId = ref<string | null>(null)

  async function startEdit(msg: MessageWithSender) {
    if (msg.sender_id !== props.myId) return
    editingMsgId.value = msg.id
    editText.value = msg.content
    await nextTick()
    if (import.meta.client) {
      const el = document.querySelector(
        `[data-edit-id="${msg.id}"] textarea`,
      ) as HTMLTextAreaElement | null
      el?.focus()
    }
  }

  function cancelEdit() {
    editingMsgId.value = null
    editText.value = ''
  }

  async function saveEdit() {
    if (!editingMsgId.value || !editText.value.trim()) return
    savingEdit.value = true
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('messages')
      .update({ content: editText.value.trim(), updated_at: now })
      .eq('id', editingMsgId.value)
    if (!error) {
      const idx = messages.value.findIndex((m) => m.id === editingMsgId.value)
      if (idx !== -1)
        messages.value[idx] = {
          ...messages.value[idx]!,
          content: editText.value.trim(),
          updated_at: now,
        }
      cancelEdit()
    } else {
      toast.add({
        title: 'Gagal mengedit pesan',
        description: error.message,
        color: 'error',
      })
    }
    savingEdit.value = false
  }

  function onEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  async function deleteMessage(msgId: string) {
    deletingMsgId.value = msgId
    const { error } = await supabase.from('messages').delete().eq('id', msgId)
    if (!error) {
      messages.value = messages.value.filter((m) => m.id !== msgId)
      emit('refreshList')
    } else {
      toast.add({
        title: 'Gagal menghapus pesan',
        description: error.message,
        color: 'error',
      })
    }
    deletingMsgId.value = null
  }

  function isEdited(msg: MessageWithSender) {
    return msg.updated_at !== null && msg.updated_at !== msg.created_at
  }

  onMounted(async () => {
    await loadMessages()
    await markRead()
    await nextTick()
    scrollToBottom(false)
    startPolling()
  })

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
    pendingFiles.value.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
  })
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="shrink-0 h-14 border-b border-default bg-default flex items-center px-3 gap-2"
    >
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="sm"
        class="-ms-1 lg:hidden"
        @click="emit('back')"
      />
      <UAvatar
        :src="otherUser.avatar_url ?? undefined"
        :alt="otherUser.full_name ?? otherUser.username ?? ''"
        size="sm"
      />
      <div class="min-w-0">
        <p
          class="text-sm font-semibold text-highlighted truncate leading-tight"
        >
          {{ otherUser.full_name || otherUser.username || 'Pengguna' }}
        </p>
        <div class="flex items-center gap-2">
          <p class="text-xs text-muted truncate">
            {{ otherUser.role ?? '' }}
          </p>
          <UButton
            size="2xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-user"
            :to="`/profile/${otherUser.id}`"
          >
            Profil
          </UButton>
        </div>
      </div>
    </div>

    <div
      ref="scrollEl"
      class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 relative"
      @scroll="onScroll"
    >
      <div
        v-if="loadingMessages"
        class="flex-1 flex items-center justify-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 text-muted animate-spin"
        />
      </div>

      <div
        v-else-if="!messages.length"
        class="flex-1 flex flex-col items-center justify-center gap-3 text-muted"
      >
        <UIcon name="i-lucide-message-circle" class="size-10 text-dimmed" />
        <p class="text-sm">Belum ada pesan. Mulai percakapan!</p>
      </div>

      <template v-else>
        <div v-for="(msg, idx) in messages" :key="msg.id" class="flex flex-col">
          <div
            v-if="showDateSeparator(idx)"
            class="flex items-center gap-3 my-3"
          >
            <div class="flex-1 h-px bg-default" />
            <span class="text-xs text-muted px-2 shrink-0">{{
              formatDateSeparator(new Date(msg.created_at ?? 0))
            }}</span>
            <div class="flex-1 h-px bg-default" />
          </div>

          <div
            class="flex items-end gap-2 max-w-[80%]"
            :class="
              msg.sender_id === myId
                ? 'self-end flex-row-reverse'
                : 'self-start'
            "
            @mouseenter="hoveredMsgId = msg.id"
            @mouseleave="hoveredMsgId = null"
          >
            <UAvatar
              v-if="msg.sender_id !== myId"
              :src="msg.sender?.avatar_url ?? undefined"
              :alt="msg.sender?.full_name ?? ''"
              size="xs"
              class="mb-1 shrink-0"
            />

            <Transition name="fade">
              <div
                v-if="
                  hoveredMsgId === msg.id &&
                  msg.sender_id === myId &&
                  editingMsgId !== msg.id
                "
                class="flex flex-col gap-0.5 shrink-0"
              >
                <UButton
                  v-if="!msg.image_url"
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  @click.stop="startEdit(msg)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  square
                  :loading="deletingMsgId === msg.id"
                  @click.stop="deleteMessage(msg.id)"
                />
              </div>
            </Transition>

            <div
              class="rounded-2xl px-3.5 py-2 text-sm shadow-xs max-w-full"
              :class="
                msg.sender_id === myId
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-elevated border border-default rounded-bl-sm'
              "
            >
              <div
                v-if="editingMsgId === msg.id && !msg.image_url"
                :data-edit-id="msg.id"
                class="min-w-[180px]"
              >
                <UTextarea
                  v-model="editText"
                  :rows="1"
                  autoresize
                  :maxrows="5"
                  size="sm"
                  :ui="{ base: 'resize-none' }"
                  @keydown="onEditKeydown"
                />
                <div class="flex justify-end gap-1 mt-1.5">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="cancelEdit"
                  />
                  <UButton
                    size="xs"
                    icon="i-lucide-check"
                    :loading="savingEdit"
                    @click="saveEdit"
                  />
                </div>
              </div>

              <div
                v-else-if="
                  msg.image_url &&
                  (msg.image_url.match(
                    /\\.(jpg|jpeg|png|gif|webp|svg)(\\?|$)/i,
                  ) ||
                    msg.content === '')
                "
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  type="button"
                  class="block cursor-zoom-in"
                  @click.stop="openImagePreview(msg.image_url!)"
                >
                  <NuxtImg
                    :src="msg.image_url"
                    class="max-w-56 max-h-56 rounded-lg object-cover mb-1 hover:opacity-90 transition-opacity"
                    alt="Gambar"
                    loading="lazy"
                  />
                </UButton>
                <p
                  v-if="msg.content"
                  class="wrap-break-word whitespace-pre-wrap"
                >
                  {{ msg.content }}
                </p>
              </div>

              <div v-else-if="msg.image_url" class="flex items-center gap-2">
                <div
                  class="size-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0"
                >
                  <UIcon name="i-lucide-file" class="size-4" />
                </div>
                <div class="min-w-0">
                  <a
                    :href="msg.image_url"
                    target="_blank"
                    rel="noopener"
                    class="text-sm font-medium underline truncate block"
                    >{{ msg.content || 'File' }}</a
                  >
                </div>
              </div>

              <p
                v-else
                class="wrap-break-word whitespace-pre-wrap leading-relaxed"
              >
                {{ msg.content }}
              </p>

              <div
                class="flex items-center gap-1 mt-0.5"
                :class="
                  msg.sender_id === myId ? 'justify-end' : 'justify-start'
                "
              >
                <span
                  v-if="isEdited(msg)"
                  class="text-[10px] italic leading-none"
                  :class="
                    msg.sender_id === myId ? 'text-white/50' : 'text-dimmed'
                  "
                  >diedit</span
                >
                <span
                  class="text-[10px] leading-none"
                  :class="
                    msg.sender_id === myId ? 'text-white/60' : 'text-dimmed'
                  "
                >
                  {{ formatMsgTime(msg.created_at) }}
                </span>
                <UIcon
                  v-if="msg.sender_id === myId"
                  :name="
                    msg.is_read ? 'i-lucide-check-check' : 'i-lucide-check'
                  "
                  class="size-3"
                  :class="msg.is_read ? 'text-white' : 'text-white/50'"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <Transition name="fade">
        <UButton
          v-if="!isNearBottom"
          color="neutral"
          variant="ghost"
          type="button"
          class="sticky bottom-2 self-end size-9 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all hover:bg-primary/90"
          @click="jumpToLatest"
        >
          <span
            v-if="newMessageCount > 0"
            class="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center"
            >{{ newMessageCount }}</span
          >
          <UIcon name="i-lucide-chevrons-down" class="size-4" />
        </UButton>
      </Transition>
    </div>

    <div
      v-if="pendingFiles.length"
      class="flex items-center gap-2 px-4 py-2 border-t border-default flex-wrap bg-elevated/50"
    >
      <div v-for="(pf, idx) in pendingFiles" :key="idx" class="relative group">
        <UButton
          v-if="pf.type === 'image'"
          color="neutral"
          variant="ghost"
          type="button"
          class="size-14 overflow-hidden rounded-lg border border-default p-0! hover:bg-transparent"
          :aria-label="`Pratinjau ${pf.file.name}`"
          @click="
            pf.preview && ((previewImageUrl = pf.preview), (previewOpen = true))
          "
        >
          <NuxtImg :src="pf.preview!" class="size-full object-cover" />
        </UButton>
        <div
          v-else
          class="size-14 rounded-lg border border-default bg-elevated flex flex-col items-center justify-center gap-0.5"
        >
          <UIcon name="i-lucide-file" class="size-5 text-muted" />
          <span
            class="text-[9px] text-muted text-center px-1 truncate max-w-full"
            >{{ pf.file.name }}</span
          >
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          class="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removePendingFile(idx)"
        >
          <UIcon name="i-lucide-x" class="size-2.5" />
        </UButton>
      </div>
    </div>

    <div class="px-4 py-3 border-t border-default shrink-0">
      <div class="flex items-end gap-2">
        <UTooltip text="Lampirkan file / gambar">
          <UButton
            icon="i-lucide-paperclip"
            color="neutral"
            variant="ghost"
            square
            size="sm"
            class="mb-0.5 shrink-0"
            @click="fileInput?.click()"
          />
        </UTooltip>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
          class="sr-only"
          @change="onFilePick"
        />

        <UTextarea
          v-model="text"
          class="flex-1"
          :rows="1"
          autoresize
          :maxrows="6"
          placeholder="Tulis pesan... (Enter kirim, Shift+Enter baris baru)"
          :disabled="sending"
          :ui="{ base: 'resize-none' }"
          @keydown="onKeydown"
        />

        <UButton
          icon="i-lucide-send"
          :loading="sending"
          :disabled="!text.trim() && !pendingFiles.length"
          square
          size="sm"
          class="mb-0.5 shrink-0"
          @click="doSend"
        />
      </div>
    </div>
  </div>

  <UModal
    v-model:open="previewOpen"
    :ui="{
      content: 'max-w-4xl p-0 bg-black/90 border-none',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <div class="relative flex items-center justify-center p-2">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/80 text-white"
          @click="previewOpen = false"
        />
        <NuxtImg
          v-if="previewImageUrl"
          :src="previewImageUrl"
          class="max-w-full max-h-[85vh] object-contain rounded-lg"
          alt="Preview"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
</style>
