<script setup lang="ts">
  import type { ConversationWithProfiles } from '~/composables/useMessages'

  const props = defineProps<{
    conversations: ConversationWithProfiles[]
    myId: string
  }>()

  const emit = defineEmits<{
    back: []
    refreshList: []
  }>()

  const route = useRoute()
  const conversationId = computed(() => route.params.id as string)

  const conversation = computed(
    () =>
      props.conversations.find((c) => c.id === conversationId.value) || null,
  )

  const otherUser = computed(() => {
    if (!conversation.value) return null
    const selfId = props.myId
    return conversation.value.participant1_id === selfId
      ? conversation.value.participant2
      : conversation.value.participant1
  })
</script>

<template>
  <div v-if="conversation && otherUser" class="h-full">
    <FeaturesMessagesChat
      :conversation-id="conversationId"
      :other-user="otherUser"
      :my-id="myId"
      @back="emit('back')"
      @refresh-list="emit('refreshList')"
    />
  </div>

  <div v-else class="h-full flex items-center justify-center p-6">
    <UAlert
      title="Percakapan tidak ditemukan"
      description="Percakapan ini mungkin sudah dihapus atau kamu tidak punya akses."
      color="error"
      icon="i-lucide-alert-triangle"
      class="max-w-md"
    />
  </div>
</template>
