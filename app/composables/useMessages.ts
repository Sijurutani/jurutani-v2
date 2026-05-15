import type { Database } from '~/types/database.types'

type ProfileLite = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'username' | 'email' | 'avatar_url' | 'role' | 'is_admin'
>

export type ConversationRow =
  Database['public']['Tables']['conversations']['Row']
export type ConversationWithProfiles = ConversationRow & {
  participant1: ProfileLite
  participant2: ProfileLite
}

export type MessageRow = Database['public']['Tables']['messages']['Row']
export type MessageWithSender = MessageRow & { sender: ProfileLite }

const ADMIN_USERNAME = 'jurutaniku'

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export const useMessages = () => {
  const supabase = useSupabaseClient<Database>()
  const authStore = useAuthStore()

  const myId = computed(
    () =>
      authStore.user?.value?.sub ||
      authStore.user?.value?.id ||
      authStore.user?.value?.user?.id ||
      authStore.computedProfile?.id,
  )

  const loadingConversations = ref(false)
  const conversations = ref<ConversationWithProfiles[]>([])
  const unreadCounts = ref<Record<string, number>>({})

  const adminProfile = ref<ProfileLite | null>(null)

  function getOther(conv: ConversationWithProfiles, selfId: string) {
    return conv.participant1_id === selfId
      ? conv.participant2
      : conv.participant1
  }

  async function ensureAdminProfile() {
    if (adminProfile.value) return adminProfile.value
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, email, avatar_url, role, is_admin')
      .eq('username', ADMIN_USERNAME)
      .maybeSingle()
    if (error) throw error
    adminProfile.value = (data as ProfileLite) ?? null
    return adminProfile.value
  }

  async function createOrGetConversation(otherUserId: string): Promise<string> {
    const res = await supabase.rpc('create_or_get_conversation', {
      other_user_id: otherUserId,
    })
    if (res.error) throw res.error
    return res.data as unknown as string
  }

  async function createOrGetAdminConversation(): Promise<string> {
    const admin = await ensureAdminProfile()
    if (!admin?.id) throw new Error('Admin profile tidak ditemukan')
    return await createOrGetConversation(admin.id)
  }

  async function fetchConversations(opts?: { page?: number; limit?: number }) {
    const selfId = myId.value
    if (!selfId) return
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 30
    const from = (page - 1) * limit
    const to = from + limit - 1

    loadingConversations.value = true
    const { data, error } = await supabase
      .from('conversations')
      .select(
        `
        id,
        participant1_id,
        participant2_id,
        last_message,
        last_message_at,
        created_at,
        updated_at,
        participant1:profiles!conversations_participant1_id_fkey(id, full_name, username, email, avatar_url, role, is_admin),
        participant2:profiles!conversations_participant2_id_fkey(id, full_name, username, email, avatar_url, role, is_admin)
      `,
      )
      .or(`participant1_id.eq.${selfId},participant2_id.eq.${selfId}`)
      .order('last_message_at', { ascending: false })
      .range(from, to)

    loadingConversations.value = false
    if (error) throw error
    conversations.value = (data ?? []) as unknown as ConversationWithProfiles[]
    await refreshUnreadCounts()
  }

  async function refreshUnreadCounts() {
    const selfId = myId.value
    if (!selfId) return
    const ids = conversations.value.map((c) => c.id)
    if (!ids.length) {
      unreadCounts.value = {}
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', ids)
      .eq('is_read', false)
      .neq('sender_id', selfId)

    if (error) throw error

    const next: Record<string, number> = {}
    for (const row of data ?? []) {
      const cid = (row as { conversation_id: string }).conversation_id
      next[cid] = (next[cid] ?? 0) + 1
    }
    unreadCounts.value = next
  }

  async function markConversationRead(conversationId: string) {
    const res = await supabase.rpc('mark_conversation_messages_read', {
      conversation_id: conversationId,
    })
    if (res.error) throw res.error
    await refreshUnreadCounts()
  }

  async function deleteConversation(conversationId: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
    if (error) throw error
    conversations.value = conversations.value.filter(
      (c) => c.id !== conversationId,
    )
    const next = { ...unreadCounts.value }
    delete next[conversationId]
    unreadCounts.value = next
  }

  async function fetchMessages(conversationId: string, limit = 200) {
    const { data, error } = await supabase
      .from('messages')
      .select(
        '*, sender:profiles!sender_id(id, full_name, username, email, avatar_url, role, is_admin)',
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as MessageWithSender[]
  }

  async function uploadChatFile(
    conversationId: string,
    file: File,
  ): Promise<string> {
    const fileName = `${Date.now()}_${cleanFileName(file.name)}`
    const path = `${conversationId}/${fileName}`
    const { error } = await supabase.storage
      .from('chat-images')
      .upload(path, file, { upsert: false, contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('chat-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function sendMessage(params: {
    conversationId: string
    content: string
    imageUrl?: string | null
  }) {
    const selfId = myId.value
    if (!selfId) throw new Error('User tidak terautentikasi')

    const { error } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: selfId,
      content: params.content,
      image_url: params.imageUrl ?? null,
    })
    if (error) throw error
  }

  return {
    myId,
    conversations,
    unreadCounts,
    loadingConversations,
    adminProfile,

    getOther,
    ensureAdminProfile,
    createOrGetConversation,
    createOrGetAdminConversation,
    fetchConversations,
    refreshUnreadCounts,
    markConversationRead,
    deleteConversation,
    fetchMessages,
    sendMessage,
    uploadChatFile,
  }
}
