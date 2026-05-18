<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
    layout: 'default',
  })

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  const {
    myId,
    conversations,
    unreadCounts,
    loadingConversations,
    fetchConversations,
    markConversationRead,
    deleteConversation,
    createOrGetAdminConversation,
  } = useMessages()

  const selectedConversationId = computed(
    () => route.params.id as string | undefined,
  )
  const showNewChatModal = ref(false)

  const isMobile = computed(() => {
    if (!import.meta.client) return false
    return window.matchMedia('(max-width: 1023px)').matches
  })

  const sidebarOpen = ref(true)

  watchEffect(() => {
    if (!import.meta.client) return
    sidebarOpen.value = !selectedConversationId.value || !isMobile.value
  })

  function openConversation(conversationId: string) {
    router.push(`/messages/${conversationId}`)
    sidebarOpen.value = false
  }

  async function handleMarkRead(conversationId: string) {
    try {
      await markConversationRead(conversationId)
    } catch (e: any) {
      toast.add({ title: 'Gagal', description: e?.message, color: 'error' })
    }
  }

  async function handleDeleteConversation(conversationId: string) {
    try {
      await deleteConversation(conversationId)
      toast.add({ title: 'Percakapan dihapus', color: 'success' })
      if (selectedConversationId.value === conversationId) {
        router.push('/messages')
      }
    } catch (e: any) {
      toast.add({
        title: 'Gagal menghapus',
        description: e?.message,
        color: 'error',
      })
    }
  }

  async function handleChatAdmin() {
    try {
      const conversationId = await createOrGetAdminConversation()
      await fetchConversations()
      openConversation(conversationId)
    } catch (e: any) {
      toast.add({
        title: 'Gagal membuka chat admin',
        description: e?.message,
        color: 'error',
      })
    }
  }

  onMounted(async () => {
    if (!authStore.isAuthenticated) return
    try {
      await fetchConversations()
      if (route.query.admin === '1') {
        const conversationId = await createOrGetAdminConversation()
        await fetchConversations()
        openConversation(conversationId)
      }
    } catch (e: any) {
      toast.add({
        title: 'Gagal memuat percakapan',
        description: e?.message,
        color: 'error',
      })
    }
  })
</script>

<template>
  <div class="lg:pt-24 pt-20">
    <div class="mx-auto max-w-[1600px] w-full px-4">
      <div
        class="h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-default bg-default shadow-xl"
      >
        <div class="flex h-full">
          <div
            class="w-full lg:w-96 border-r border-default h-full overflow-hidden"
            :class="selectedConversationId ? 'hidden lg:block' : ''"
          >
            <FeaturesMessagesSidebar
              :conversations="conversations"
              :my-id="String(myId || '')"
              :unread-counts="unreadCounts"
              :loading="loadingConversations"
              :selected-id="selectedConversationId ?? null"
              @open="openConversation"
              @mark-read="handleMarkRead"
              @delete-conv="handleDeleteConversation"
              @new-chat="showNewChatModal = true"
              @chat-admin="handleChatAdmin"
            />
          </div>

          <div class="flex-1 min-w-0 h-full overflow-hidden">
            <NuxtPage
              :conversations="conversations"
              :unread-counts="unreadCounts"
              :my-id="String(myId || '')"
              @back="router.push('/messages')"
              @refresh-list="fetchConversations()"
              @new-chat="showNewChatModal = true"
              @chat-admin="handleChatAdmin"
            />
          </div>
        </div>
      </div>
    </div>

    <FeaturesMessagesNewChat
      v-model:open="showNewChatModal"
      :my-id="String(myId || '')"
      @created="
        (id) => {
          showNewChatModal = false
          fetchConversations()
          openConversation(id)
        }
      "
    />
  </div>
</template>
